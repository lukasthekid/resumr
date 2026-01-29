import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  extractTextFromUpload,
  type ExtractedDocument,
} from "@/lib/documents/extractText";

export const runtime = "nodejs";

const WEBHOOK_URL =
  "https://n8n.project100x.run.place/webhook/upload_document";

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

  const user = await prisma.user.findUnique({
    // Prisma client types may lag until you run `prisma generate` after changing `User.id`.
    // We keep the runtime value numeric and relax TS here.
    where: { id: userId as any },
    select: { id: true, email: true, name: true },
  });

  const form = await req.formData();
  const files = form
    .getAll("files")
    .filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json(
      { error: "Please upload at least one PDF or DOCX file." },
      { status: 400 }
    );
  }

  // Simple size limit (per file) to avoid runaway memory usage.
  const MAX_BYTES = 10 * 1024 * 1024; // 10MB
  for (const f of files) {
    if (f.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large: ${f.name} (max 10MB)` },
        { status: 400 }
      );
    }
  }

  const extracted: ExtractedDocument[] = [];
  const errors: Array<{ item: string; error: string }> = [];

  for (const f of files) {
    try {
      const doc = await extractTextFromUpload(f);
      extracted.push(doc);
    } catch (e) {
      errors.push({
        item: f.name || "upload",
        error: e instanceof Error ? e.message : "Failed to extract text.",
      });
    }
  }

  if (extracted.length === 0) {
    return NextResponse.json(
      { error: "No documents could be processed.", errors },
      { status: 400 }
    );
  }

  const payload = {
    user: {
      id: user?.id ?? userId,
      email: user?.email ?? null,
      name: user?.name ?? null,
    },
    documents: extracted.map((d) => ({
      source: d.source,
      filename: d.filename ?? null,
      mimeType: d.mimeType ?? null,
      url: null,
      text: d.text,
    })),
  };

  const webhookRes = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const webhookBody = await webhookRes.text().catch(() => "");

  return NextResponse.json({
    ok: webhookRes.ok,
    webhookStatus: webhookRes.status,
    processed: extracted.length,
    failed: errors.length,
    errors,
    webhookResponse: webhookBody,
  });
}

