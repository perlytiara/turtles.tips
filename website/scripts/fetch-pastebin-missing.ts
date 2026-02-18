#!/usr/bin/env npx tsx
/**
 * Fetch missing programs from Pastebin (from manifest video descriptions) and write
 * to perlytiara (fork) and to the guide's author folder (e.g. Kaikaku) when present.
 * Only fetches when the file doesn't already exist under perlytiara.
 */

import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { fetchPastebinRaw } from "../src/lib/pastebin";
import type { ProgramArticleEntry } from "../src/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");
const TURTLESPAC_ROOT = path.resolve(process.cwd(), "..", "TurtlesPAC");
const PROGRAMS_ROOT = path.join(TURTLESPAC_ROOT, "programs");
const PERLYTIARA_DIR = path.join(PROGRAMS_ROOT, "perlytiara");
const THROTTLE_MS = 2500;

const PASTEBIN_GET_RE = /pastebin\s+get\s+([A-Za-z0-9]+)\s+(\w+)/gi;

function extractPastebinRefs(entry: ProgramArticleEntry): { id: string; name: string; author: string }[] {
  const text = [entry.videoDescription, entry.summary, entry.metaDescription]
    .filter(Boolean)
    .join("\n");
  const seen = new Set<string>();
  const out: { id: string; name: string; author: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = PASTEBIN_GET_RE.exec(text)) !== null) {
    const id = m[1];
    const name = m[2].trim();
    if (!name) continue;
    const key = `${id}:${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id, name, author: entry.author || "" });
  }
  return out;
}

function fileNameFor(name: string): string {
  return name.endsWith(".lua") ? name : `${name}.lua`;
}

function authorFolder(author: string): string | null {
  const a = (author || "").trim().replace(/[\/\\]/g, "");
  return a.length > 0 ? a : null;
}

async function existsUnderPrograms(relPath: string): Promise<boolean> {
  try {
    await fs.access(path.join(PROGRAMS_ROOT, relPath));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as ProgramArticleEntry[];

  const refs: { id: string; name: string; slug: string; author: string }[] = [];
  for (const e of manifest) {
    for (const { id, name, author } of extractPastebinRefs(e)) {
      refs.push({ id, name, slug: e.slug, author });
    }
  }
  const deduped = Array.from(
    new Map(refs.map((r) => [`${r.id}:${r.name}`, r])).values()
  );

  let fetched = 0;
  let skipped = 0;
  for (const { id, name, author } of deduped) {
    const file = fileNameFor(name);
    const perlytiaraPath = `perlytiara/${file}`;
    const perlytiaraExists = await existsUnderPrograms(perlytiaraPath);
    const authorDirName = authorFolder(author);
    const authorRel = authorDirName ? `${authorDirName}/${file}` : null;
    const authorExists = authorRel ? await existsUnderPrograms(authorRel) : false;

    if (perlytiaraExists && (authorRel === null || authorExists)) {
      skipped++;
      continue;
    }

    let content: string;
    if (perlytiaraExists) {
      content = await fs.readFile(path.join(PROGRAMS_ROOT, perlytiaraPath), "utf-8");
      content = content.replace(/^-- Fork from Pastebin[\s\S]*?Imported for turtles\.tips\.\n\n?/i, "").trim();
    } else {
      process.stdout.write(`Fetching ${name} (${id}) ... `);
      content = (await fetchPastebinRaw(id)) ?? "";
      if (!content || content.length < 10) {
        console.log("failed or empty");
        continue;
      }
    }

    const written: string[] = [];
    if (!perlytiaraExists) {
      const forkHeader = `-- Fork from Pastebin ${id}, unchanged. Original author credited in guide.\n-- Imported for turtles.tips.\n\n`;
      const perlytiaraOut = path.join(PERLYTIARA_DIR, file);
      await fs.mkdir(path.dirname(perlytiaraOut), { recursive: true });
      await fs.writeFile(perlytiaraOut, forkHeader + content, "utf-8");
      written.push(perlytiaraPath);
      fetched++;
    }

    if (authorRel && authorDirName && authorDirName.toLowerCase() !== "perlytiara" && !authorExists) {
      const authorOut = path.join(PROGRAMS_ROOT, authorDirName, file);
      await fs.mkdir(path.dirname(authorOut), { recursive: true });
      const authorHeader = `-- From Pastebin ${id}. Imported for turtles.tips.\n\n`;
      await fs.writeFile(authorOut, authorHeader + content, "utf-8");
      written.push(authorRel);
      if (perlytiaraExists) console.log(`Backfill ${name} → ${authorRel}`);
    }

    if (written.length > 0 && !perlytiaraExists) console.log(`written ${written.join(", ")}`);
    if (!perlytiaraExists) await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }

  console.log(`Done. Fetched ${fetched}, skipped ${skipped} (already present).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
