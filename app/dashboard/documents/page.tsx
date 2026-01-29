import { redirect } from "next/navigation";

export default function DocumentsPage() {
  // Redirect to settings page where documents are now managed
  redirect("/dashboard/settings");
}
