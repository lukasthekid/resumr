declare module "pdf-parse" {
  export type PdfParseResult = {
    text: string;
    numpages?: number;
    info?: unknown;
    metadata?: unknown;
    version?: string;
  };

  export default function pdfParse(data: Buffer | Uint8Array): Promise<PdfParseResult>;
}

