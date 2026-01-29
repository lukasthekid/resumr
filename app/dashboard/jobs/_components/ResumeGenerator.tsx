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
  resumeData?: any;
  job?: any;
  user?: any;
  webhookResponse?: unknown;
};

export function ResumeGenerator({ jobId }: { jobId: number }) {
  const router = useRouter();
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
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jobId,
          language,
          instructions,
        }),
      });

      const json = (await res.json().catch(() => null)) as GenerateResponse | null;

      console.log("Resume generator response:", { 
        statusOk: res.ok, 
        jsonOk: json?.ok, 
        hasResumeData: !!json?.resumeData,
        hasJob: !!json?.job,
        hasUser: !!json?.user,
        fullResponse: json
      });

      if (res.ok && json?.ok && json.resumeData) {
        const dataToStore = {
          job: json.job,
          user: json.user,
          resumeData: json.resumeData,
        };
        
        console.log("Storing resume data:", dataToStore);
        sessionStorage.setItem(
          `resume_${jobId}`,
          JSON.stringify(dataToStore)
        );
        
        console.log("Navigating to:", `/dashboard/jobs/${jobId}/resume`);
        router.push(`/dashboard/jobs/${jobId}/resume`);
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
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
          >
            {COMMON_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            Choose the language you want the resume written in.
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
            placeholder="e.g. Emphasize leadership skills, highlight AWS experience, keep it one page…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
          />
          <p className="text-xs text-slate-500">
            Optional. Add focus areas, skills to highlight, or formatting preferences.
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
  );
}
