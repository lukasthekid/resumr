"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sky-50 text-sky-600 ring-1 ring-sky-200"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="w-[280px] shrink-0 border-r border-slate-200 bg-white">
      <div className="h-full px-4 py-5 flex flex-col">
        <div className="px-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-sm">
              <div className="h-3.5 w-3.5 rounded bg-white" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-900">
                resumr
              </div>
              <div className="text-xs text-slate-500">
                AI resumes & cover letters
              </div>
            </div>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/dashboard/applications">Applications</NavLink>
          <NavLink href="/dashboard/documents">Documents</NavLink>
          <NavLink href="/dashboard/settings">Settings</NavLink>
        </nav>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

