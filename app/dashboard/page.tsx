import { auth } from "@/auth";
import { ImportJobForm } from "./_components/ImportJobForm";

export default async function DashboardHome() {
  const session = await auth();
  const email = session?.user?.email ?? "unknown";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-600">
          Signed in as <span className="text-slate-800 font-medium">{email}</span>
        </p>
        <p className="text-sm text-slate-600">
          This is where you start: import a job post so we can extract the role
          details and generate tailored outputs.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Import a Job</h2>
          <p className="text-sm text-slate-600">
            Paste a job link. We’ll send it to your parsing workflow and show the
            extracted job details.
          </p>
        </div>
        <div className="mt-5">
          <ImportJobForm />
        </div>
      </section>
    </div>
  );
}

