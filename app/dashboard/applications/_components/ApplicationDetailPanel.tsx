"use client";

import {
  X,
  ExternalLink,
  ArrowRight,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import type { Application, ApplicationStage } from "../page";
import { STAGES } from "./KanbanBoard";

interface ApplicationDetailPanelProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange: (appId: number, stage: ApplicationStage) => void;
}

export function ApplicationDetailPanel({
  application,
  isOpen,
  onClose,
  onStageChange,
}: ApplicationDetailPanelProps) {
  if (!application) return null;

  const { job } = application;
  const location =
    [job.locationCity, job.country].filter(Boolean).join(", ") || "Remote";

  return (
    <>
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={[
          "fixed inset-0 bg-black/20 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          "fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Application Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Company Info */}
          <div className="flex items-start gap-4">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt=""
                className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-50 object-contain"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-lg font-bold text-slate-400">
                {job.companyName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900">
                {job.companyName || "Unknown"}
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                {job.jobTitle || "Untitled Position"}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Stage */}
          <div>
            <label
              htmlFor="stage-select"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Stage
            </label>
            <select
              id="stage-select"
              value={application.stage}
              onChange={(e) =>
                onStageChange(
                  application.id,
                  e.target.value as ApplicationStage
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Timeline</p>
            <div className="space-y-2">
              {application.appliedAt && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>
                    Applied{" "}
                    {new Date(application.appliedAt).toLocaleDateString(
                      undefined,
                      { month: "long", day: "numeric", year: "numeric" }
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>
                  Created{" "}
                  {new Date(application.createdAt).toLocaleDateString(
                    undefined,
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {application.notes && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Notes</p>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {application.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 space-y-2">
          <Link
            href={`/dashboard/jobs/${job.id}`}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            View Job Details
            <ArrowRight className="h-4 w-4" />
          </Link>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Visit Job Posting
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </>
  );
}
