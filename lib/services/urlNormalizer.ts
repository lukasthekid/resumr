/**
 * Normalise job portal URLs so we always fetch the canonical single-job page.
 *
 * Many portals show job details as overlays on search pages and encode the
 * job ID in the URL hash fragment. Since hash fragments are never sent to
 * the server, our fetcher gets the search results page instead of the
 * individual job. This module detects those patterns and rewrites them.
 *
 * Add new portals by appending to the `NORMALIZERS` array.
 */

type UrlNormalizer = {
  /** Hostname(s) this rule applies to. */
  hosts: string[];
  /** Return the normalised URL, or null if no rewrite needed. */
  normalize: (url: URL) => string | null;
};

const NORMALIZERS: UrlNormalizer[] = [
  {
    // karriere.at: search URLs use #<job-id> fragments
    // e.g. https://www.karriere.at/jobs/software-entwickler/wien#7738505
    //    → https://www.karriere.at/jobs/7738505
    hosts: ["karriere.at", "www.karriere.at"],
    normalize: (url) => {
      const hash = url.hash.replace("#", "");
      if (/^\d+$/.test(hash)) {
        return `${url.origin}/jobs/${hash}`;
      }
      return null;
    },
  },
];

/**
 * If the given URL matches a known job-portal pattern that needs rewriting,
 * return the canonical job page URL. Otherwise return the original URL
 * unchanged.
 */
export function normalizeJobUrl(rawUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  for (const rule of NORMALIZERS) {
    if (rule.hosts.includes(parsed.hostname)) {
      const rewritten = rule.normalize(parsed);
      if (rewritten) return rewritten;
    }
  }

  // Strip hash fragments in general — they're never useful for server-side fetching
  if (parsed.hash) {
    parsed.hash = "";
    return parsed.toString();
  }

  return rawUrl;
}
