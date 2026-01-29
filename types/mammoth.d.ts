declare module "mammoth" {
  export type ExtractRawTextOptions = { buffer: Buffer };
  export type ExtractRawTextResult = { value: string; messages: unknown[] };

  export function extractRawText(
    options: ExtractRawTextOptions
  ): Promise<ExtractRawTextResult>;

  const mammoth: {
    extractRawText: typeof extractRawText;
  };
  export default mammoth;
}

