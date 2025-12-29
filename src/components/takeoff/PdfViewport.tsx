import React, { useEffect, useMemo, useState } from "react";
import { PdfPageCanvas } from "./PdfPageCanvas";

type Props = {
  doc: any;
  pageIndex: number; // 0-based
  renderScale: number; // pdf render scale (not takeoff scale)
  isDarkMode: boolean;
  onSize?: (width: number, height: number) => void;
};

export function PdfViewport({ doc, pageIndex, renderScale, isDarkMode, onSize }: Props) {
  const [page, setPage] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!doc) {
      setPage(null);
      setErr(null);
      return;
    }

    // Helpful debug: confirms how many pages pdfjs sees
    // eslint-disable-next-line no-console
    console.log("PDF loaded numPages =", doc?.numPages);

    (async () => {
      try {
        setErr(null);
        const numPages = Number(doc?.numPages || 0);

        // Clamp page index in case UI asked for an out-of-range page
        const safeIndex =
          numPages > 0 ? Math.max(0, Math.min(pageIndex, numPages - 1)) : 0;

        const p = await doc.getPage(safeIndex + 1);
        if (!cancelled) setPage(p);
      } catch (e: any) {
        if (!cancelled) {
          setPage(null);
          setErr(e?.message || "Failed to load PDF page");
        }
      }
    })();

    return () => {
      cancelled = true
    };
  }, [doc, pageIndex]);

  const frame = useMemo(
    () => (isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-200"),
    [isDarkMode]
  );

  if (!page) {
    return (
      <div className={`w-full h-full ${frame} flex items-center justify-center`}>
        <div className="text-xs opacity-70">
          {err ? `PDF page error: ${err}` : "Loading page..."}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className={`rounded-lg border ${frame} overflow-auto max-w-full max-h-full`}>
        <PdfPageCanvas page={page} scale={renderScale} className="shadow" onSize={onSize} />
      </div>
    </div>
  );
}
