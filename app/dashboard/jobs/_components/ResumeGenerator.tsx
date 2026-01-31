"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { GenerationProcessingView } from "./GenerationProcessingView";
import type { ResumeGenerationResponse } from "@/types/resume";

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

export function ResumeGenerator({ jobId }: { jobId: number }) {
  const router = useRouter();
  const [language, setLanguage] = useState<(typeof COMMON_LANGUAGES)[number]>(
    "English"
  );
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResumeGenerationResponse | null>(null);

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

      const json = (await res.json().catch(() => null)) as ResumeGenerationResponse | null;

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
            webhookStatus: res.status,
            error: `Generation failed (HTTP ${res.status}).`,
          } satisfies ResumeGenerationResponse)
      );
    } catch (e) {
      setResult({
        ok: false,
        webhookStatus: 0,
        error: e instanceof Error ? e.message : "Generation failed.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitting) {
    return <GenerationProcessingView variant="resume" />;
  }

  return (
    <div className="space-y-6">
      {/* Language selector - full width */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Language
        </label>
        <select
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value as (typeof COMMON_LANGUAGES)[number])
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {COMMON_LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Custom instructions - taller textarea, Optional badge */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          Custom instructions
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
            Optional
          </span>
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={6}
          placeholder="E.g., Focus on my project management skills, keep it under 300 words..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-[120px]"
        />
      </div>

      {/* Footer: full-width Generate button + note */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          disabled={!canGenerate}
          onClick={onGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 h-12 font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:hover:bg-indigo-600"
        >
          <Sparkles className="h-5 w-5" />
          {submitting ? "Generating…" : "Generate"}
        </button>
        <p className="text-center text-xs text-slate-500">
          Generation usually takes 30–60 seconds.
        </p>
      </div>

      {result?.error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
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
