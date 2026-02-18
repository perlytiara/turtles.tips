/**
 * Fetch YouTube playlist items (video IDs and titles).
 * Requires YOUTUBE_API_KEY. Playlist ID from env or URL (e.g. list=PLxxx).
 */

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const HTTP_TIMEOUT_MS = 30_000;

export interface PlaylistVideoItem {
  videoId: string;
  title: string;
  index: number;
}

export async function fetchPlaylistItems(playlistId: string): Promise<PlaylistVideoItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key?.trim()) throw new Error("YOUTUBE_API_KEY is not set");

  const out: PlaylistVideoItem[] = [];
  let nextPageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet",
      playlistId,
      maxResults: "50",
      key,
    });
    if (nextPageToken) params.set("pageToken", nextPageToken);
    const url = `${YOUTUBE_API_BASE}/playlistItems?${params.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`YouTube API ${res.status}: ${text}`);
      }
      const data = (await res.json()) as {
        nextPageToken?: string;
        items?: Array<{
          snippet?: {
            resourceId?: { videoId?: string };
            title?: string;
          };
        }>;
      };
      nextPageToken = data.nextPageToken;
      const items = data.items ?? [];
      for (let i = 0; i < items.length; i++) {
        const sn = items[i]?.snippet;
        const videoId = sn?.resourceId?.videoId;
        const title = sn?.title ?? "";
        if (videoId) out.push({ videoId, title, index: out.length + 1 });
      }
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  } while (nextPageToken);

  return out;
}

/** Generate a URL-safe slug from an episode title (e.g. "Ep 01: direwolf20 9x9" -> "direwolf20-9x9"). */
export function slugFromTitle(title: string): string {
  const match = title.match(/(?:Ep\s*\d+\s*:?\s*)?(.+)/i);
  const rest = (match ? match[1] : title).trim();
  return rest
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "episode";
}
