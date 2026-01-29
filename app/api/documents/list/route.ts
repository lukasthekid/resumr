import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type DocumentFileRow = { file_name: string | null };

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
    const rows = await prisma.$queryRaw<DocumentFileRow[]>`
      SELECT DISTINCT metadata->>'file_name' AS file_name
      FROM documents
      WHERE metadata->>'user_id' = ${String(userId)}
        AND metadata ? 'file_name'
        AND (metadata->>'file_name') IS NOT NULL
        AND (metadata->>'file_name') <> ''
      ORDER BY file_name ASC;
    `;

    const files = rows.map((r) => r.file_name).filter((v): v is string => !!v);
    return NextResponse.json({ ok: true, files });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to load document list.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

