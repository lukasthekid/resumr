import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AppHome() {
  const session = await auth();
  if (!session?.user) redirect("/");
  redirect("/dashboard");
}

