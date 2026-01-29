import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * DELETE /api/documents/delete?fileName=...
 * Deletes all document rows for the current user with the given metadata file_name.
 * Multiple documents can share one filename (e.g. chunks); all are removed.
 * Filtered by user_id and file_name so users can only delete their own files.
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userIdRaw = (session.user as { id?: string }).id;
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const fileName = url.searchParams.get("fileName");
  if (fileName == null || fileName.trim() === "") {
    return NextResponse.json(
      { error: "Missing or empty fileName query parameter." },
      { status: 400 }
    );
  }

  const decodedFileName = decodeURIComponent(fileName.trim());

  try {
    const deleted = await prisma.$executeRaw`
      DELETE FROM documents
      WHERE metadata->>'user_id' = ${String(userId)}
        AND metadata->>'file_name' = ${decodedFileName}
    `;

    return NextResponse.json({ ok: true, deleted: Number(deleted) });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to delete documents.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
