"use client";

import { useMemo, useState } from "react";

export function ExpandableJobDescription({
  text,
  collapsedMaxChars = 1200,
}: {
  text: string;
  collapsedMaxChars?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const normalized = useMemo(() => (text ?? "").trim(), [text]);
  const hasMore = normalized.length > collapsedMaxChars;

  const visible = useMemo(() => {
    if (expanded || !hasMore) return normalized;
    return normalized.slice(0, collapsedMaxChars).trimEnd() + "…";
  }, [expanded, hasMore, normalized, collapsedMaxChars]);

  if (!normalized) {
    return <p className="text-slate-600">No description found.</p>;
  }

  return (
    <div className="space-y-3">
      <pre className="whitespace-pre-wrap break-words font-sans text-sm text-slate-700">
        {visible}
      </pre>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {expanded ? "View less" : "View more"}
        </button>
      )}
    </div>
  );
}

