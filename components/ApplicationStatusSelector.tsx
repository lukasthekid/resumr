"use client";

type ApplicationStage =
  | "applied"
  | "interviewing"
  | "final_round"
  | "offer"
  | "rejected";

const STAGES: Array<{ value: ApplicationStage; label: string }> = [
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "final_round", label: "Final Round" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export function ApplicationStatusSelector({
  value,
  onChange,
  disabled,
}: {
  value?: ApplicationStage | string;
  onChange?: (stage: ApplicationStage) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value ?? "applied"}
      onChange={(e) => onChange?.(e.target.value as ApplicationStage)}
      disabled={disabled}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent disabled:opacity-60"
    >
      {STAGES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
