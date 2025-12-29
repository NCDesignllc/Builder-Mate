import React, { useEffect, useRef } from "react";

type Props = {
  page: any;
  scale: number;
  className?: string;
  onSize?: (w: number, h: number) => void;
};

export function PdfPageCanvas({ page, scale, className = "", onSize }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const ticketRef = useRef(0);

  // Keep the latest onSize in a ref so we don't need to include it in the render-effect deps.
  const onSizeRef = useRef<typeof onSize | undefined>(onSize);
  useEffect(() => {
    onSizeRef.current = onSize;
  }, [onSize]);

  // Remember the last reported size to avoid calling onSize with identical values.
  const lastSizeRef = useRef<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!page || !ref.current) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const dpr = window.devicePixelRatio || 1;

    // New render ticket (prevents stale renders "winning")
    const ticket = ++ticketRef.current;

    // Build viewport in CSS pixels
    const viewport = page.getViewport({ scale });

    const wCss = Math.ceil(viewport.width);
    const hCss = Math.ceil(viewport.height);

    // Set canvas backing store in device pixels, but keep CSS size in CSS pixels
    canvas.style.width = `${wCss}px`;
    canvas.style.height = `${hCss}px`;
    canvas.width = Math.ceil(viewport.width * dpr);
    canvas.height = Math.ceil(viewport.height * dpr);

    // Only call onSize if size actually changed
    const last = lastSizeRef.current;
    if (!last || last.w !== wCss || last.h !== hCss) {
      lastSizeRef.current = { w: wCss, h: hCss };
      try {
        onSizeRef.current?.(wCss, hCss);
      } catch (err) {
        // Guard against parent errors causing render loops
        console.error("onSize callback error:", err);
      }
    }

    // Reset transform + clear fully
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale drawing to DPR
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const renderTask = page.render({
      canvasContext: ctx,
      viewport,
      // intent: "display", // optional
    });

    // ✅ Catch and ignore normal cancellation
    renderTask.promise.catch((err: any) => {
      if (err?.name === "RenderingCancelledException") return;
      console.error("PDF render error:", err);
    });

    return () => {
      // Cancel the render if we switch pages quickly
      try {
        renderTask?.cancel?.();
      } catch {}

      // Cleanup page resources (prevents "stuck" rendering on some PDFs)
      try {
        page?.cleanup?.();
      } catch {}

      // If another render started, this one is stale
      if (ticketRef.current !== ticket) return;
    };
  }, [page, scale]); // onSize intentionally not included — it is read from ref

  return <canvas ref={ref} className={`block bg-white ${className}`} />;
}
