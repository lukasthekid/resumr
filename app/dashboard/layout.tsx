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
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

