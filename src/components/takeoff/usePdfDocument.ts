import { useEffect, useState } from "react";
import pdfjs from "./pdfWorker";
import type { PlanSource } from "./types";

type PdfState = {
  doc: any | null;
  pages: number;
  loading: boolean;
  error: string | null;
};

async function loadPdfFromPlan(plan: PlanSource): Promise<any> {
  // Strongly prefer ArrayBuffer (reliable for blob: URLs and multi-page)
  try {
    if (plan.file) {
      const buf = await plan.file.arrayBuffer();
      return await (pdfjs as any).getDocument({ data: buf }).promise;
    }
    if (plan.url?.startsWith("blob:")) {
      const res = await fetch(plan.url);
      const buf = await res.arrayBuffer();
      return await (pdfjs as any).getDocument({ data: buf }).promise;
    }
  } catch {
    // fall through
  }

  // Fallback: direct URL (best for http(s) PDFs)
  return await (pdfjs as any).getDocument({ url: plan.url }).promise;
}

export function usePdfDocument(plan?: PlanSource | null): PdfState {
  const [doc, setDoc] = useState<any | null>(null);
  const [pages, setPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) {
      setDoc(null);
      setPages(0);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const d = await loadPdfFromPlan(plan);
        if (cancelled) return;
        setDoc(d);
        setPages(d?.numPages || 0);
      } catch (e: any) {
        if (cancelled) return;
        setDoc(null);
        setPages(0);
        setError(e?.message || "Failed to load PDF");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [plan?.url, plan?.name]);

  return { doc, pages, loading, error };
}
