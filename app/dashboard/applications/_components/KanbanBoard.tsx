"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { KanbanColumn, type StageConfig } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import type { Application, ApplicationStage } from "../page";

export const STAGES: StageConfig[] = [
  {
    id: "applied",
    label: "Applied",
    color: {
      border: "border-t-blue-500",
      headerBg: "bg-blue-50/50",
      badge: "bg-blue-100 text-blue-700",
      dropHighlight: "ring-2 ring-blue-200 bg-blue-50/40",
    },
  },
  {
    id: "interviewing",
    label: "Interviewing",
    color: {
      border: "border-t-violet-500",
      headerBg: "bg-violet-50/50",
      badge: "bg-violet-100 text-violet-700",
      dropHighlight: "ring-2 ring-violet-200 bg-violet-50/40",
    },
  },
  {
    id: "final_round",
    label: "Final Round",
    color: {
      border: "border-t-amber-500",
      headerBg: "bg-amber-50/50",
      badge: "bg-amber-100 text-amber-700",
      dropHighlight: "ring-2 ring-amber-200 bg-amber-50/40",
    },
  },
  {
    id: "offer",
    label: "Offer",
    color: {
      border: "border-t-green-500",
      headerBg: "bg-green-50/50",
      badge: "bg-green-100 text-green-700",
      dropHighlight: "ring-2 ring-green-200 bg-green-50/40",
    },
  },
  {
    id: "rejected",
    label: "Rejected",
    color: {
      border: "border-t-slate-400",
      headerBg: "bg-slate-100/50",
      badge: "bg-slate-200 text-slate-600",
      dropHighlight: "ring-2 ring-slate-300 bg-slate-100/40",
    },
  },
];

function groupByStage(
  apps: Application[]
): Record<ApplicationStage, Application[]> {
  const groups: Record<ApplicationStage, Application[]> = {
    applied: [],
    interviewing: [],
    final_round: [],
    offer: [],
    rejected: [],
  };
  for (const app of apps) {
    if (groups[app.stage]) {
      groups[app.stage].push(app);
    }
  }
  return groups;
}

interface KanbanBoardProps {
  applications: Application[];
  onStageChange: (appId: number, stage: ApplicationStage) => void;
  onCardClick: (app: Application) => void;
}

export function KanbanBoard({
  applications,
  onStageChange,
  onCardClick,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<ApplicationStage | null>(null);

  const grouped = useMemo(() => groupByStage(applications), [applications]);
  const activeApp =
    activeId != null
      ? (applications.find((a) => a.id === activeId) ?? null)
      : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverStage(null);
      return;
    }
    const data = over.data?.current;
    setOverStage((data?.stage as ApplicationStage) ?? null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverStage(null);

      if (!over) return;

      const data = over.data?.current;
      const targetStage = data?.stage as ApplicationStage | undefined;
      if (!targetStage) return;

      const app = applications.find((a) => a.id === active.id);
      if (app && app.stage !== targetStage) {
        onStageChange(active.id as number, targetStage);
      }
    },
    [applications, onStageChange]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 flex-1 min-h-0 overflow-x-auto overflow-y-hidden pb-2 min-w-0 snap-x snap-mandatory scroll-smooth">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            applications={grouped[stage.id]}
            onCardClick={onCardClick}
            isDropTarget={overStage === stage.id && activeId != null}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeApp ? (
          <KanbanCard application={activeApp} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
