"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<ApplicationStatus | "ALL">("ALL");
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

  const filteredApplications =
    filter === "ALL"
      ? applications
      : applications.filter((a) => a.status === filter);

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

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">Filter:</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
        >
          <option value="ALL">All ({applications.length})</option>
          <option value="SAVED">
            Saved ({applications.filter((a) => a.status === "SAVED").length})
          </option>
          <option value="APPLIED">
            Applied ({applications.filter((a) => a.status === "APPLIED").length})
          </option>
          <option value="INTERVIEWING">
            Interviewing (
            {applications.filter((a) => a.status === "INTERVIEWING").length})
          </option>
          <option value="OFFER">
            Offer ({applications.filter((a) => a.status === "OFFER").length})
          </option>
          <option value="ACCEPTED">
            Accepted ({applications.filter((a) => a.status === "ACCEPTED").length})
          </option>
          <option value="REJECTED">
            Rejected ({applications.filter((a) => a.status === "REJECTED").length})
          </option>
          <option value="WITHDRAWN">
            Withdrawn (
            {applications.filter((a) => a.status === "WITHDRAWN").length})
          </option>
        </select>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600">
            {filter === "ALL"
              ? "No applications yet. Start by importing a job!"
              : `No ${filter.toLowerCase()} applications.`}
          </p>
          {filter === "ALL" && (
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition-colors"
            >
              Import a job
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredApplications.map((app) => {
                  const locationParts = [
                    app.job.locationCity,
                    app.job.country,
                  ].filter((v) => v && v.trim().length > 0);

                  const isEditing = editingId === app.id;

                  return (
                    <tr
                      key={app.id}
                      className={
                        isEditing ? "bg-slate-50" : "hover:bg-slate-50 transition-colors"
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {app.job.companyLogo ? (
                            <img
                              src={app.job.companyLogo}
                              alt={`${app.job.companyName} logo`}
                              className="h-8 w-8 rounded border border-slate-200 bg-slate-50 object-contain"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded border border-slate-200 bg-slate-50" />
                          )}
                          <span className="text-sm font-medium text-slate-900">
                            {app.job.companyName || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {app.job.jobTitle || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {locationParts.join(", ") || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <ApplicationStatusSelector
                            value={editStatus}
                            onChange={setEditStatus}
                            disabled={saving}
                          />
                        ) : (
                          <ApplicationStatusBadge status={app.status} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(app)}
                                disabled={saving}
                                className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-60"
                              >
                                {saving ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={saving}
                                className="text-sm text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(app)}
                                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                              >
                                Edit
                              </button>
                              <span className="text-slate-400">·</span>
                              <Link
                                href={`/dashboard/jobs/${app.job.id}`}
                                className="text-sm text-sky-600 hover:text-sky-700 transition-colors"
                              >
                                View
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
