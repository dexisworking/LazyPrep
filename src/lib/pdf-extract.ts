import "server-only";

/**
 * Extract plain text from a PDF Buffer.
 * Uses pdf-parse to extract text content, capped at 50,000 characters.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to handle CJS/ESM module requirements safely
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    const text = data.text ? data.text.trim() : "";
    return text.slice(0, 50_000);
  } catch (err) {
    console.error("[pdf-extract] Failed to extract text from PDF:", err);
    return "";
  }
}
