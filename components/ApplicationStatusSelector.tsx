"use client";

type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFER"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

const STATUSES: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "SAVED", label: "Saved" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFER", label: "Offer" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export function ApplicationStatusSelector({
  value,
  onChange,
  disabled,
}: {
  value?: ApplicationStatus | string;
  onChange?: (status: ApplicationStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value ?? "SAVED"}
      onChange={(e) => onChange?.(e.target.value as ApplicationStatus)}
      disabled={disabled}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
