import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const WEBHOOK_URL =
  "https://n8n.project100x.run.place/webhook/create_resume";

type GenerateResumeBody = {
  jobId?: number;
  language?: string;
  instructions?: string;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

type ResumeData = {
  personal?: {
    name?: string;
    location?: string;
    email?: string;
    phone?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  education?: Array<{
    institution?: string;
    location?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
    highlights?: string[];
  }>;
  workExperience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    achievements?: string[];
  }>;
  projects?: Array<{
    name?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    url?: string;
    description?: string[];
  }>;
  skills?: {
    programmingLanguages?: string[];
    technologies?: string[];
    tools?: string[];
  };
  extracurriculars?: Array<{
    activity?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }>;
};

function extractResumeData(payload: unknown): ResumeData | null {
  if (!payload || typeof payload !== "object") return null;
  
  // If the payload is already structured correctly, return it
  const obj = payload as any;
  if (obj.personal || obj.education || obj.workExperience || obj.skills) {
    return obj as ResumeData;
  }
  
  // Check common wrapper fields
  const candidates = [obj.resume, obj.cv, obj.data, obj.result];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object") {
      if (candidate.personal || candidate.education || candidate.workExperience) {
        return candidate as ResumeData;
      }
    }
  }
  
  return null;
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

  const body = (await req.json().catch(() => null)) as GenerateResumeBody | null;
  const jobId = Number(body?.jobId);
  const language = asString(body?.language).trim();
  const instructions = asString(body?.instructions).trim();

  if (!Number.isFinite(jobId)) {
    return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
  }
  if (!language) {
    return NextResponse.json({ error: "Please select a language." }, { status: 400 });
  }
  if (language.length > 60) {
    return NextResponse.json({ error: "Language is too long." }, { status: 400 });
  }
  if (instructions.length > 2000) {
    return NextResponse.json(
      { error: "Custom instructions are too long (max 2000 chars)." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    // Prisma client types may lag until you run `prisma generate` after schema changes.
    // We keep the runtime value numeric and relax TS here.
    where: { id: userId as any },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      phoneNumber: true,
      streetAddress: true,
      city: true,
      postcode: true,
      country: true,
      linkedInUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Prisma client types may lag until you run `prisma generate` after schema changes.
  // We keep runtime behavior correct and relax TS here.
  const job = await (prisma as any).jobListing.findUnique({
    where: { id: jobId },
  });
  if (!job) {
    return NextResponse.json({ error: "Job listing not found." }, { status: 404 });
  }

  const payload = {
    user: {
      id: user?.id ?? userId,
      email: user?.email ?? null,
      name: user?.name ?? null,
      image: user?.image ?? null,
      phoneNumber: user?.phoneNumber ?? null,
      streetAddress: user?.streetAddress ?? null,
      city: user?.city ?? null,
      postcode: user?.postcode ?? null,
      country: user?.country ?? null,
      linkedInUrl: user?.linkedInUrl ?? null,
      createdAt: user?.createdAt ?? null,
      updatedAt: user?.updatedAt ?? null,
    },
    job: {
      id: job.id,
      url: job.url,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      jobTitle: job.jobTitle,
      locationCity: job.locationCity,
      country: job.country,
      numberOfApplicants: job.numberOfApplicants,
      jobDescription: job.jobDescription,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    },
    language,
    instructions,
  };

  console.log("=== RESUME WEBHOOK REQUEST ===");
  console.log("URL:", WEBHOOK_URL);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  const webhookRes = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  console.log("=== RESUME WEBHOOK RESPONSE ===");
  console.log("Status:", webhookRes.status);
  console.log("Status Text:", webhookRes.statusText);

  const text = await webhookRes.text().catch(() => "");
  console.log("Response Text:", text);

  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Failed to parse webhook response:", e);
    parsed = null;
  }

  if (!webhookRes.ok) {
    return NextResponse.json(
      {
        ok: false,
        webhookStatus: webhookRes.status,
        error: "Resume generation failed.",
        webhookResponse: parsed ?? text,
      },
      { status: 502 }
    );
  }

  const resumeData = extractResumeData(parsed);

  console.log("=== EXTRACTED RESUME DATA ===");
  console.log("Resume Data:", JSON.stringify(resumeData, null, 2));

  if (!resumeData) {
    console.error("Failed to extract resume data from webhook response");
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid resume data format received from webhook.",
        webhookResponse: parsed ?? text,
      },
      { status: 502 }
    );
  }

  console.log("=== RESUME GENERATION SUCCESS ===");

  return NextResponse.json({
    ok: true,
    webhookStatus: webhookRes.status,
    resumeData,
    user: {
      name: user?.name ?? null,
      email: user?.email ?? null,
      phoneNumber: user?.phoneNumber ?? null,
      streetAddress: user?.streetAddress ?? null,
      city: user?.city ?? null,
      postcode: user?.postcode ?? null,
      country: user?.country ?? null,
      linkedInUrl: user?.linkedInUrl ?? null,
    },
    job: {
      id: job.id,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      jobTitle: job.jobTitle,
      locationCity: job.locationCity,
      country: job.country,
    },
    webhookResponse: parsed ?? text,
  });
}
