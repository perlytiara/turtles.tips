#!/usr/bin/env npx tsx
/**
 * Walk TurtlesPAC/programs and add program entries to manifest (if not already present).
 * Sets author from top-level folder (e.g. perlytiara, Kaikaku). No video; AI can still write articles from path names.
 */

import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import type { ProgramArticleEntry } from "../src/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");
const TURTLESPAC_ROOT = path.resolve(process.cwd(), "..", "TurtlesPAC");
const PROGRAMS_ROOT = path.join(TURTLESPAC_ROOT, "programs");

async function walkProgramPaths(): Promise<{ path: string; author: string; name: string }[]> {
  const out: { path: string; author: string; name: string }[] = [];
  let entries: { name: string }[] = [];
  try {
    entries = await fs.readdir(PROGRAMS_ROOT, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const fullPath = path.join(PROGRAMS_ROOT, e.name);
    const stat = await fs.stat(fullPath).catch(() => null);
    if (!stat?.isDirectory()) continue;
    const author = e.name;
    const subPath = path.join(PROGRAMS_ROOT, e.name);
    const subEntries = await fs.readdir(subPath, { withFileTypes: true }).catch(() => []);
    for (const sub of subEntries) {
      if (sub.name.startsWith(".")) continue;
      const relPath = `${author}/${sub.name}`;
      const subFull = path.join(subPath, sub.name);
      const subStat = await fs.stat(subFull).catch(() => null);
      if (subStat?.isDirectory()) {
        out.push({ path: relPath, author, name: sub.name });
      } else if (sub.name.endsWith(".lua")) {
        out.push({ path: relPath, author, name: sub.name.replace(/\.lua$/, "") });
      }
    }
  }

  return out;
}

function slugFromPath(programPath: string): string {
  return programPath
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9/-]/g, "")
    .replace(/\//g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "program";
}

async function main() {
  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  let manifest: ProgramArticleEntry[] = [];
  try {
    const raw = await fs.readFile(manifestPath, "utf-8");
    manifest = JSON.parse(raw);
  } catch {
    // empty
  }

  const existingPaths = new Set(manifest.flatMap((e) => e.programPaths));
  const existingSlugs = new Set(manifest.map((e) => e.slug));

  const programs = await walkProgramPaths();
  let added = 0;
  for (const { path: programPath, author, name } of programs) {
    if (existingPaths.has(programPath)) continue;
    const slug = slugFromPath(programPath);
    if (existingSlugs.has(slug)) continue;
    manifest.push({
      id: `pac-${slug}`,
      slug,
      title: name,
      category: "utilities",
      programPaths: [programPath],
      youtubeVideoId: null,
      youtubePlaylistId: null,
      videoTitle: null,
      videoDescription: null,
      videoPublishedAt: null,
      videoThumbnailUrl: null,
      transcriptPath: null,
      pastebinId: null,
      author,
      credits: author,
      metaDescription: null,
      summary: null,
    });
    existingSlugs.add(slug);
    existingPaths.add(programPath);
    added++;
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Discovered ${programs.length} program paths; added ${added} new manifest entries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
