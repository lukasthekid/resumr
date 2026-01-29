import mammoth from "mammoth";
import pdfParse from "pdf-parse";

export type ExtractedDocument = {
  source: "upload";
  filename?: string;
  mimeType?: string;
  text: string;
};

function normalizeText(text: string) {
  return text.replace(/\r\n/g, "\n").trim();
}

export async function extractTextFromUpload(file: File): Promise<ExtractedDocument> {
  const filename = file.name || "upload";
  const mimeType = file.type || "application/octet-stream";

  const ext = filename.toLowerCase().split(".").pop() ?? "";
  const bytes = Buffer.from(await file.arrayBuffer());

  if (mimeType === "application/pdf" || ext === "pdf") {
    const out = await pdfParse(bytes);
    return {
      source: "upload",
      filename,
      mimeType,
      text: normalizeText(out.text || ""),
    };
  }

  // Word (modern)
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const out = await mammoth.extractRawText({ buffer: bytes });
    return {
      source: "upload",
      filename,
      mimeType,
      text: normalizeText(out.value || ""),
    };
  }

  throw new Error(`Unsupported file type: ${filename}`);
}

