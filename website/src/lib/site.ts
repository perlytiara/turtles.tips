// Local dev: BASE_PATH unset → empty. Production: set by GitHub Actions.
const siteBasePath = process.env.BASE_PATH ?? "";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (siteBasePath ? `https://perlytiara.github.io${siteBasePath}` : "https://turtles.tips");

/** Encode path segments for hrefs so @ etc. don't break Next.js routing. */
export function encodePathForHref(segments: string[]): string {
  return segments.map((s) => encodeURIComponent(s)).join("/");
}

/** Encode segments for static params (URLs) - @ must be %40 for routing. */
export function encodeSegmentsForParams(segments: string[]): string[] {
  return segments.map((s) => encodeURIComponent(s));
}

/** Return both raw and encoded param variants for segments containing @ (for direct URLs). */
export function paramVariantsForExport(segments: string[]): string[][] {
  const encoded = encodeSegmentsForParams(segments);
  const hasAt = segments.some((s) => s.includes("@"));
  if (!hasAt) return [encoded];
  return [encoded, segments]; // both /%40load.lua and /@load.lua
}

/** Decode path segments from URL params (for filesystem access). */
export function decodePathFromParams(segments: string[]): string[] {
  return segments.map((s) => decodeURIComponent(s));
}

export { siteBasePath, siteUrl };
