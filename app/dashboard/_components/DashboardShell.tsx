"use client";

import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebarProvider } from "../_context/DashboardSidebarContext";

interface DashboardShellProps {
  userEmail: string;
  userName: string;
  children: React.ReactNode;
}

export function DashboardShell({
  userEmail,
  userName,
  children,
}: DashboardShellProps) {
  return (
    <DashboardSidebarProvider>
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen">
          <Sidebar userEmail={userEmail} userName={userName} />
          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            <DashboardHeader />
            <div className="flex-1 min-h-0 flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardSidebarProvider>
  );
}
