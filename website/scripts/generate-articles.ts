#!/usr/bin/env npx tsx
/**
 * Generate article body (markdown) for each manifest entry using xAI (Grok).
 * Writes content/programs/articles/<slug>.md. Throttles requests.
 */

import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { chatCompletion } from "../src/lib/xai";
import type { ProgramArticleEntry } from "../src/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");
const THROTTLE_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function buildPrompt(entry: ProgramArticleEntry): string {
  const parts: string[] = [
    `Title: ${entry.title || entry.slug}`,
    `Author: ${entry.author}`,
  ];
  if (entry.videoTitle) parts.push(`Video title: ${entry.videoTitle}`);
  if (entry.videoDescription) {
    parts.push(`Video description:\n${entry.videoDescription.slice(0, 4000)}`);
  }
  if (entry.programPaths?.length) {
    parts.push(`Program paths: ${entry.programPaths.join(", ")}`);
  }
  if (entry.pastebinId) parts.push(`Pastebin ID: ${entry.pastebinId}`);
  if (entry.summary) parts.push(`Summary: ${entry.summary}`);
  if (entry.metaDescription) parts.push(`Meta: ${entry.metaDescription}`);

  return parts.join("\n\n");
}

const SYSTEM_PROMPT = `You are writing a short, clear guide article for a CC:Tweaked (ComputerCraft) turtle program. The article will be shown on a documentation site next to an embedded YouTube video.

Write in Markdown. Use these sections only if they fit:
- **What it does** – 1–2 sentences.
- **Setup** – What the user needs (turtle, fuel, blocks, etc.) and how to get the program (pastebin, wget, or in-game).
- **Usage** – How to run it and main options.
- **Tips** – Optional; only if the video or description mentions something useful.

Keep it concise (under 300 words). Use the video description and any program info provided. Do not invent features. If the video description is enough, summarize it; if not, keep the article short and point to the video. Output only the article body, no frontmatter or title.`;

export async function generateOneArticle(entry: ProgramArticleEntry): Promise<string> {
  const userContent = buildPrompt(entry);
  const response = await chatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    { temperature: 0.4, timeoutMs: 90_000 }
  );
  return response.trim();
}

async function main() {
  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as ProgramArticleEntry[];
  const articlesDir = path.join(CONTENT_ROOT, "articles");

  await fs.mkdir(articlesDir, { recursive: true });

  const toProcess = process.argv[2]
    ? manifest.filter((e) => e.slug === process.argv[2])
    : manifest;

  if (toProcess.length === 0) {
    console.log("No entries to process.");
    return;
  }

  console.log(`Generating articles for ${toProcess.length} entries...`);

  for (let i = 0; i < toProcess.length; i++) {
    const entry = toProcess[i];
    process.stdout.write(`  [${i + 1}/${toProcess.length}] ${entry.slug} ... `);
    try {
      const body = await generateOneArticle(entry);
      const outPath = path.join(articlesDir, `${entry.slug}.md`);
      await fs.writeFile(outPath, body, "utf-8");
      console.log("ok");
    } catch (e) {
      console.log("error:", e instanceof Error ? e.message : e);
    }
    if (i < toProcess.length - 1) await sleep(THROTTLE_MS);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
