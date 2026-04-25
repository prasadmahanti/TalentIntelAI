// Single dispatcher for file -> text extraction. Keeps callers ignorant of file types.

export async function extractText(file) {
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();

  // PDFs are the most common — handle first.
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const { extractTextFromPdf } = await import('./pdfParser.js');
    return extractTextFromPdf(file);
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    const { extractTextFromDocx } = await import('./docxParser.js');
    return extractTextFromDocx(file);
  }

  // Plain text fallback — useful for testing.
  if (type.startsWith('text/') || name.endsWith('.txt')) {
    return await file.text();
  }

  throw new Error(
    `Unsupported file type: ${file.type || name}. Please upload a PDF, DOCX, or TXT file.`
  );
}
