#!/usr/bin/env npx tsx
/**
 * Optimize originals from content/programs/images/<slug>/ to WebP in public/programs/images/<slug>/.
 * Uses snapshot to only process changed or new images. Run after generate-article-images (or when originals change).
 */

import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");
const ORIG_IMAGES = path.join(CONTENT_ROOT, "images");
const PUBLIC_IMAGES = path.join(process.cwd(), "public", "programs", "images");
const SNAPSHOT_PATH = path.join(CONTENT_ROOT, ".image-snapshot.json");

const MAIN_MAX_WIDTH = 1200;
const ILLO_MAX_WIDTH = 800;
const WEBP_QUALITY = 82;

type Snapshot = Record<string, Record<string, string>>;

async function fileHash(filePath: string): Promise<string> {
  const buf = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

async function loadSnapshot(): Promise<Snapshot> {
  try {
    const raw = await fs.readFile(SNAPSHOT_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveSnapshot(snap: Snapshot): Promise<void> {
  await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(snap, null, 2), "utf-8");
}

async function optimizeFile(src: string, dest: string, maxWidth: number): Promise<void> {
  await sharp(src)
    .resize(maxWidth, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(dest);
}

async function main() {
  const snapshot = await loadSnapshot();
  let updated = 0;

  let slugs: string[] = [];
  try {
    const entries = await fs.readdir(ORIG_IMAGES, { withFileTypes: true });
    slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    console.log("No originals folder or empty.");
    return;
  }

  for (const slug of slugs) {
    const origDir = path.join(ORIG_IMAGES, slug);
    const outDir = path.join(PUBLIC_IMAGES, slug);
    const snap = snapshot[slug] ?? {};
    let needsWork = false;
    const files = [
      { orig: "main.png", out: "main.webp", maxW: MAIN_MAX_WIDTH },
      { orig: "illo1.png", out: "illo1.webp", maxW: ILLO_MAX_WIDTH },
      { orig: "illo2.png", out: "illo2.webp", maxW: ILLO_MAX_WIDTH },
      { orig: "illo3.png", out: "illo3.webp", maxW: ILLO_MAX_WIDTH },
    ];
    for (const { orig } of files) {
      const srcPath = path.join(origDir, orig);
      try {
        const stat = await fs.stat(srcPath);
        const hash = await fileHash(srcPath);
        if (snap[orig] !== hash) {
          snap[orig] = hash;
          needsWork = true;
        }
      } catch {
        // file missing, skip
      }
    }
    if (!needsWork) continue;

    await fs.mkdir(outDir, { recursive: true });
    for (const { orig, out, maxW } of files) {
      const srcPath = path.join(origDir, orig);
      const destPath = path.join(outDir, out);
      try {
        await optimizeFile(srcPath, destPath, maxW);
        updated++;
      } catch (e) {
        // skip missing or invalid
      }
    }
    snapshot[slug] = snap;
  }

  await saveSnapshot(snapshot);

  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as Array<{
    slug: string;
    imageMainPath?: string | null;
    imageIllustrations?: { path: string }[];
  }>;
  let manifestChanged = false;
  for (const entry of manifest) {
    if (entry.imageMainPath?.endsWith(".png")) {
      entry.imageMainPath = entry.imageMainPath.replace(/\.png$/, ".webp");
      manifestChanged = true;
    }
    if (entry.imageIllustrations) {
      for (const ill of entry.imageIllustrations) {
        if (ill.path.endsWith(".png")) {
          ill.path = ill.path.replace(/\.png$/, ".webp");
          manifestChanged = true;
        }
      }
    }
  }
  if (manifestChanged) await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`Optimized ${updated} images to WebP. Snapshot updated.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
