import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseJobFromUrl, JobParseError } from "@/lib/services/jobParser";
import { normalizeJobUrl } from "@/lib/services/urlNormalizer";

export const runtime = "nodejs";

type ImportJobRequestBody = {
  url?: string;
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as ImportJobRequestBody | null;
  const urlRaw = (body?.url ?? "").trim();
  if (!urlRaw) {
    return NextResponse.json({ error: "Please provide a job URL." }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlRaw);
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "URL must start with http:// or https://." },
      { status: 400 },
    );
  }

  // Normalise the URL (e.g. karriere.at search page with #jobId → direct job page)
  const jobUrl = normalizeJobUrl(parsedUrl.toString());

  // Return cached listing if this URL has already been imported
  const existing = await (prisma as any).jobListing.findUnique({
    where: { url: jobUrl },
  });

  if (existing) {
    return NextResponse.json({ ok: true, cached: true, jobListing: existing });
  }

  // Parse the job posting from the live page
  let job;
  try {
    job = await parseJobFromUrl(jobUrl);
  } catch (error) {
    const message =
      error instanceof JobParseError
        ? error.message
        : "An unexpected error occurred while parsing the job.";

    const status = error instanceof JobParseError && error.message.includes("Rate limited")
      ? 429
      : 502;

    return NextResponse.json({ ok: false, error: message }, { status });
  }

  // Persist the parsed job as a new JobListing
  const jobListing = await (prisma as any).jobListing.create({
    data: {
      url: jobUrl,
      companyName: job.company_name,
      companyLogo: job.company_logo,
      jobTitle: job.job_title,
      locationCity: job.location_city,
      country: job.country,
      numberOfApplicants: job.number_of_applicants,
      jobDescription: job.job_description,
    },
  });

  return NextResponse.json({ ok: true, cached: false, jobListing });
}
