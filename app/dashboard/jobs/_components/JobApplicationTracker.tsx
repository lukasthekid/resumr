"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";

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
};

export function JobApplicationTracker({ jobId }: { jobId: number }) {
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function fetchApplication() {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/get?jobId=${jobId}`);
      const json = await res.json();
      if (json.ok && json.application) {
        setApplication(json.application);
      }
    } catch (e) {
      console.error("Failed to fetch application:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleTrack() {
    setTracking(true);
    try {
      const res = await fetch("/api/applications/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jobId,
          status: "APPLIED",
          notes: "",
        }),
      });

      const json = await res.json();
      if (json.ok && json.application) {
        setApplication(json.application);
      }
    } catch (e) {
      console.error("Failed to track application:", e);
    } finally {
      setTracking(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-slate-500">Loading application status...</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Status:</span>
          {application ? (
            <ApplicationStatusBadge status={application.status} />
          ) : (
            <span className="text-sm text-slate-500">Not tracked</span>
          )}
        </div>

        {application ? (
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Manage in Applications →
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleTrack}
            disabled={tracking}
            className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition-colors disabled:opacity-60"
          >
            {tracking ? "Tracking..." : "Track as Applied"}
          </button>
        )}
      </div>

      {application?.appliedAt && (
        <p className="text-xs text-slate-500">
          Applied on {new Date(application.appliedAt).toLocaleDateString()}
        </p>
      )}

      {application?.notes && (
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-1">Notes:</p>
          <p className="text-xs text-slate-500">{application.notes}</p>
        </div>
      )}
    </div>
  );
}
