"use client";

import Link from "next/link";
import { CheckCircle2, Settings, Zap } from "lucide-react";

interface ProfileSnapshotProps {
  hasDocuments: boolean;
  hasProfile: boolean;
}

export function ProfileSnapshot({ hasDocuments, hasProfile }: ProfileSnapshotProps) {
  const allReady = hasDocuments && hasProfile;

  return (
    <div className="space-y-4">
      {/* Ready to Apply Card */}
      <div className="bg-surface rounded-xl shadow-sm border border-border p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Ready to Apply</h2>
            <p className="text-sm text-foreground-muted mt-1">
              Your profile is {allReady ? "complete" : "incomplete"}
            </p>
          </div>
          {allReady && (
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            </div>
          )}
        </div>

        {/* Status List */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={[
                "h-8 w-8 rounded-lg flex items-center justify-center",
                hasDocuments
                  ? "bg-secondary/10"
                  : "bg-slate-100",
              ].join(" ")}
            >
              <CheckCircle2
                className={[
                  "h-4 w-4",
                  hasDocuments ? "text-secondary" : "text-slate-400",
                ].join(" ")}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Base Resume</p>
              <p className="text-xs text-foreground-muted">
                {hasDocuments ? "Active" : "Not uploaded"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={[
                "h-8 w-8 rounded-lg flex items-center justify-center",
                hasProfile
                  ? "bg-secondary/10"
                  : "bg-slate-100",
              ].join(" ")}
            >
              <CheckCircle2
                className={[
                  "h-4 w-4",
                  hasProfile ? "text-secondary" : "text-slate-400",
                ].join(" ")}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Profile Details</p>
              <p className="text-xs text-foreground-muted">
                {hasProfile ? "Complete" : "Incomplete"}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Link */}
        <Link
          href="/dashboard/settings"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm font-medium text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Update Settings
        </Link>
      </div>

      {/* Usage Card */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20 p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground mb-1">
              AI Generations
            </h3>
            <p className="text-xs text-foreground-muted">
              Track your document generations
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-foreground">∞</span>
            <span className="text-xs font-medium text-foreground-muted">Unlimited</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: '100%' }} />
          </div>
          <p className="text-xs text-foreground-subtle">
            Free Plan - No limits while in beta
          </p>
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-surface rounded-xl shadow-sm border border-border p-4 sm:p-5">
        <h3 className="text-sm font-bold text-foreground mb-2">
          💡 Pro Tips
        </h3>
        <ul className="space-y-2 text-xs text-foreground-muted">
          <li className="flex items-start gap-2">
            <span className="text-secondary mt-0.5">•</span>
            <span>Use specific job URLs for better analysis</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary mt-0.5">•</span>
            <span>Update your base resume regularly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary mt-0.5">•</span>
            <span>Customize generated content before sending</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
