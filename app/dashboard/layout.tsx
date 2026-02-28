import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "./_components/DashboardShell";

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
    <DashboardShell userEmail={userEmail} userName={userName}>
      {children}
    </DashboardShell>
  );
}

