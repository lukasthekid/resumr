"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

function NavLink({
  href,
  icon: Icon,
  label,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={[
        "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-4 py-2.5",
        active
          ? "bg-primary text-white shadow-sm"
          : "text-foreground-muted hover:bg-slate-50 hover:text-foreground",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

interface SidebarProps {
  userEmail: string;
  userName: string;
}

export function Sidebar({ userEmail, userName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={[
        "shrink-0 border-r border-border bg-surface flex flex-col",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      ].join(" ")}
    >
      <div className="h-full px-3 py-6 flex flex-col overflow-hidden">

        {/* Logo + Toggle Row */}
        <div
          className={[
            "flex items-center mb-8",
            collapsed ? "justify-center" : "justify-between px-1",
          ].join(" ")}
        >
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
              <img src="/Resumr.svg" alt="Resumr" className="h-10 w-10 shrink-0" />
              <div className="min-w-0">
                <div className="text-base font-bold tracking-tight text-foreground whitespace-nowrap">
                  Resum<span className="text-indigo-600">r</span>
                </div>
                <div className="text-xs text-foreground-subtle whitespace-nowrap">
                  AI-Powered Career Tools
                </div>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link href="/dashboard" title="Dashboard">
              <img src="/Resumr.svg" alt="Resumr" className="h-8 w-8" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={[
              "rounded-lg p-1.5 text-foreground-subtle hover:bg-slate-100 hover:text-foreground transition-colors",
              collapsed ? "hidden" : "ml-1 shrink-0",
            ].join(" ")}
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Collapse toggle when collapsed — sits at top */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="mb-4 mx-auto flex items-center justify-center rounded-lg p-1.5 text-foreground-subtle hover:bg-slate-100 hover:text-foreground transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          <NavLink
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={collapsed}
          />
          <NavLink
            href="/dashboard/applications"
            icon={Briefcase}
            label="Applications"
            collapsed={collapsed}
          />
          <NavLink
            href="/dashboard/settings"
            icon={Settings}
            label="Settings"
            collapsed={collapsed}
          />
        </nav>

        {/* User Profile — Bottom */}
        <div className="mt-auto pt-6 border-t border-border">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                title={userName}
                className="h-9 w-9 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0"
              >
                {userInitials}
              </div>
              <button
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/";
                }}
                title="Logout"
                className="flex items-center justify-center rounded-lg p-2 text-foreground-muted hover:bg-slate-50 hover:text-foreground transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-2 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {userName}
                  </div>
                  <div className="text-xs text-foreground-muted truncate">
                    {userEmail}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/";
                }}
                className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground-muted hover:bg-slate-50 hover:text-foreground transition-all duration-200"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
