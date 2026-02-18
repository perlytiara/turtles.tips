#!/usr/bin/env npx tsx
/**
 * Fetch Kaikaku "Turtle Programs" playlist and write video list + optional manifest seed.
 * Set YOUTUBE_PLAYLIST_ID in .env (from playlist URL: ...?list=PLxxxx).
 */

import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { fetchPlaylistItems, slugFromTitle } from "../src/lib/youtube-playlist";
import type { ProgramArticleEntry } from "../src/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");

async function main() {
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
  if (!playlistId?.trim()) {
    console.error("Set YOUTUBE_PLAYLIST_ID in .env (from playlist URL: ...?list=PLxxxx)");
    process.exit(1);
  }

  console.log("Fetching playlist items...");
  const items = await fetchPlaylistItems(playlistId);
  console.log(`Got ${items.length} videos.`);

  const videosPath = path.join(CONTENT_ROOT, "kaikaku-videos.json");
  await fs.writeFile(
    videosPath,
    JSON.stringify(items, null, 2),
    "utf-8"
  );
  console.log(`Wrote ${videosPath}`);

  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  let manifest: ProgramArticleEntry[] = [];
  try {
    const raw = await fs.readFile(manifestPath, "utf-8");
    manifest = JSON.parse(raw);
  } catch {
    // empty manifest
  }

  const bySlug = new Map(manifest.map((e) => [e.slug, e]));
  for (const item of items) {
    const slug = slugFromTitle(item.title);
    const existing = bySlug.get(slug);
    if (existing) {
      if (!existing.youtubeVideoId) {
        existing.youtubeVideoId = item.videoId;
        console.log(`Updated videoId for ${slug}`);
      }
      continue;
    }
    manifest.push({
      id: `kaikaku-ep${String(item.index).padStart(2, "0")}`,
      slug,
      title: item.title.replace(/^ComputerCraft[^:]*:\s*/i, "").trim(),
      category: "utilities",
      programPaths: [],
      youtubeVideoId: item.videoId,
      youtubePlaylistId: playlistId,
      videoTitle: null,
      videoDescription: null,
      videoPublishedAt: null,
      videoThumbnailUrl: null,
      transcriptPath: null,
      pastebinId: null,
      author: "Kaikaku",
      credits: "Kaikaku",
      metaDescription: null,
      summary: null,
    });
    bySlug.set(slug, manifest[manifest.length - 1]);
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Updated manifest with ${manifest.length} entries.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
