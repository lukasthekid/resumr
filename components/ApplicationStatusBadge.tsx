"use client";

type ApplicationStage =
  | "applied"
  | "interviewing"
  | "final_round"
  | "offer"
  | "rejected";

const STAGE_CONFIG: Record<
  ApplicationStage,
  { label: string; className: string }
> = {
  applied: {
    label: "Applied",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  interviewing: {
    label: "Interviewing",
    className: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  final_round: {
    label: "Final Round",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  offer: {
    label: "Offer",
    className: "bg-green-50 text-green-700 ring-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status?: ApplicationStage | string | null;
  className?: string;
}) {
  if (!status) return null;

  const config =
    STAGE_CONFIG[status as ApplicationStage] ?? STAGE_CONFIG.applied;

  return (
    <span
      className={[
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1",
        config.className,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {config.label}
    </span>
  );
}
