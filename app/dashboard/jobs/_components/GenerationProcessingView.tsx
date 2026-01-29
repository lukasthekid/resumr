"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/** Resume: 30–60s — longer steps, slower cycle, 60s progress bar */
const RESUME_STATUS_STEPS = [
  "Analyzing job requirements...",
  "Scanning your career profile...",
  "Identifying key skill matches...",
  "Drafting personalized content...",
  "Polishing and formatting...",
];
const RESUME_CYCLE_MS = 4500;
const RESUME_PROGRESS_DURATION_S = 60;

/** Cover letter: ~10s — short steps, faster cycle, 12s progress bar */
const COVER_LETTER_STATUS_STEPS = [
  "Analyzing the role...",
  "Drafting your letter...",
  "Almost there...",
];
const COVER_LETTER_CYCLE_MS = 2500;
const COVER_LETTER_PROGRESS_DURATION_S = 12;

export type GenerationProcessingVariant = "resume" | "cover-letter";

interface GenerationProcessingViewProps {
  variant: GenerationProcessingVariant;
}

export function GenerationProcessingView({ variant }: GenerationProcessingViewProps) {
  const isResume = variant === "resume";
  const steps = isResume ? RESUME_STATUS_STEPS : COVER_LETTER_STATUS_STEPS;
  const cycleMs = isResume ? RESUME_CYCLE_MS : COVER_LETTER_CYCLE_MS;
  const progressDurationS = isResume ? RESUME_PROGRESS_DURATION_S : COVER_LETTER_PROGRESS_DURATION_S;

  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % steps.length);
    }, cycleMs);
    return () => clearInterval(id);
  }, [steps.length, cycleMs]);

  return (
    <div className="flex min-h-[280px] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center py-8">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200/60 animate-pulse"
          aria-hidden
        >
          <Sparkles className="h-8 w-8" />
        </div>
        <p className="mt-6 text-center text-sm font-medium text-slate-700 transition-opacity duration-300">
          {steps[statusIndex]}
        </p>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600"
          style={{
            animation: `generation-progress ${progressDurationS}s linear forwards`,
            width: 0,
          }}
        />
      </div>
    </div>
  );
}
