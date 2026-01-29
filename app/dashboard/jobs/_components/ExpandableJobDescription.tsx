"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ExpandableJobDescription({
  text,
  maxHeight = 250,
}: {
  text: string;
  maxHeight?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const normalized = (text ?? "").trim();

  useEffect(() => {
    // Check if content exceeds max height
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setShowToggle(contentHeight > maxHeight);
    }
  }, [normalized, maxHeight]);

  if (!normalized) {
    return (
      <p className="text-foreground-muted italic">
        No description available.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Content Container */}
      <div
        ref={contentRef}
        className={[
          "relative overflow-hidden transition-all duration-300",
          expanded ? "" : "",
        ].join(" ")}
        style={{
          maxHeight: expanded ? "none" : showToggle ? `${maxHeight}px` : "none",
        }}
      >
        <pre className="whitespace-pre-wrap break-words font-sans text-sm text-foreground-muted leading-relaxed">
          {normalized}
        </pre>

        {/* Gradient Fade Overlay - Only when collapsed */}
        {!expanded && showToggle && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface via-surface/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Show More/Less Toggle */}
      {showToggle && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium text-foreground transition-colors"
          >
            {expanded ? (
              <>
                Show Less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show More
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

