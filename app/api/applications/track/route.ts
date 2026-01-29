import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type TrackApplicationBody = {
  jobId?: number;
  status?: string;
  notes?: string;
};

const VALID_STATUSES = [
  "SAVED",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userIdRaw = (session.user as { id?: string }).id;
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as TrackApplicationBody | null;
  const jobId = Number(body?.jobId);
  const status = (body?.status ?? "SAVED").toUpperCase();
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!Number.isFinite(jobId)) {
    return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status as any)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (notes.length > 5000) {
    return NextResponse.json(
      { error: "Notes are too long (max 5000 chars)." },
      { status: 400 }
    );
  }

  // Check job exists
  const job = await (prisma as any).jobListing.findUnique({
    where: { id: jobId },
  });
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  // Verify user exists (this ensures the userId is valid for the FK constraint)
  const user = await prisma.user.findUnique({
    where: { id: userId as any },
    select: { id: true },
  });
  
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Upsert application
  const application = await (prisma as any).jobApplication.upsert({
    where: {
      userId_jobId: {
        userId: user.id,
        jobId,
      },
    },
    create: {
      userId: user.id,
      jobId,
      status,
      notes: notes || null,
      appliedAt: status === "APPLIED" ? new Date() : null,
    },
    update: {
      status,
      notes: notes || null,
      appliedAt:
        status === "APPLIED"
          ? new Date()
          : status === "SAVED"
          ? null
          : undefined,
    },
    include: {
      job: true,
    },
  });

  return NextResponse.json({
    ok: true,
    application,
  });
}
