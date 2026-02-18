#!/usr/bin/env npx tsx
/**
 * Normalize manifest: assign categories from keywords, sort by category then id.
 * Optionally apply programPaths from kaikaku-categories.json.
 */

import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import type { ProgramArticleEntry } from "../src/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");

const CATEGORY_ORDER: Record<string, number> = {
  mining: 1,
  farming: 2,
  building: 3,
  utilities: 4,
  _: 5,
};

interface CategoryRule {
  id: string;
  order: number;
  keywords: string[];
}

async function main() {
  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as ProgramArticleEntry[];

  let categoriesPath: string;
  let categories: CategoryRule[] = [];
  let programPathsMap: Record<string, string[]> = {};
  try {
    categoriesPath = path.join(CONTENT_ROOT, "kaikaku-categories.json");
    const catRaw = await fs.readFile(categoriesPath, "utf-8");
    const data = JSON.parse(catRaw) as {
      categories?: CategoryRule[];
      programPaths?: Record<string, string[]>;
    };
    categories = data.categories ?? [];
    programPathsMap = data.programPaths ?? {};
  } catch {
    // no file, use defaults
  }

  for (const entry of manifest) {
    const search = `${entry.title} ${entry.slug} ${entry.id}`.toLowerCase();
    let found = false;
    for (const cat of categories) {
      if (cat.keywords.some((k) => search.includes(k.toLowerCase()))) {
        entry.category = cat.id;
        found = true;
        break;
      }
    }
    if (!found) entry.category = entry.category || "utilities";

    const epMatch = entry.id.match(/ep(\d+)/i);
    if (epMatch && programPathsMap[`ep${epMatch[1]}`]?.length) {
      entry.programPaths = programPathsMap[`ep${epMatch[1]}`];
    }
  }

  const orderNum = (e: ProgramArticleEntry) => CATEGORY_ORDER[e.category] ?? 99;
  manifest.sort((a, b) => {
    const o = orderNum(a) - orderNum(b);
    if (o !== 0) return o;
    return (a.id || "").localeCompare(b.id || "");
  });

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Normalized ${manifest.length} entries (categories + sort).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
