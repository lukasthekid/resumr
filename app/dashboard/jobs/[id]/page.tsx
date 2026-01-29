import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ExpandableJobDescription } from "../_components/ExpandableJobDescription";
import { CoverLetterGenerator } from "../_components/CoverLetterGenerator";
import { JobApplicationTracker } from "../_components/JobApplicationTracker";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isFinite(jobId)) notFound();

  // Prisma client types may lag until you run `prisma generate` after schema changes.
  // We keep runtime behavior correct and relax TS here.
  const job = await (prisma as any).jobListing.findUnique({
    where: { id: jobId },
  });

  if (!job) notFound();

  const locationParts = [job.locationCity, job.country].filter(
    (v: unknown): v is string => typeof v === "string" && v.trim().length > 0
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to dashboard
        </Link>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-sky-600 hover:text-sky-700 transition-colors"
          >
            Open original posting
          </a>
        )}
      </div>

      <header className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-start gap-4">
          {job.companyLogo ? (
            // Use <img> (not next/image) to avoid domain allowlist config.
            <img
              src={job.companyLogo}
              alt={job.companyName ? `${job.companyName} logo` : "Company logo"}
              className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 object-contain"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50" />
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {job.jobTitle || "Job listing"}
            </h1>
            <div className="mt-1 text-sm text-slate-600">
              <span className="text-slate-800 font-medium">
                {job.companyName || "Unknown company"}
              </span>
              {locationParts.length > 0 && (
                <>
                  {" "}
                  · <span>{locationParts.join(", ")}</span>
                </>
              )}
              {typeof job.numberOfApplicants === "number" && (
                <>
                  {" "}
                  ·{" "}
                  <span>
                    {job.numberOfApplicants.toLocaleString()} applicant
                    {job.numberOfApplicants === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <JobApplicationTracker jobId={job.id} />
        </div>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Job description</h2>
        <div className="mt-3 text-sm text-slate-700">
          <ExpandableJobDescription text={job.jobDescription ?? ""} />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Cover letter</h2>
        <div className="mt-4">
          <CoverLetterGenerator jobId={job.id} />
        </div>
      </section>
    </div>
  );
}

