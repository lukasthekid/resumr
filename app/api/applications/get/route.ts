import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userIdRaw = (session.user as { id?: string }).id;
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = Number(searchParams.get("jobId"));

  if (!Number.isFinite(jobId)) {
    return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
  }

  try {
    const application = await (prisma as any).jobApplication.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      include: {
        job: true,
      },
    });

    return NextResponse.json({ ok: true, application });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to load application.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
