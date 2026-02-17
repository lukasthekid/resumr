const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const DEFAULT_TEMPERATURE = 0;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_500;
const MAX_JITTER_MS = 500;

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  maxRetries?: number;
};

type GroqChatCompletionResponse = {
  id: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export class GroqApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = "GroqApiError";
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  get isRetryable(): boolean {
    return RETRYABLE_STATUS_CODES.has(this.statusCode);
  }
}

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY environment variable is not set.");
  }
  return key;
}

/**
 * Call Groq's chat completion endpoint with automatic retry and backoff.
 * Designed for the free-tier: backs off on 429s and respects Retry-After.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: GroqChatOptions = {},
): Promise<string> {
  const {
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxTokens,
    maxRetries = MAX_RETRIES,
  } = options;

  const apiKey = getApiKey();

  const body = JSON.stringify({
    model,
    messages,
    temperature,
    response_format: { type: "json_object" },
    ...(maxTokens ? { max_tokens: maxTokens } : {}),
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body,
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) {
        const responseBody = await response.text().catch(() => "");

        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < maxRetries) {
          const retryAfter = parseRetryAfter(response.headers.get("retry-after"));
          const delay = retryAfter ?? computeBackoff(attempt);
          lastError = new GroqApiError(
            `Groq API returned ${response.status}`,
            response.status,
            responseBody,
          );
          await sleep(delay);
          continue;
        }

        throw new GroqApiError(
          `Groq API error: HTTP ${response.status}`,
          response.status,
          responseBody,
        );
      }

      const data = (await response.json()) as GroqChatCompletionResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new GroqApiError("Groq returned an empty response.", 200);
      }

      return stripThinkingTokens(content);
    } catch (error) {
      if (error instanceof GroqApiError && !error.isRetryable) throw error;

      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        await sleep(computeBackoff(attempt));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Groq chat completion failed after retries.");
}

/**
 * Some models emit reasoning/thinking tokens before the actual JSON payload.
 * Strip them to get clean output.
 */
function stripThinkingTokens(content: string): string {
  return content
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/<\|think\|>[\s\S]*?<\|\/think\|>/g, "")
    .trim();
}

function computeBackoff(attempt: number): number {
  const exponential = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * MAX_JITTER_MS;
  return exponential + jitter;
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * 1000;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
