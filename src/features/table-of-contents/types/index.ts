export interface GenerateTOCMessage {
  command: "generate-toc";
  pdfData: ArrayBuffer;
  title: string;
  fontSize: number;
  fontFamily: number;
  addBookmark: boolean;
}

export interface TOCSuccessResponse {
  status: "success";
  pdfBytes: ArrayBuffer;
}

export interface TOCErrorResponse {
  status: "error";
  message: string;
}

export type TOCWorkerResponse = TOCSuccessResponse | TOCErrorResponse;

export interface TableOfContentsOptions {
  title: string;
  fontSize: number;
  fontFamily: number;
  addBookmark: boolean;
}
