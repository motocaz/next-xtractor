"use client";

import { loadPDFWithPDFJS } from "@/lib/pdf/pdfjs-loader";

export const pdfToMarkdown = async (
  pdfFile: File,
  onProgress?: (currentPage: number, totalPages: number) => void,
): Promise<string> => {
  if (!pdfFile) {
    throw new Error("No PDF file provided");
  }

  const pdf = await loadPDFWithPDFJS(pdfFile);
  let markdown = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);

    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const text = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str)
      .join(" ");

    markdown += text + "\n\n";
  }

  return markdown;
};
