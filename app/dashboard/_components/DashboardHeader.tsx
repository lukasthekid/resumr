"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface PageInfo {
  title: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
}

function getPageInfo(pathname: string): PageInfo {
  // Dashboard home
  if (pathname === "/dashboard") {
    return {
      title: "Dashboard",
      breadcrumbs: [{ label: "Dashboard" }],
    };
  }

  // Applications
  if (pathname === "/dashboard/applications") {
    return {
      title: "Applications",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Applications" },
      ],
    };
  }

  // Settings
  if (pathname === "/dashboard/settings") {
    return {
      title: "Settings",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings" },
      ],
    };
  }

  // Documents
  if (pathname === "/dashboard/documents") {
    return {
      title: "Documents",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Documents" },
      ],
    };
  }

  // Jobs list
  if (pathname === "/dashboard/jobs") {
    return {
      title: "Job Listings",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Jobs" },
      ],
    };
  }

  // Job detail pages
  const jobIdMatch = pathname.match(/^\/dashboard\/jobs\/([^/]+)$/);
  if (jobIdMatch) {
    return {
      title: "Job Details",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Jobs", href: "/dashboard/jobs" },
        { label: "Details" },
      ],
    };
  }

  // Resume page
  const resumeMatch = pathname.match(/^\/dashboard\/jobs\/([^/]+)\/resume$/);
  if (resumeMatch) {
    return {
      title: "Generate Resume",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Jobs", href: "/dashboard/jobs" },
        { label: "Job Details", href: `/dashboard/jobs/${resumeMatch[1]}` },
        { label: "Resume" },
      ],
    };
  }

  // Cover letter page
  const coverLetterMatch = pathname.match(
    /^\/dashboard\/jobs\/([^/]+)\/cover-letter$/
  );
  if (coverLetterMatch) {
    return {
      title: "Generate Cover Letter",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Jobs", href: "/dashboard/jobs" },
        {
          label: "Job Details",
          href: `/dashboard/jobs/${coverLetterMatch[1]}`,
        },
        { label: "Cover Letter" },
      ],
    };
  }

  // Default fallback
  return {
    title: "Dashboard",
    breadcrumbs: [{ label: "Dashboard" }],
  };
}

export function DashboardHeader() {
  const pathname = usePathname();
  const { title, breadcrumbs } = getPageInfo(pathname);

  return (
    <header className="bg-surface border-b border-border">
      <div className="px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-2">
          <Link
            href="/dashboard"
            className="text-foreground-muted hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-foreground-subtle" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-foreground-muted hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
