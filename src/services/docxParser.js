// DOCX text extraction using mammoth.
// mammoth runs entirely in the browser and gives us decent plain text out of Word documents.
import mammoth from 'mammoth/mammoth.browser.js';

export async function extractTextFromDocx(file) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return (result.value || '').trim();
}
