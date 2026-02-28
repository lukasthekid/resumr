"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin, Clock } from "lucide-react";
import type { Application } from "../page";

function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

interface KanbanCardProps {
  application: Application;
  isDragOverlay?: boolean;
  onClick?: () => void;
}

export function KanbanCard({
  application,
  isDragOverlay,
  onClick,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: { type: "card", stage: application.stage },
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      };

  const { job } = application;
  const location =
    [job.locationCity, job.country].filter(Boolean).join(", ") || "Remote";
  const days = daysSince(application.appliedAt || application.createdAt);

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={style}
      className={[
        "bg-white rounded-lg shadow-sm border border-slate-100 p-3 group",
        "hover:shadow-md transition-all duration-200",
        isDragOverlay && "shadow-lg ring-2 ring-indigo-200 rotate-[2deg] scale-105",
        !isDragOverlay && "cursor-grab active:cursor-grabbing",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={isDragOverlay ? undefined : onClick}
      {...(!isDragOverlay ? attributes : {})}
      {...(!isDragOverlay ? listeners : {})}
    >
      <div className="flex items-start gap-2.5">
        <div className="shrink-0">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt=""
              className="h-9 w-9 rounded-md border border-slate-200 bg-slate-50 object-contain"
            />
          ) : (
            <div className="h-9 w-9 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">
              {job.companyName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {job.companyName || "Unknown"}
            </p>
            <GripVertical className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
          </div>
          <p className="text-xs text-slate-600 truncate mt-0.5">
            {job.jobTitle || "Untitled"}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </span>
            {days !== null && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="h-3 w-3 shrink-0" />
                {days}d
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
