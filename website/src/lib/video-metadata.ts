/**
 * Fetch video metadata: YouTube Data API first, Scrapfly as fallback.
 * Used by pipeline and build scripts. Load dotenv before calling if running from CLI.
 */

export interface VideoMetadata {
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const SCRAPFLY_BASE = "https://api.scrapfly.io/scrape";
const HTTP_TIMEOUT_MS = 60_000;
const SCRAPFLY_READ_TIMEOUT_MS = 155_000;

export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  const fromYoutube = await fetchFromYouTube(videoId);
  if (fromYoutube) return fromYoutube;

  const fromScrapfly = await fetchFromScrapfly(videoId);
  return fromScrapfly;
}

async function fetchFromYouTube(videoId: string): Promise<VideoMetadata | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key?.trim()) return null;

  const url = `${YOUTUBE_API_BASE}/videos?part=snippet&id=${encodeURIComponent(videoId)}&key=${key}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      items?: Array<{
        snippet?: {
          title?: string;
          description?: string;
          publishedAt?: string;
          thumbnails?: { default?: { url?: string }; medium?: { url?: string }; high?: { url?: string } };
        };
      }>;
    };
    const item = data.items?.[0];
    const sn = item?.snippet;
    if (!sn?.title) return null;

    const thumb =
      sn.thumbnails?.high?.url ?? sn.thumbnails?.medium?.url ?? sn.thumbnails?.default?.url ?? "";
    return {
      title: sn.title ?? "",
      description: sn.description ?? "",
      publishedAt: sn.publishedAt ?? "",
      thumbnailUrl: thumb,
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function fetchFromScrapfly(videoId: string): Promise<VideoMetadata | null> {
  const key = process.env.SCRAPFLY_API_KEY;
  if (!key?.trim()) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const params = new URLSearchParams({
    url: watchUrl,
    key,
    format: "raw",
    render_js: "true",
  });
  const url = `${SCRAPFLY_BASE}?${params.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SCRAPFLY_READ_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: { content?: string } };
    const html = data.result?.content;
    if (!html || typeof html !== "string") return null;

    const title = parseMetaContent(html, "og:title") ?? parseMetaContent(html, "twitter:title") ?? "";
    const description =
      parseMetaContent(html, "og:description") ??
      parseMetaContent(html, "twitter:description") ??
      parseMetaContent(html, "description") ??
      "";
    const thumbnailUrl =
      parseMetaContent(html, "og:image") ?? parseMetaContent(html, "twitter:image") ?? "";

    if (!title && !description) return null;

    return {
      title: decodeHtmlEntities(title),
      description: decodeHtmlEntities(description),
      publishedAt: "", // Scrapfly fallback often doesn't expose publish date easily
      thumbnailUrl: thumbnailUrl.trim(),
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

function parseMetaContent(html: string, property: string): string | null {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const m = html.match(regex);
  if (m) return m[1].trim();
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`,
    "i"
  );
  const m2 = html.match(regex2);
  return m2 ? m2[1].trim() : null;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}
