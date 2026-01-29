"use client";

type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFER"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  SAVED: {
    label: "Saved",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  APPLIED: {
    label: "Applied",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  INTERVIEWING: {
    label: "Interviewing",
    className: "bg-purple-50 text-purple-700 ring-purple-200",
  },
  OFFER: {
    label: "Offer",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-green-50 text-green-700 ring-green-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-orange-50 text-orange-700 ring-orange-200",
  },
};

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status?: ApplicationStatus | string | null;
  className?: string;
}) {
  if (!status) return null;

  const config =
    STATUS_CONFIG[status as ApplicationStatus] ?? STATUS_CONFIG.SAVED;

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
