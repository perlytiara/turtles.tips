#!/usr/bin/env npx tsx
/**
 * For each manifest entry with youtubeVideoId, fetch title/description/thumbnail and update manifest.
 * YouTube API first, Scrapfly fallback.
 */

import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { fetchVideoMetadata } from "../src/lib/video-metadata";
import type { ProgramArticleEntry } from "../src/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");

async function main() {
  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as ProgramArticleEntry[];

  let updated = 0;
  for (let i = 0; i < manifest.length; i++) {
    const entry = manifest[i];
    if (!entry.youtubeVideoId) continue;
    process.stdout.write(`  [${i + 1}/${manifest.length}] ${entry.slug} ... `);
    const meta = await fetchVideoMetadata(entry.youtubeVideoId);
    if (meta) {
      entry.videoTitle = meta.title;
      entry.videoDescription = meta.description;
      entry.videoPublishedAt = meta.publishedAt || null;
      entry.videoThumbnailUrl = meta.thumbnailUrl || null;
      if (!entry.title?.trim()) entry.title = meta.title;
      updated++;
      console.log("ok");
    } else {
      console.log("skip (no data)");
    }
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Done. Updated ${updated} entries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
