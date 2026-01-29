"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Link as LinkIcon, FileText, Loader2 } from "lucide-react";

type ImportJobResponse = {
  ok?: boolean;
  cached?: boolean;
  error?: string;
  webhookStatus?: number;
  jobUrl?: string;
  jobListing?: { id: number };
  webhookResponse?: unknown;
};

export function JobImportEngine() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  
  // Manual entry fields
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [country, setCountry] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportJobResponse | null>(null);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (activeTab === "url") return url.trim().length > 0;
    // For manual entry, require company name, job title, and description
    return companyName.trim().length > 0 && 
           jobTitle.trim().length > 0 && 
           jobDescription.trim().length > 0;
  }, [activeTab, url, companyName, jobTitle, jobDescription, submitting]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      let res: Response;
      
      if (activeTab === "url") {
        // Import from URL
        res = await fetch("/api/jobs/import", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url }),
        });
      } else {
        // Create from manual entry
        res = await fetch("/api/jobs/create", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            companyName,
            jobTitle,
            locationCity,
            country,
            jobDescription,
          }),
        });
      }

      const json = (await res.json().catch(() => null)) as ImportJobResponse | null;
      const id = json?.jobListing?.id;
      if (res.ok && json?.ok && typeof id === "number") {
        router.push(`/dashboard/jobs/${id}`);
        return;
      }
      setResult(
        json ??
          ({
            ok: false,
            error: `${activeTab === "url" ? "Import" : "Creation"} failed (HTTP ${res.status}).`,
          } satisfies ImportJobResponse)
      );
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : `${activeTab === "url" ? "Import" : "Creation"} failed.`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Tabbed Interface */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={[
              "pb-3 px-1 text-sm font-semibold border-b-2 transition-colors",
              activeTab === "url"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:text-foreground hover:border-border",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Import from URL
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={[
              "pb-3 px-1 text-sm font-semibold border-b-2 transition-colors",
              activeTab === "text"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:text-foreground hover:border-border",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Paste Job Text
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "url" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground" htmlFor="jobUrl">
              Job Posting URL
            </label>
            <input
              id="jobUrl"
              type="url"
              inputMode="url"
              placeholder="https://www.linkedin.com/jobs/view/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="block w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <p className="text-xs text-foreground-muted">
              We support job boards from LinkedIn, Indeed, Glassdoor, and more
            </p>
          </div>

          {/* Supported Sites Logos */}
          <div className="flex items-center gap-4 px-2">
            <span className="text-xs font-medium text-foreground-subtle">Supported:</span>
            <div className="flex items-center gap-3 grayscale opacity-60">
              <span className="text-xs font-semibold text-slate-600">LinkedIn</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">Indeed</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">Glassdoor</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Company Name & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="companyName">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                type="text"
                placeholder="e.g., Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="block w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="jobTitle">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                id="jobTitle"
                type="text"
                placeholder="e.g., Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="block w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Location City & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="locationCity">
                City
              </label>
              <input
                id="locationCity"
                type="text"
                placeholder="e.g., San Francisco"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="block w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="country">
                Country
              </label>
              <input
                id="country"
                type="text"
                placeholder="e.g., United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="block w-full rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground" htmlFor="jobDescription">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="jobDescription"
              rows={10}
              placeholder="Paste or type the full job description including requirements and responsibilities..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="block w-full rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              required
            />
            <p className="text-xs text-foreground-muted">
              Include all details about the role, requirements, and company
            </p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Job...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Analyze & Generate
          </>
        )}
      </button>

      {/* Result Message */}
      {result && (
        <div
          className={[
            "rounded-lg p-4 text-sm border",
            result.error
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-secondary/5 border-secondary/20 text-secondary",
          ].join(" ")}
        >
          {result.error ? (
            <p>{result.error}</p>
          ) : result.cached ? (
            <p>✓ Job already imported - redirecting...</p>
          ) : (
            <p>✓ Job imported successfully - redirecting...</p>
          )}
        </div>
      )}
    </form>
  );
}
