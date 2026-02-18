#!/usr/bin/env npx tsx
/**
 * Use AI to assign programPaths to manifest entries that are missing them.
 * Considers: video description (pastebin get, program names), author, perlytiara fork vs
 * original, duplicates, "required if using multi", etc. Run from website/ with XAI_API_KEY set.
 */

import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { chatCompletion } from "../src/lib/xai";
import type { ProgramArticleEntry } from "../src/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");
const TURTLESPAC_ROOT = path.resolve(process.cwd(), "..", "TurtlesPAC");
const PROGRAMS_ROOT = path.join(TURTLESPAC_ROOT, "programs");
const THROTTLE_MS = 2000;

async function walkAllLuaPaths(dir: string, prefix = ""): Promise<string[]> {
  const out: string[] = [];
  let entries: { name: string; isDirectory(): boolean }[] = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) {
      out.push(...(await walkAllLuaPaths(path.join(dir, e.name), rel)));
    } else if (e.name.endsWith(".lua")) {
      out.push(rel);
    }
  }
  return out;
}

function extractProgramNames(entry: ProgramArticleEntry): string[] {
  const names: string[] = [];
  const title = (entry.title || entry.slug || "").toLowerCase();
  const desc = (entry.videoDescription || entry.summary || entry.metaDescription || "").toLowerCase();
  const combined = `${title} ${desc}`;
  const pastebinRe = /pastebin\s+get\s+[\w]+\s+(\w+)/gi;
  let m: RegExpExecArray | null;
  while ((m = pastebinRe.exec(combined)) !== null) names.push(m[1]);
  const tLoaderRe = /tloader\s+(\w+)/gi;
  while ((m = tLoaderRe.exec(combined)) !== null) names.push(m[1]);
  const quotedRe = /(?:program|get|download|run)\s+["']?(\w+)["']?/gi;
  while ((m = quotedRe.exec(combined)) !== null) names.push(m[1]);
  const words = title.split(/\s+/).filter((w) => w.length > 2 && /^[a-z0-9]+$/i.test(w));
  for (const w of words) {
    if (["the", "and", "for", "with", "from", "using", "program", "turtle", "episode"].includes(w)) continue;
    names.push(w);
  }
  return [...new Set(names)];
}

async function suggestPathsForEntry(
  entry: ProgramArticleEntry,
  allPaths: string[]
): Promise<string[]> {
  const programNames = extractProgramNames(entry);
  const authorLower = (entry.author || "").toLowerCase();
  const sorted = [...allPaths].sort((a, b) => {
    const aAuthor = a.split("/")[0]?.toLowerCase() ?? "";
    const bAuthor = b.split("/")[0]?.toLowerCase() ?? "";
    const aMatch = aAuthor === authorLower || aAuthor === "perlytiara" ? 0 : 1;
    const bMatch = bAuthor === authorLower || bAuthor === "perlytiara" ? 0 : 1;
    if (aMatch !== bMatch) return aMatch - bMatch;
    return a.localeCompare(b);
  });
  const pathList = sorted.slice(0, 600).join("\n");
  const systemPrompt = `You are matching program guide articles to file paths in a repository. Paths are relative to "programs/" and look like: Author/file.lua or Author/folder/file.lua. Authors include perlytiara (forks), Kaikaku, BigGamingGamers, etc. Return ONLY a JSON array of path strings that belong to this guide (files that are the main program, required helpers, or "required if using multi"). No duplicates. Prefer perlytiara fork paths when both perlytiara and original author exist for the same program. If unsure, include paths that clearly match the program names or pastebin/get instructions. Empty array [] if none match.`;

  const userContent = `Guide:
Title: ${entry.title || entry.slug}
Author: ${entry.author || ""}
Slug: ${entry.slug}

Video description (excerpt):
${(entry.videoDescription || entry.summary || "").slice(0, 2000)}

Program names / pastebin hints we extracted: ${programNames.join(", ") || "none"}

Available paths (one per line):
${pathList}

Return a JSON array of paths that belong to this guide, e.g. ["Kaikaku/tWaitFor.lua","Kaikaku/tSend.lua"] or [].`;

  const raw = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    { temperature: 0.2, timeoutMs: 60_000 }
  );

  const trimmed = raw.trim().replace(/^```\w*\n?|\n?```$/g, "").trim();
  let arr: unknown[];
  try {
    arr = JSON.parse(trimmed) as unknown[];
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  const filtered = arr
    .filter((x): x is string => typeof x === "string" && x.length > 0)
    .filter((p) => allPaths.includes(p));
  return [...new Set(filtered)];
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const onlyMissing = !process.argv.includes("--all");

  const manifestPath = path.join(CONTENT_ROOT, "manifest.json");
  const raw = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(raw) as ProgramArticleEntry[];

  let allPaths: string[] = [];
  try {
    allPaths = await walkAllLuaPaths(PROGRAMS_ROOT);
  } catch (e) {
    console.error("Could not walk TurtlesPAC/programs:", e);
    process.exit(1);
  }
  console.log(`Found ${allPaths.length} .lua paths in programs/`);

  const toProcess = onlyMissing
    ? manifest.filter((e) => !(e.programPaths?.length ?? 0))
    : manifest;
  console.log(`Processing ${toProcess.length} entries (${onlyMissing ? "missing paths only" : "all"}).`);

  let updated = 0;
  for (let i = 0; i < toProcess.length; i++) {
    const entry = toProcess[i];
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${entry.slug} ... `);
    try {
      const suggested = await suggestPathsForEntry(entry, allPaths);
      if (suggested.length > 0) {
        const idx = manifest.findIndex((m) => m.slug === entry.slug);
        if (idx >= 0) {
          manifest[idx].programPaths = suggested;
          updated++;
          console.log(suggested.join(", "));
        } else {
          console.log("(skip)");
        }
      } else {
        console.log("(none)");
      }
    } catch (e) {
      console.log("error:", e instanceof Error ? e.message : e);
    }
    if (i < toProcess.length - 1) await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }

  if (!dryRun && updated > 0) {
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log(`Updated manifest: ${updated} entries now have programPaths.`);
  } else if (dryRun && updated > 0) {
    console.log(`[dry-run] Would update ${updated} entries. Run without --dry-run to apply.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
