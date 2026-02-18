import path from "path";
import fs from "fs/promises";
import type { ProgramArticleEntry, ProgramCategory } from "@/types/programs";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");

export async function getProgramsManifest(): Promise<ProgramArticleEntry[]> {
  try {
    const filePath = path.join(CONTENT_ROOT, "manifest.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getProgramsCategories(): Promise<ProgramCategory[]> {
  const filePath = path.join(CONTENT_ROOT, "categories.json");
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as ProgramCategory[];
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<ProgramArticleEntry | null> {
  const manifest = await getProgramsManifest();
  return manifest.find((e) => e.slug === slug) ?? null;
}

/** Link info for a program path from a related guide (same episode or same author). */
export type RelatedProgramLink = {
  path: string;
  slug: string;
  title: string;
  sourceLabel: string;
};

/**
 * Returns program paths only from the same YouTube episode (same video).
 * Use for "Get the program" copy commands so only files actually in this episode show.
 */
export function getRelatedProgramLinks(
  entry: ProgramArticleEntry,
  manifest: ProgramArticleEntry[]
): RelatedProgramLink[] {
  if (!entry.youtubeVideoId) return [];
  const ownPaths = new Set(entry.programPaths ?? []);
  const seenPaths = new Set<string>();
  const out: RelatedProgramLink[] = [];

  const sameVideo = manifest.filter(
    (e) =>
      e.slug !== entry.slug &&
      e.youtubeVideoId === entry.youtubeVideoId &&
      (e.programPaths?.length ?? 0) > 0
  );
  for (const e of sameVideo) {
    for (const path of e.programPaths ?? []) {
      if (ownPaths.has(path) || seenPaths.has(path)) continue;
      seenPaths.add(path);
      out.push({
        path,
        slug: e.slug,
        title: e.title || e.slug,
        sourceLabel: "Same episode",
      });
    }
  }
  return out;
}

/**
 * Other guides by the same author (different episodes). For "Suggest others" at bottom.
 */
export function getSuggestedGuides(
  entry: ProgramArticleEntry,
  manifest: ProgramArticleEntry[],
  limit = 15
): ProgramArticleEntry[] {
  if (!entry.author) return [];
  return manifest
    .filter(
      (e) =>
        e.slug !== entry.slug &&
        e.author === entry.author &&
        e.youtubeVideoId !== entry.youtubeVideoId
    )
    .slice(0, limit);
}

export async function getArticleBody(slug: string): Promise<string | null> {
  const filePath = path.join(CONTENT_ROOT, "articles", `${slug}.md`);
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}
