"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ImportJobResponse = {
  ok?: boolean;
  cached?: boolean;
  error?: string;
  webhookStatus?: number;
  jobUrl?: string;
  jobListing?: { id: number };
  webhookResponse?: unknown;
};

export function ImportJobForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportJobResponse | null>(null);

  const canSubmit = useMemo(() => {
    return url.trim().length > 0 && !submitting;
  }, [url, submitting]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/jobs/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });

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
            error: `Import failed (HTTP ${res.status}).`,
          } satisfies ImportJobResponse)
      );
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : "Import failed.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900" htmlFor="jobUrl">
          Job link
        </label>
        <p className="text-xs text-slate-500">
          Paste a link from LinkedIn, Indeed, or any other job board. We’ll parse the
          job posting and extract the key details.
        </p>
        <input
          id="jobUrl"
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-0 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition-colors disabled:opacity-60 disabled:hover:bg-sky-500"
        >
          {submitting ? "Importing…" : "Import job"}
        </button>
        {result?.cached && (
          <p className="text-xs text-emerald-700">
            ✓ Job already in database
          </p>
        )}

        <button
          type="button"
          disabled={submitting || url.length === 0}
          onClick={() => {
            setUrl("");
            setResult(null);
          }}
          className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-60"
        >
          Clear
        </button>
      </div>

      {result && (
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
          {result.error ? (
            <div className="text-sm text-rose-700">{result.error}</div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-slate-700">
                Webhook:{" "}
                <span className={result.ok ? "text-emerald-700" : "text-rose-700"}>
                  {result.ok ? "OK" : "Failed"}
                </span>{" "}
                (HTTP {result.webhookStatus})
              </div>
              {result.jobUrl && (
                <div className="text-xs text-slate-500">
                  URL: <span className="text-slate-700">{result.jobUrl}</span>
                </div>
              )}
              {result.webhookResponse != null && (
                <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                  {typeof result.webhookResponse === "string"
                    ? result.webhookResponse
                    : JSON.stringify(result.webhookResponse, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

