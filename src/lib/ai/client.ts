import "server-only";

/**
 * Model-agnostic AI client.
 *
 * We speak the OpenAI-compatible /chat/completions protocol, which is the
 * lingua franca of aggregators like OpenRouter. Both `baseUrl` and `model`
 * are user-configurable, so any model reachable through an OpenAI-compatible
 * endpoint works — OpenRouter alone exposes OpenAI, Anthropic, Gemini, Gemma,
 * MiniMax, Nvidia, Llama, etc. by just changing the model string. We do NOT
 * send `response_format` (some models reject it); instead we instruct JSON in
 * the prompt and parse it robustly, which maximizes compatibility.
 */

export type AiConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class AiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AiError";
    this.status = status;
  }
}

function friendlyError(status: number, body: string): string {
  if (status === 401 || status === 403) return "Invalid or unauthorized API key.";
  if (status === 402) return "Your provider reports insufficient credits/quota.";
  if (status === 404) return "Model or endpoint not found — check the model id and base URL.";
  if (status === 429) return "Rate limited by your provider. Try again shortly.";
  const snippet = body.slice(0, 200).replace(/\s+/g, " ").trim();
  return `AI request failed (${status})${snippet ? `: ${snippet}` : ""}`;
}

export async function chatComplete(
  config: AiConfig,
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number; signal?: AbortSignal } = {},
): Promise<string> {
  const url = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      // OpenRouter attribution headers (ignored by other providers).
      "HTTP-Referer": process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      "X-Title": "NetPrep",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: opts.temperature ?? 0.7,
      ...(opts.maxTokens ? { max_tokens: opts.maxTokens } : {}),
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AiError(friendlyError(res.status, body), res.status);
  }

  const data = await res.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new AiError("The model returned an empty response.");
  }
  return content;
}

/** Extract the first JSON object/array from possibly fenced or chatty output. */
export function extractJson<T = unknown>(raw: string): T {
  let text = raw.trim();
  // Strip ``` or ```json fences.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");
  const start =
    firstArr === -1 ? firstObj : firstObj === -1 ? firstArr : Math.min(firstObj, firstArr);
  const lastObj = text.lastIndexOf("}");
  const lastArr = text.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);

  if (start === -1 || end === -1 || end < start) {
    throw new AiError("The model did not return valid JSON.");
  }

  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    throw new AiError("Could not parse the model's JSON response.");
  }
}

/** Ask the model for JSON and parse it. */
export async function chatJson<T = unknown>(
  config: AiConfig,
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number; signal?: AbortSignal } = {},
): Promise<T> {
  const content = await chatComplete(config, messages, opts);
  return extractJson<T>(content);
}

/** Minimal call to confirm a key/base-url/model combo actually works. */
export async function validateConfig(config: AiConfig): Promise<void> {
  await chatComplete(
    config,
    [{ role: "user", content: 'Reply with exactly the word: OK' }],
    { maxTokens: 5, temperature: 0 },
  );
}
