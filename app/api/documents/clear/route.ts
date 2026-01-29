import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE() {
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
    // `metadata` is JSONB; user_id is stored inside it.
    // Use `->>` to compare as text (covers numeric JSON values too).
    const deleted = await prisma.$executeRaw`
      DELETE FROM documents
      WHERE metadata->>'user_id' = ${String(userId)};
    `;

    return NextResponse.json({ ok: true, deleted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete documents.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

