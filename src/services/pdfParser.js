// Client-side PDF text extraction using pdfjs-dist (v5+).
// Worker URL is loaded via Vite's ?url asset suffix. v5 ships an ES module worker (.mjs).
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * Extracts plain text from a PDF File/Blob, preserving line breaks between text items
 * that are vertically separated. Good enough for resume parsing.
 */
export async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const allText = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Group items into lines based on Y coordinate so newlines roughly survive.
    const lines = new Map();
    for (const item of content.items) {
      const y = Math.round(item.transform[5]);
      if (!lines.has(y)) lines.set(y, []);
      lines.get(y).push(item);
    }

    // Sort by y descending (top of page first), then x ascending within a line.
    const sortedYs = [...lines.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) {
      const lineItems = lines.get(y).sort((a, b) => a.transform[4] - b.transform[4]);
      allText.push(lineItems.map((i) => i.str).join(' ').trim());
    }
    allText.push('');
  }

  return allText.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
