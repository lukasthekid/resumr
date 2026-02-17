import { SYSTEM_PROMPT, USER_PROMPT } from "@/config/prompts";
import { type JobPosting, coerceJobPosting } from "@/types/jobPosting";
import { fetchHtml, HtmlFetchError } from "./htmlFetcher";
import { chatCompletion, GroqApiError } from "./groqClient";
import { normalizeJobUrl } from "./urlNormalizer";

export class JobParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "JobParseError";
  }
}

/**
 * End-to-end job parsing pipeline:
 * 1. Fetch and sanitise HTML from the given URL
 * 2. Send HTML to Groq LLM for structured extraction
 * 3. Validate and coerce the LLM response into a typed `JobPosting`
 */
export async function parseJobFromUrl(rawUrl: string): Promise<JobPosting> {
  // Step 0 — Normalise the URL (e.g. karriere.at hash fragments → direct job page)
  const url = normalizeJobUrl(rawUrl);
  if (url !== rawUrl) {
    console.log(`[jobParser] Normalised URL: ${rawUrl} → ${url}`);
  }

  // Step 1 — Fetch HTML
  console.log(`[jobParser] Fetching HTML from ${url}`);
  let html: string;
  try {
    html = await fetchHtml(url);
  } catch (error) {
    console.error("[jobParser] HTML fetch failed:", error);
    if (error instanceof HtmlFetchError) {
      throw new JobParseError(
        `Could not fetch the job page (HTTP ${error.statusCode ?? "unknown"}).`,
        error,
      );
    }
    throw new JobParseError("Failed to fetch the job page.", error as Error);
  }

  console.log(`[jobParser] Fetched ${html.length} chars of cleaned HTML`);

  if (html.trim().length < 100) {
    throw new JobParseError(
      "The page returned very little content — it may require JavaScript rendering.",
    );
  }

  // Step 2 — Call Groq LLM
  console.log("[jobParser] Sending to Groq for extraction...");
  const userMessage = USER_PROMPT.replace("{HTML_CONTENT}", html);

  let rawJson: string;
  try {
    rawJson = await chatCompletion([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ]);
  } catch (error) {
    console.error("[jobParser] Groq API call failed:", error);
    if (error instanceof GroqApiError) {
      if (error.isRateLimited) {
        throw new JobParseError(
          "Rate limited by Groq — please try again in a moment.",
          error,
        );
      }
      throw new JobParseError(
        `LLM extraction failed (HTTP ${error.statusCode}).`,
        error,
      );
    }
    throw new JobParseError("LLM extraction failed.", error as Error);
  }

  console.log(`[jobParser] Groq returned ${rawJson.length} chars`);

  // Step 3 — Parse and validate JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    console.error("[jobParser] Invalid JSON from Groq:", rawJson.slice(0, 500));
    throw new JobParseError(
      "LLM returned invalid JSON — the page may be unsupported.",
    );
  }

  const job = coerceJobPosting(parsed);
  if (!job) {
    console.error("[jobParser] Coercion failed. Parsed payload:", parsed);
    throw new JobParseError(
      "LLM returned a JSON object but no job data could be extracted.",
    );
  }

  if (!job.job_title) {
    throw new JobParseError(
      "Extraction succeeded but no job title was found — the page may not be a job posting.",
    );
  }

  console.log(`[jobParser] Extracted: "${job.job_title}" at "${job.company_name}"`);
  return job;
}
