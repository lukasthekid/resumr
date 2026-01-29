import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const WEBHOOK_URL =
  "https://n8n.project100x.run.place/webhook/parse-job";

type ImportJobRequestBody = {
  url?: string;
};

type ParsedJob = {
  company_name: string;
  company_logo: string;
  job_title: string;
  location_city: string;
  country: string;
  number_of_applicants: number;
  job_description: string;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asInt(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return 0;
}

function coerceParsedJob(payload: unknown): ParsedJob | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;
  const maybeData =
    obj.data && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : null;
  const source = maybeData ?? obj;

  // Required fields (we normalize to defaults even if missing)
  return {
    company_name: asString(source.company_name),
    company_logo: asString(source.company_logo),
    job_title: asString(source.job_title),
    location_city: asString(source.location_city),
    country: asString(source.country),
    number_of_applicants: asInt(source.number_of_applicants),
    job_description: asString(source.job_description),
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.N8N_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing N8N_API_KEY in environment." },
      { status: 500 }
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userIdRaw = (session.user as { id?: string }).id;
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId)) {
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
      { status: 400 }
    );
  }

  // Check if job already exists in database (skip webhook parsing if so)
  const existingJob = await (prisma as any).jobListing.findUnique({
    where: { url: parsedUrl.toString() },
  });

  if (existingJob) {
    return NextResponse.json({
      ok: true,
      cached: true,
      jobUrl: parsedUrl.toString(),
      jobListing: existingJob,
    });
  }

  // Job doesn't exist yet - fetch and parse from webhook
  const user = await prisma.user.findUnique({
    // Prisma client types may lag until you run `prisma generate` after changing `User.id`.
    // We keep the runtime value numeric and relax TS here.
    where: { id: userId as any },
    select: { id: true, email: true, name: true },
  });

  const payload = {
    user: {
      id: user?.id ?? userId,
      email: user?.email ?? null,
      name: user?.name ?? null,
    },
    jobUrl: parsedUrl.toString(),
  };

  const webhookRes = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await webhookRes.text().catch(() => "");
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (!webhookRes.ok) {
    return NextResponse.json(
      {
        ok: false,
        webhookStatus: webhookRes.status,
        jobUrl: parsedUrl.toString(),
        error: "Job parsing failed.",
        webhookResponse: parsed ?? text,
      },
      { status: 502 }
    );
  }

  const job = coerceParsedJob(parsed);
  if (!job) {
    return NextResponse.json(
      {
        ok: false,
        webhookStatus: webhookRes.status,
        jobUrl: parsedUrl.toString(),
        error: "Job parsing returned invalid JSON.",
        webhookResponse: parsed ?? text,
      },
      { status: 502 }
    );
  }

  // Create the new job listing
  const jobListing = await (prisma as any).jobListing.create({
    data: {
      url: parsedUrl.toString(),
      companyName: job.company_name,
      companyLogo: job.company_logo,
      jobTitle: job.job_title,
      locationCity: job.location_city,
      country: job.country,
      numberOfApplicants: job.number_of_applicants,
      jobDescription: job.job_description,
    },
  });

  return NextResponse.json({
    ok: true,
    cached: false,
    webhookStatus: webhookRes.status,
    jobUrl: parsedUrl.toString(),
    jobListing,
  });
}

