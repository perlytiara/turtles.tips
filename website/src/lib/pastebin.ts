/**
 * Fetch raw paste content from Pastebin.
 * 1) Direct fetch to pastebin.com/raw/<id> (often works from Node).
 * 2) Scrapfly view page + extract from textarea#paste_code.
 */

const SCRAPFLY_BASE = "https://api.scrapfly.io/scrape";
const TIMEOUT_MS = 45_000;

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractFromViewPage(html: string): string | null {
  const patterns = [
    /<textarea[^>]+id="paste_code"[^>]*>([\s\S]*?)<\/textarea>/i,
    /<textarea[^>]+class="[^"]*paste_code[^"]*"[^>]*>([\s\S]*?)<\/textarea>/i,
    /class="paste_textarea"[^>]*>([\s\S]*?)<\/textarea>/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1] && m[1].trim().length > 10) {
      return decodeHtmlEntities(m[1]).trim();
    }
  }
  return null;
}

async function fetchRawDirect(pasteId: string): Promise<string | null> {
  const url = `https://pastebin.com/raw/${encodeURIComponent(pasteId)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; turtles-tips/1; +https://turtles.tips)" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const text = await res.text();
    return text && text.length > 10 && !text.trimStart().startsWith("<!") ? text.trim() : null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function scrapeWithScrapfly(
  key: string,
  url: string,
  options: { format?: string; renderJs?: boolean } = {}
): Promise<string | null> {
  const params = new URLSearchParams({ url, key, format: options.format ?? "raw" });
  if (options.renderJs) params.set("render_js", "true");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${SCRAPFLY_BASE}?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: { content?: string }; content?: string };
    const content = data.result?.content ?? data.content;
    return typeof content === "string" ? content : null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

export async function fetchPastebinRaw(pasteId: string): Promise<string | null> {
  const rawUrl = `https://pastebin.com/raw/${encodeURIComponent(pasteId)}`;

  let content = await fetchRawDirect(pasteId);
  if (content && content.length > 10) return content;

  const key = process.env.SCRAPFLY_API_KEY;
  if (key?.trim()) {
    content = await scrapeWithScrapfly(key, rawUrl);
    if (content && content.length > 10 && !content.trimStart().startsWith("<!")) {
      return content.trim();
    }
    const viewUrl = `https://pastebin.com/${encodeURIComponent(pasteId)}`;
    content = await scrapeWithScrapfly(key, viewUrl, { renderJs: true });
    if (content) {
      const extracted = extractFromViewPage(content);
      if (extracted && extracted.length > 10) return extracted;
    }
  }

  return null;
}
