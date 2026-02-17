import puppeteer from "puppeteer";
import { existsSync } from "fs";

/**
 * Llama 4 Scout on Groq free-tier: 30,000 TPM.
 * Budget:
 *   ~600 tokens  — system prompt (~1,800 chars)
 *   ~20,000 tokens — HTML content (~60,000 chars)
 *   ~80 tokens   — user prompt template
 *   ⇒ ~20,700 input → ~9,300 tokens available for output
 */
const MAX_HTML_LENGTH = 60_000;
const NATIVE_FETCH_TIMEOUT_MS = 12_000;
const PUPPETEER_TIMEOUT_MS = 30_000;

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Ch-Ua": '"Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

/** Well-known Chrome paths on macOS / Linux. */
const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

export class HtmlFetchError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "HtmlFetchError";
  }
}

/**
 * Fetch HTML from a URL.
 *
 * Strategy:
 *  1. Try native `fetch` with browser-like headers (fast, low overhead).
 *  2. If that fails (timeout, bot block, stream error) → fall back to
 *     headless Puppeteer which passes TLS fingerprinting and JS challenges.
 *
 * The returned content is aggressively compressed for LLM consumption:
 * JSON-LD → meta tags → stripped body text, capped to fit within Groq
 * free-tier token limits.
 */
export async function fetchHtml(url: string): Promise<string> {
  // --- Tier 1: native fetch ---
  try {
    const html = await fetchWithNative(url);
    if (html) return html;
  } catch {
    // Swallow — we'll retry with Puppeteer below.
  }

  // --- Tier 2: Puppeteer fallback ---
  try {
    return await fetchWithPuppeteer(url);
  } catch (error) {
    throw new HtmlFetchError(
      `Failed to fetch ${url} (native fetch and Puppeteer both failed).`,
      error instanceof HtmlFetchError ? error.statusCode : undefined,
    );
  }
}

// ---------------------------------------------------------------------------
// Tier 1 — native fetch
// ---------------------------------------------------------------------------

async function fetchWithNative(url: string): Promise<string | null> {
  const response = await fetch(url, {
    method: "GET",
    headers: BROWSER_HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(NATIVE_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new HtmlFetchError(
      `HTTP ${response.status} from ${url}`,
      response.status,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (
    !contentType.includes("text/html") &&
    !contentType.includes("text/plain") &&
    !contentType.includes("application/xhtml")
  ) {
    throw new HtmlFetchError(
      `Unexpected content type "${contentType}" for ${url}`,
    );
  }

  const raw = await response.text();

  if (raw.length < 500) return null;
  if (looksLikeBotChallenge(raw)) return null;

  return compressForLlm(raw);
}

/** Heuristic: detect Akamai / Cloudflare / DataDome challenge pages. */
function looksLikeBotChallenge(html: string): boolean {
  const lower = html.toLowerCase();
  const markers = [
    "/_sec/cp_challenge",
    "cf-browser-verification",
    "challenge-platform",
    "just a moment",
    "checking your browser",
    "access denied",
    "datadome",
  ];
  return markers.some((m) => lower.includes(m));
}

// ---------------------------------------------------------------------------
// Tier 2 — Puppeteer (headless Chromium)
// ---------------------------------------------------------------------------

function resolveChromePath(): string | undefined {
  // 1. Respect the env variable set in Docker (PUPPETEER_EXECUTABLE_PATH)
  const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  // 2. Fall back to well-known system paths (macOS / Linux)
  for (const candidate of CHROME_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }

  // 3. Let Puppeteer find its own bundled Chromium
  return undefined;
}

async function fetchWithPuppeteer(url: string): Promise<string> {
  const executablePath = resolveChromePath();

  const browser = await puppeteer.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(BROWSER_HEADERS["User-Agent"]);
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PUPPETEER_TIMEOUT_MS,
    });

    // Dismiss cookie consent dialogs (common on EU job portals)
    await dismissCookieConsent(page);
    await sleep(1_000);

    const html = await page.content();

    if (!html || html.length < 200) {
      throw new HtmlFetchError("Puppeteer returned an empty page.");
    }

    return compressForLlm(html);
  } finally {
    await browser.close();
  }
}

async function dismissCookieConsent(page: import("puppeteer").Page): Promise<void> {
  const consentPatterns = [
    "Alles akzeptieren",
    "Alle akzeptieren",
    "Alle Cookies akzeptieren",
    "Accept all",
    "Accept All",
    "Accept all cookies",
    "Akzeptieren",
    "Zustimmen",
    "Agree",
    "I agree",
    "Allow all",
    "Tout accepter",
  ];

  try {
    const clicked = await page.evaluate((patterns: string[]) => {
      const buttons = Array.from(
        document.querySelectorAll(
          "button, a[role='button'], [class*='consent'] button, [class*='cookie'] button",
        ),
      );
      for (const btn of buttons) {
        const text = btn.textContent?.trim() ?? "";
        if (patterns.some((p) => text.includes(p))) {
          (btn as HTMLElement).click();
          return true;
        }
      }
      return false;
    }, consentPatterns);

    if (clicked) await sleep(500);
  } catch {
    // Non-critical
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// HTML → LLM-ready compression
// ---------------------------------------------------------------------------

/**
 * Aggressively compress raw HTML into a compact payload for the LLM.
 *
 * Priority order (highest value per token first):
 *  1. JSON-LD structured data (schema.org JobPosting)
 *  2. Key meta tags (title, description, og:*)
 *  3. Stripped body text (no HTML tags, just readable content)
 *
 * Resulting payload is capped at MAX_HTML_LENGTH to fit within Groq
 * free-tier token limits.
 */
function compressForLlm(html: string): string {
  const parts: string[] = [];
  let budget = MAX_HTML_LENGTH;

  // 1. JSON-LD structured data — the most valuable, compact source
  const jsonLdBlocks = extractJsonLd(html);
  if (jsonLdBlocks.length > 0) {
    const ldSection = "JSON-LD:\n" + jsonLdBlocks.join("\n");
    parts.push(ldSection);
    budget -= ldSection.length;
  }

  // 2. Key meta tags
  const metaSection = extractMetaTags(html);
  if (metaSection && budget > metaSection.length) {
    parts.push(metaSection);
    budget -= metaSection.length;
  }

  // 3. Stripped body text (plain text, no HTML tags)
  if (budget > 500) {
    const bodyText = extractBodyText(html);
    if (bodyText) {
      const trimmed = bodyText.slice(0, budget);
      parts.push("PAGE TEXT:\n" + trimmed);
    }
  }

  const result = parts.join("\n\n");

  if (result.length > MAX_HTML_LENGTH) {
    return result.slice(0, MAX_HTML_LENGTH);
  }

  return result;
}

/** Extract all JSON-LD blocks, minified. */
function extractJsonLd(html: string): string[] {
  const blocks: string[] = [];
  const regex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      blocks.push(JSON.stringify(parsed));
    } catch {
      blocks.push(match[1].trim());
    }
  }
  return blocks;
}

/** Extract key meta tags as a compact text block. */
function extractMetaTags(html: string): string | null {
  const tags: string[] = [];

  // <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) tags.push(`title: ${decodeEntities(titleMatch[1].trim())}`);

  // <meta name="..." content="..."> and <meta property="..." content="...">
  const metaRegex =
    /<meta\s+(?:name|property)=["']([^"']+)["']\s+content=["']([^"']*)["']/gi;
  let m;
  const keep = new Set([
    "description",
    "og:title",
    "og:description",
    "og:site_name",
    "og:image",
    "og:url",
  ]);

  while ((m = metaRegex.exec(html)) !== null) {
    if (keep.has(m[1].toLowerCase())) {
      tags.push(`${m[1]}: ${decodeEntities(m[2])}`);
    }
  }

  return tags.length > 0 ? "META:\n" + tags.join("\n") : null;
}

/** Strip all HTML tags and return plain text from the <body>. */
function extractBodyText(html: string): string | null {
  // Isolate body content
  const bodyMatch = html.match(/<body[\s\S]*?>([\s\S]*)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;

  // Remove script, style, svg, noscript, nav, footer, header
  content = content.replace(/<script[\s\S]*?<\/script>/gi, "");
  content = content.replace(/<style[\s\S]*?<\/style>/gi, "");
  content = content.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  content = content.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  content = content.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  content = content.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  content = content.replace(/<header[\s\S]*?<\/header>/gi, "");

  // Remove HTML comments
  content = content.replace(/<!--[\s\S]*?-->/g, "");

  // Strip all remaining HTML tags
  content = content.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  content = decodeEntities(content);

  // Collapse whitespace
  content = content.replace(/[ \t]+/g, " ");
  content = content.replace(/\n[ \n]+/g, "\n");
  content = content.trim();

  return content.length > 50 ? content : null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
