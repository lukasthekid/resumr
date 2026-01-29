import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./_components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
              <div className="absolute top-32 left-[-140px] h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl" />
            </div>
            <div className="relative px-6 py-8 lg:px-10">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

