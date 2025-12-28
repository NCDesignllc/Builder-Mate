// pdfWorker.ts (pdfjs-dist v5.x)
// Vite + ESM worker setup for pdfjs-dist@5.*

import * as pdfjs from "pdfjs-dist/build/pdf.mjs";

// Use Vite's asset resolution for proper worker bundling
// @ts-expect-error - pdfjs typing sometimes omits this
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default pdfjs;
