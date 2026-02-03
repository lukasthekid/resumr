import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const WEBHOOK_URL =
  "https://n8n.project100x.run.place/webhook/create_cover_letter";

type GenerateCoverLetterBody = {
  jobId?: number;
  language?: string;
  instructions?: string;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function pickCoverLetterText(payload: unknown): string | null {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;
  const candidates = [
    obj.cover_letter,
    obj.coverLetter,
    obj.letter,
    obj.text,
    obj.content,
    obj.output,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c;
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

  const userId = (session.user as { id?: string }).id;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as GenerateCoverLetterBody | null;
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
    where: { id: userId },
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
        error: "Cover letter generation failed.",
        webhookResponse: parsed ?? text,
      },
      { status: 502 }
    );
  }

  const coverLetterText = pickCoverLetterText(parsed ?? text);

  return NextResponse.json({
    ok: true,
    webhookStatus: webhookRes.status,
    coverLetter: coverLetterText,
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

