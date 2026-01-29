import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userIdRaw = (session.user as { id?: string }).id;
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await (prisma as any).jobApplication.findMany({
      where: { userId },
      include: {
        job: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ ok: true, applications });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to load applications.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
