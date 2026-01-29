"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Pencil,
  ArrowRight,
  Check,
  X,
  Briefcase,
  Search,
} from "lucide-react";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { ApplicationStatusSelector } from "@/components/ApplicationStatusSelector";

type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFER"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

type TabFilter = "all" | "active" | "saved" | "archived";

type Application = {
  id: number;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: number;
    companyName: string;
    companyLogo: string;
    jobTitle: string;
    locationCity: string;
    country: string;
  };
};

function getStats(applications: Application[]) {
  const total = applications.length;
  const inProgress = applications.filter((a) =>
    ["APPLIED", "INTERVIEWING"].includes(a.status)
  ).length;
  const actionRequired = applications.filter((a) =>
    ["OFFER", "ACCEPTED"].includes(a.status)
  ).length;
  const saved = applications.filter((a) => a.status === "SAVED").length;
  return { total, inProgress, actionRequired, saved };
}

function filterByTab(applications: Application[], tab: TabFilter): Application[] {
  if (tab === "all") return applications;
  if (tab === "active")
    return applications.filter((a) =>
      ["APPLIED", "INTERVIEWING"].includes(a.status)
    );
  if (tab === "saved")
    return applications.filter((a) => a.status === "SAVED");
  if (tab === "archived")
    return applications.filter((a) =>
      ["REJECTED", "WITHDRAWN"].includes(a.status)
    );
  return applications;
}

function filterBySearch(
  applications: Application[],
  query: string
): Application[] {
  const q = query.trim().toLowerCase();
  if (!q) return applications;
  return applications.filter((app) => {
    const company = (app.job.companyName ?? "").toLowerCase();
    const role = (app.job.jobTitle ?? "").toLowerCase();
    const location = [
      app.job.locationCity,
      app.job.country,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      company.includes(q) || role.includes(q) || location.includes(q)
    );
  });
}

const TABS: Array<{ value: TabFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "saved", label: "Saved" },
  { value: "archived", label: "Archived" },
];

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tab, setTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<ApplicationStatus>("APPLIED");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await fetch("/api/applications/list");
      const json = await res.json();
      if (json.ok && json.applications) {
        setApplications(json.applications);
      }
    } catch (e) {
      console.error("Failed to fetch applications:", e);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(app: Application) {
    setEditingId(app.id);
    setEditStatus(app.status);
    setEditNotes(app.notes ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditStatus("APPLIED");
    setEditNotes("");
  }

  async function saveEdit(app: Application) {
    setSaving(true);
    try {
      const res = await fetch("/api/applications/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jobId: app.job.id,
          status: editStatus,
          notes: editNotes,
        }),
      });

      const json = await res.json();
      if (json.ok && json.application) {
        setApplications((prev) =>
          prev.map((a) => (a.id === app.id ? json.application : a))
        );
        setEditingId(null);
      }
    } catch (e) {
      console.error("Failed to update application:", e);
    } finally {
      setSaving(false);
    }
  }

  const stats = useMemo(() => getStats(applications), [applications]);
  const filteredByTab = useMemo(
    () => filterByTab(applications, tab),
    [applications, tab]
  );
  const filteredApplications = useMemo(
    () => filterBySearch(filteredByTab, searchQuery),
    [filteredByTab, searchQuery]
  );
  const hasActiveFilters = tab !== "all" || searchQuery.trim().length > 0;

  if (loading) {
    return (
      <div className="max-w-6xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Applications
          </h1>
          <p className="text-sm text-slate-600">Loading...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Applications
        </h1>
        <p className="text-sm text-slate-600">
          Track and manage your job applications.
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            In Progress
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.inProgress}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Action Required
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.actionRequired}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Saved
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.saved}</p>
        </div>
      </div>

      {/* Control Bar: Search + Pill Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies or roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={[
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table or Empty State */}
      {filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-6 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Briefcase className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            {hasActiveFilters
              ? "No applications match your filters"
              : "No applications yet"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {hasActiveFilters
              ? "Try clearing filters or search to see all applications."
              : "Start by importing a job from your dashboard."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setTab("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Import job
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Company
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Timeline
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => {
                  const locationParts = [
                    app.job.locationCity,
                    app.job.country,
                  ].filter((v) => v && String(v).trim().length > 0);
                  const locationStr = locationParts.join(", ") || "—";
                  const isEditing = editingId === app.id;

                  return (
                    <tr
                      key={app.id}
                      className={
                        isEditing
                          ? "bg-indigo-50/50"
                          : "bg-white hover:bg-slate-50/80 transition-colors"
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {app.job.companyLogo ? (
                            <img
                              src={app.job.companyLogo}
                              alt=""
                              className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-50 object-contain"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-400">
                              {app.job.companyName?.charAt(0) ?? "?"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {app.job.companyName || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-[180px]">
                              {locationStr}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {app.job.jobTitle || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="[&_select]:rounded-lg [&_select]:border-2 [&_select]:border-indigo-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm [&_select]:focus:ring-2 [&_select]:focus:ring-indigo-500">
                              <ApplicationStatusSelector
                                value={editStatus}
                                onChange={setEditStatus}
                                disabled={saving}
                              />
                            </div>
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Notes (optional)"
                              rows={2}
                              disabled={saving}
                              className="block w-full max-w-xs rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
                            />
                          </div>
                        ) : (
                          <ApplicationStatusBadge status={app.status} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {app.appliedAt
                          ? `Applied on ${new Date(app.appliedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(app)}
                                disabled={saving}
                                title="Save"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={saving}
                                title="Cancel"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(app)}
                                title="Edit"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <Link
                                href={`/dashboard/jobs/${app.job.id}`}
                                title="View details"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
