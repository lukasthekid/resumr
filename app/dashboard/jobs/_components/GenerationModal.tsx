"use client";

import { X, Sparkles } from "lucide-react";
import { useEffect } from "react";

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set, shows the new header: icon + "Customize your {documentType}" + subtext. Otherwise title/description are used. */
  documentType?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function GenerationModal({
  isOpen,
  onClose,
  documentType,
  title = "",
  description = "",
  children,
}: GenerationModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90dvh] flex flex-col border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-5 shrink-0">
            {documentType ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Customize your {documentType}
                </h2>
                <p className="mt-1 text-sm text-foreground-muted">
                  Tailor the output to your specific needs.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                <p className="text-sm text-foreground-muted mt-1">{description}</p>
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-foreground-muted hover:text-foreground transition-colors rounded-lg p-1 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 pb-6 overflow-y-auto flex-1 min-h-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
