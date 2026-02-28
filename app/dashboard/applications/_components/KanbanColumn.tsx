"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import Link from "next/link";
import { KanbanCard } from "./KanbanCard";
import type { Application, ApplicationStage } from "../page";

export interface StageConfig {
  id: ApplicationStage;
  label: string;
  color: {
    border: string;
    headerBg: string;
    badge: string;
    dropHighlight: string;
  };
}

interface KanbanColumnProps {
  stage: StageConfig;
  applications: Application[];
  onCardClick: (app: Application) => void;
  isDropTarget?: boolean;
}

export function KanbanColumn({
  stage,
  applications,
  onCardClick,
  isDropTarget,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stage.id}`,
    data: { type: "column", stage: stage.id },
  });

  const highlighted = isOver || isDropTarget;

  return (
    <div
      className={[
        "flex flex-col min-w-[200px] sm:min-w-[240px] flex-1 rounded-xl snap-start shrink-0",
        highlighted
          ? stage.color.dropHighlight
          : "bg-slate-50/70",
        "transition-all duration-200",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Column Header */}
      <div
        className={[
          "px-3 py-3 rounded-t-xl border-t-2",
          stage.color.border,
          stage.color.headerBg,
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">
              {stage.label}
            </h3>
            <span
              className={[
                "text-xs font-medium rounded-full px-2 py-0.5",
                stage.color.badge,
              ].join(" ")}
            >
              {applications.length}
            </span>
          </div>
          {stage.id === "applied" && (
            <Link
              href="/dashboard"
              title="Import new job"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]"
      >
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              onClick={() => onCardClick(app)}
            />
          ))}
        </SortableContext>
        {applications.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex items-center justify-center min-h-[100px]">
            <p className="text-sm text-slate-400">No applications</p>
          </div>
        )}
      </div>
    </div>
  );
}
