/**
 * xAI (Grok) chat completions client for pipeline use.
 * Load dotenv before calling if running from CLI.
 */

const XAI_BASE = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-4-latest";
const DEFAULT_TIMEOUT_MS = 120_000;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  timeoutMs?: number;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const key = process.env.XAI_API_KEY;
  if (!key?.trim()) throw new Error("XAI_API_KEY is not set");

  const model = options.model ?? DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.3;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${XAI_BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        messages,
        model,
        stream: false,
        temperature,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`xAI API ${res.status}: ${body}`);
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : "";
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error) throw err;
    throw new Error("xAI request failed");
  }
}
