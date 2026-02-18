#!/usr/bin/env npx tsx
/**
 * Sync manifest image paths from disk. For each manifest entry, if
 * public/programs/images/<slug>/main.webp exists, set imageMainPath and
 * imageIllustrations from present illo1–3.webp. Use after optimize-article-images
 * so the site shows images without waiting for generate-article-images to finish.
 */

import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

function getProjectRoot(): string {
  try {
    const dir = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(dir, "..");
  } catch {
    return process.cwd();
  }
}
const ROOT = getProjectRoot();
const CONTENT_ROOT = path.join(ROOT, "content", "programs");
const PUBLIC_IMAGES = path.join(ROOT, "public", "programs", "images");

type ManifestEntry = {
  slug: string;
  imageMainPath?: string | null;
  imageIllustrations?: { path: string; caption?: string }[];
  [key: string]: unknown;
};

async function main() {
  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as ManifestEntry[];

  let updated = 0;
  for (const entry of manifest) {
    const slugDir = path.join(PUBLIC_IMAGES, entry.slug);
    const mainPath = path.join(slugDir, "main.webp");
    let hasMain = false;
    try {
      await fs.access(mainPath);
      hasMain = true;
    } catch {
      // no main image
    }
    if (!hasMain) continue;

    const imageMainPath = `/programs/images/${entry.slug}/main.webp`;
    const illustrations: { path: string; caption?: string }[] = [];
    for (let j = 1; j <= 3; j++) {
      const illoPath = path.join(slugDir, `illo${j}.webp`);
      try {
        await fs.access(illoPath);
        illustrations.push({ path: `/programs/images/${entry.slug}/illo${j}.webp` });
      } catch {
        // skip
      }
    }

    if (entry.imageMainPath !== imageMainPath || JSON.stringify(entry.imageIllustrations) !== JSON.stringify(illustrations)) {
      entry.imageMainPath = imageMainPath;
      entry.imageIllustrations = illustrations;
      updated++;
    }
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  const withImages = manifest.filter((e) => e.imageMainPath).length;
  console.log(`Synced image paths for ${updated} entries. ${withImages} entries now have images.`);
  if (updated === 0 && manifest.length > 0 && withImages === 0) {
    console.log("Tip: run from the website directory (where package.json is). Run npm run optimize-article-images so public/programs/images/<slug>/main.webp exist.");
  } else if (updated === 0 && withImages > 0) {
    console.log("Manifest already up to date.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
