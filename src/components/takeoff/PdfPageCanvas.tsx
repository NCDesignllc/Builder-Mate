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

  useEffect(() => {
    if (!page || !ref.current) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const dpr = window.devicePixelRatio || 1;

    // New render ticket (prevents stale renders “winning”)
    const ticket = ++ticketRef.current;

    // Build viewport in CSS pixels
    const viewport = page.getViewport({ scale });

    // Set canvas backing store in device pixels, but keep CSS size in CSS pixels
    canvas.style.width = `${Math.ceil(viewport.width)}px`;
    canvas.style.height = `${Math.ceil(viewport.height)}px`;
    canvas.width = Math.ceil(viewport.width * dpr);
    canvas.height = Math.ceil(viewport.height * dpr);

    onSize?.(Math.ceil(viewport.width), Math.ceil(viewport.height));

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

      // Cleanup page resources (prevents “stuck” rendering on some PDFs)
      try {
        page?.cleanup?.();
      } catch {}

      // If another render started, this one is stale
      if (ticketRef.current !== ticket) return;
    };
  }, [page, scale, onSize]);

  return <canvas ref={ref} className={`block bg-white ${className}`} />;
}

