export interface JobPosting {
  company_name: string;
  company_logo: string;
  job_title: string;
  location_city: string;
  country: string;
  number_of_applicants: number;
  job_description: string;
}

export const JOB_POSTING_DEFAULTS: JobPosting = {
  company_name: "",
  company_logo: "",
  job_title: "",
  location_city: "",
  country: "",
  number_of_applicants: 0,
  job_description: "",
};

const JOB_POSTING_KEYS = Object.keys(JOB_POSTING_DEFAULTS) as (keyof JobPosting)[];

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asInt(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(n)) return Math.max(0, Math.trunc(n));
  }
  return 0;
}

/**
 * Validate and coerce an unknown payload into a typed `JobPosting`.
 * Returns `null` if the payload is not an object at all.
 */
export function coerceJobPosting(raw: unknown): JobPosting | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const hasAtLeastOneField = JOB_POSTING_KEYS.some(
    (k) => obj[k] !== undefined && obj[k] !== "",
  );
  if (!hasAtLeastOneField) return null;

  return {
    company_name: asString(obj.company_name),
    company_logo: asString(obj.company_logo),
    job_title: asString(obj.job_title),
    location_city: asString(obj.location_city),
    country: asString(obj.country),
    number_of_applicants: asInt(obj.number_of_applicants),
    job_description: asString(obj.job_description),
  };
}
