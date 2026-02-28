import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./_components/Sidebar";
import { DashboardHeader } from "./_components/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const userEmail = session.user.email || "";
  const userName = session.user.name || userEmail.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <Sidebar userEmail={userEmail} userName={userName} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 min-h-0 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

