// pdfWorker.ts (pdfjs-dist v5.x)
// Vite + ESM worker setup for pdfjs-dist@5.*

import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// @ts-expect-error - pdfjs typing sometimes omits this
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export default pdfjs;
