/**
 * xAI Imagine API (grok-imagine-image) — generate images from text prompts.
 * Returns base64 so we can save to disk (API URLs are temporary).
 */

const XAI_BASE = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-imagine-image";
const TIMEOUT_MS = 90_000;

export interface GenerateImageOptions {
  aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "auto";
  resolution?: "1k" | "2k";
}

export async function generateImage(
  prompt: string,
  options: GenerateImageOptions = {}
): Promise<{ base64: string; mime: string } | null> {
  const key = process.env.XAI_API_KEY;
  if (!key?.trim()) throw new Error("XAI_API_KEY is not set");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body: Record<string, unknown> = {
      model: DEFAULT_MODEL,
      prompt,
      response_format: "b64_json",
    };
    if (options.aspect_ratio) body.aspect_ratio = options.aspect_ratio;
    if (options.resolution) body.resolution = options.resolution;

    const res = await fetch(`${XAI_BASE}/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`xAI Imagine ${res.status}: ${text}`);
    }

    const data = (await res.json()) as {
      data?: Array<{ b64_json?: string }>;
    };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64 || typeof b64 !== "string") return null;

    return { base64: b64, mime: "image/png" };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error) throw err;
    throw new Error("xAI Imagine request failed");
  }
}
