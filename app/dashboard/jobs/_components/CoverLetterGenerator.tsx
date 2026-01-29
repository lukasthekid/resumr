"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const COMMON_LANGUAGES = [
  "English",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Dutch",
  "Portuguese",
  "Polish",
  "Turkish",
] as const;

type GenerateResponse = {
  ok?: boolean;
  error?: string;
  webhookStatus?: number;
  coverLetter?: string | null;
  job?: any;
  user?: any;
  webhookResponse?: unknown;
};

export function CoverLetterGenerator({ jobId }: { jobId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<(typeof COMMON_LANGUAGES)[number]>(
    "English"
  );
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const canGenerate = useMemo(() => {
    return !submitting && language.trim().length > 0;
  }, [submitting, language]);

  async function onGenerate() {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jobId,
          language,
          instructions,
        }),
      });

      const json = (await res.json().catch(() => null)) as GenerateResponse | null;

      console.log("Generator response:", { 
        statusOk: res.ok, 
        jsonOk: json?.ok, 
        hasCoverLetter: !!json?.coverLetter,
        hasJob: !!json?.job,
        hasUser: !!json?.user,
        fullResponse: json
      });

      if (res.ok && json?.ok && json.coverLetter) {
        const dataToStore = {
          job: json.job,
          user: json.user,
          coverLetterBody: json.coverLetter,
        };
        
        console.log("Storing cover letter data:", dataToStore);
        sessionStorage.setItem(
          `coverLetter_${jobId}`,
          JSON.stringify(dataToStore)
        );
        
        // Verify it was stored
        const stored = sessionStorage.getItem(`coverLetter_${jobId}`);
        console.log("Verification - data stored:", stored ? "yes" : "no");
        
        console.log("Navigating to:", `/dashboard/jobs/${jobId}/cover-letter`);
        router.push(`/dashboard/jobs/${jobId}/cover-letter`);
        return;
      }

      setResult(
        json ??
          ({
            ok: false,
            error: `Generation failed (HTTP ${res.status}).`,
          } satisfies GenerateResponse)
      );
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : "Generation failed.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          Generate a tailored cover letter for this role.
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition-colors"
        >
          {open ? "Close" : "Generate cover letter"}
        </button>
      </div>

      {open && (
        <div className="space-y-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Language
              </label>
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as (typeof COMMON_LANGUAGES)[number])
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
              >
                {COMMON_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Choose the language you want the letter written in.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Custom instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="e.g. Make it more personal, mention my X project, keep it under 200 words…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
              />
              <p className="text-xs text-slate-500">
                Optional. Add style, tone, or project highlights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={onGenerate}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-60 disabled:hover:bg-emerald-500"
            >
              {submitting ? "Generating…" : "Generate"}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setInstructions("");
                setResult(null);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-60"
            >
              Clear
            </button>
          </div>

          {result?.error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="text-sm text-rose-700">{result.error}</div>
              {result.webhookResponse != null && (
                <pre className="mt-2 max-h-96 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                  {typeof result.webhookResponse === "string"
                    ? result.webhookResponse
                    : JSON.stringify(result.webhookResponse, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

