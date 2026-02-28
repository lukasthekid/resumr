"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface DashboardSidebarContextValue {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
}

const DashboardSidebarContext = createContext<
  DashboardSidebarContextValue | undefined
>(undefined);

export function DashboardSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = useCallback(
    () => setMobileOpen((prev) => !prev),
    []
  );

  return (
    <DashboardSidebarContext.Provider
      value={{
        isMobileOpen,
        setMobileOpen,
        toggleMobile,
      }}
    >
      {children}
    </DashboardSidebarContext.Provider>
  );
}

export function useDashboardSidebar() {
  const ctx = useContext(DashboardSidebarContext);
  if (ctx === undefined) {
    throw new Error(
      "useDashboardSidebar must be used within DashboardSidebarProvider"
    );
  }
  return ctx;
}
