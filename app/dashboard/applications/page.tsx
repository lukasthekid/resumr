"use client";

import { useEffect, useState, useCallback } from "react";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { KanbanBoard } from "./_components/KanbanBoard";
import { ApplicationDetailPanel } from "./_components/ApplicationDetailPanel";
import { updateApplicationStage } from "./actions";

export type ApplicationStage =
  | "applied"
  | "interviewing"
  | "final_round"
  | "offer"
  | "rejected";

export type Application = {
  id: number;
  stage: ApplicationStage;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: number;
    url: string;
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
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const handleStageChange = useCallback(
    async (appId: number, newStage: ApplicationStage) => {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: newStage } : a))
      );
      setSelectedApp((prev) =>
        prev?.id === appId ? { ...prev, stage: newStage } : prev
      );

      try {
        await updateApplicationStage(appId, newStage);
      } catch (e) {
        console.error("Failed to update stage:", e);
        fetchApplications();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleCardClick = useCallback((app: Application) => {
    setSelectedApp(app);
    setDetailOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 px-6 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Briefcase className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          No applications yet
        </h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Import a job from the dashboard to start tracking your applications.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          Import a job
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
      <KanbanBoard
        applications={applications}
        onStageChange={handleStageChange}
        onCardClick={handleCardClick}
      />
      <ApplicationDetailPanel
        application={selectedApp}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStageChange={handleStageChange}
      />
    </div>
  );
}
