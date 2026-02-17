"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

function NavLink({
  href,
  children,
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-white shadow-sm"
          : "text-foreground-muted hover:bg-slate-50 hover:text-foreground",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

interface SidebarProps {
  userEmail: string;
  userName: string;
}

export function Sidebar({ userEmail, userName }: SidebarProps) {
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface">
      <div className="h-full px-4 py-6 flex flex-col">
        {/* Logo */}
        <Link href="/dashboard" className="px-2 mb-8 block">
          <div className="flex items-center gap-3">
            <img
              src="/Resumr.svg"
              alt="Resumr"
              className="h-10 w-10"
            />
            <div>
              <div className="text-base font-bold tracking-tight text-foreground">
                Resum<span className="text-indigo-600">r</span>
              </div>
              <div className="text-xs text-foreground-subtle">
                AI-Powered Career Tools
              </div>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          <NavLink href="/dashboard" icon={LayoutDashboard}>
            Dashboard
          </NavLink>
          <NavLink href="/dashboard/applications" icon={Briefcase}>
            Applications
          </NavLink>
          <NavLink href="/dashboard/settings" icon={Settings}>
            Settings
          </NavLink>
        </nav>

        {/* User Profile - Bottom */}
        <div className="mt-auto pt-6 border-t border-border">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center text-white font-semibold text-sm shadow-sm">
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
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

