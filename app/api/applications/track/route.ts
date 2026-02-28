import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type TrackApplicationBody = {
  jobId?: number;
  stage?: string;
  notes?: string;
};

const VALID_STAGES = [
  "applied",
  "interviewing",
  "final_round",
  "offer",
  "rejected",
] as const;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as TrackApplicationBody | null;
  const jobId = Number(body?.jobId);
  const stage = (body?.stage ?? "applied").toLowerCase();
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!Number.isFinite(jobId)) {
    return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
  }

  if (!VALID_STAGES.includes(stage as (typeof VALID_STAGES)[number])) {
    return NextResponse.json({ error: "Invalid stage." }, { status: 400 });
  }

  if (notes.length > 5000) {
    return NextResponse.json(
      { error: "Notes are too long (max 5000 chars)." },
      { status: 400 }
    );
  }

  const job = await (prisma as any).jobListing.findUnique({
    where: { id: jobId },
  });
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const application = await (prisma as any).jobApplication.upsert({
    where: {
      userId_jobId: {
        userId: userId,
        jobId,
      },
    },
    create: {
      userId: userId,
      jobId,
      stage,
      notes: notes || null,
      appliedAt: new Date(),
    },
    update: {
      stage,
      notes: notes || null,
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
