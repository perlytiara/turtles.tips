#!/usr/bin/env npx tsx
/**
 * Generate 1 main + up to 3 illustration images per article using xAI Imagine.
 * Saves originals to content/programs/images/<slug>/ (PNG). Run optimize-article-images to produce WebP in public/.
 */

import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { chatCompletion } from "../src/lib/xai";
import { generateImage } from "../src/lib/xai-imagine";
import type { ProgramArticleEntry } from "../src/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");
const ORIG_IMAGES = path.join(CONTENT_ROOT, "images");
const THROTTLE_MS = 4000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const PROMPTS_SYSTEM = `You generate short image prompts for a tech/documentation site about Minecraft ComputerCraft turtle programs. Each prompt must be one line, in English, and describe a simple, clear illustration (no text in the image). Style: clean, diagram-like or friendly illustration, suitable for a program guide. No photorealism; prefer icons, simple 3D, or flat illustration.`;

async function getImagePrompts(entry: ProgramArticleEntry): Promise<{ main: string; illustrations: string[] }> {
  const title = entry.title || entry.slug;
  const desc = (entry.videoDescription || entry.summary || entry.metaDescription || "").slice(0, 800);
  const userContent = `Program: ${title}\nAuthor: ${entry.author}\nCategory: ${entry.category}\n\nShort context: ${desc}\n\nOutput exactly 4 lines. Line 1: one main image prompt (hero image for this program). Lines 2-4: three short prompts for different aspects (e.g. setup, usage, result). Each line is one prompt only, no numbering or labels.`;

  const raw = await chatCompletion(
    [
      { role: "system", content: PROMPTS_SYSTEM },
      { role: "user", content: userContent },
    ],
    { temperature: 0.5, timeoutMs: 60_000 }
  );

  const lines = raw
    .trim()
    .split("\n")
    .map((s) => s.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
  const main = lines[0] || `Simple illustration for a computer program: ${title}`;
  const illustrations = lines.slice(1, 4);
  return { main, illustrations };
}

async function main() {
  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as ProgramArticleEntry[];

  const slugArg = process.argv[2];
  const entries = slugArg
    ? manifest.filter((e) => e.slug === slugArg)
    : manifest;

  if (entries.length === 0) {
    console.log("No entries to process.");
    return;
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const dir = path.join(ORIG_IMAGES, entry.slug);
    await fs.mkdir(dir, { recursive: true });

    process.stdout.write(`[${i + 1}/${entries.length}] ${entry.slug} ... prompts ... `);
    let mainPrompt: string;
    let illoPrompts: string[];
    try {
      const prompts = await getImagePrompts(entry);
      mainPrompt = prompts.main;
      illoPrompts = prompts.illustrations;
    } catch (e) {
      console.log("prompts error:", e instanceof Error ? e.message : e);
      continue;
    }

    const imageMainPath = `/programs/images/${entry.slug}/main.webp`;
    const imageIllustrations: { path: string; caption?: string }[] = [];

    try {
      process.stdout.write("main image ... ");
      const mainResult = await generateImage(mainPrompt, { aspect_ratio: "16:9", resolution: "1k" });
      if (mainResult) {
        const buf = Buffer.from(mainResult.base64, "base64");
        await fs.writeFile(path.join(dir, "main.png"), buf);
        entry.imageMainPath = imageMainPath;
      }
      await sleep(THROTTLE_MS);
    } catch (e) {
      console.log("main image error:", e instanceof Error ? e.message : e);
    }

    for (let j = 0; j < Math.min(3, illoPrompts.length); j++) {
      try {
        process.stdout.write(`illo ${j + 1} ... `);
        const result = await generateImage(illoPrompts[j], { aspect_ratio: "4:3", resolution: "1k" });
        if (result) {
          const name = `illo${j + 1}.png`;
          const relPath = `/programs/images/${entry.slug}/illo${j + 1}.webp`;
          await fs.writeFile(path.join(dir, name), Buffer.from(result.base64, "base64"));
          imageIllustrations.push({ path: relPath });
        }
        await sleep(THROTTLE_MS);
      } catch (e) {
        // skip this one
      }
    }

    entry.imageIllustrations = imageIllustrations;
    console.log("ok");
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("Manifest updated.");

  // Produce WebP in public/ so the site can serve them
  const { execSync } = await import("child_process");
  console.log("Running optimize-article-images...");
  execSync("npx tsx scripts/optimize-article-images.ts", { stdio: "inherit", cwd: process.cwd() });
  console.log("Done. Images are in public/programs/images/.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
