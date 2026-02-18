#!/usr/bin/env npx tsx
/**
 * Build search index from manifest + program file excerpts (path, code snippet).
 * Writes public/programs/search-index.json for client-side live search.
 */

import path from "path";
import fs from "fs/promises";
import type { ProgramArticleEntry } from "../src/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");
const TURTLESPAC_ROOT = path.resolve(process.cwd(), "..", "TurtlesPAC");
const PROGRAMS_ROOT = path.join(TURTLESPAC_ROOT, "programs");
const INDEX_PATH = path.join(process.cwd(), "public", "programs", "search-index.json");
const CODE_EXCERPT_LEN = 600;

export type SearchIndexEntry = {
  slug: string;
  title: string;
  author: string;
  category: string;
  paths: string[];
  codeExcerpt: string;
};

async function readExcerpt(programPath: string): Promise<string> {
  const fullPath = path.join(PROGRAMS_ROOT, programPath);
  try {
    const raw = await fs.readFile(fullPath, "utf-8");
    const excerpt = raw.slice(0, CODE_EXCERPT_LEN).replace(/\s+/g, " ").trim();
    return excerpt;
  } catch {
    return "";
  }
}

async function main() {
  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  let manifest: ProgramArticleEntry[] = [];
  try {
    const raw = await fs.readFile(manifestPath, "utf-8");
    manifest = JSON.parse(raw);
  } catch {
    // no manifest or invalid
  }

  const index: SearchIndexEntry[] = [];
  for (const entry of manifest) {
    let codeExcerpt = "";
    if (entry.programPaths?.length) {
      const parts = await Promise.all(entry.programPaths.map(readExcerpt));
      codeExcerpt = parts.filter(Boolean).join(" ");
    }
    index.push({
      slug: entry.slug,
      title: entry.title || entry.slug,
      author: entry.author,
      category: entry.category || "utilities",
      paths: entry.programPaths ?? [],
      codeExcerpt,
    });
  }

  await fs.mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await fs.writeFile(INDEX_PATH, JSON.stringify(index), "utf-8");
  console.log(`Search index: ${index.length} entries → ${INDEX_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
