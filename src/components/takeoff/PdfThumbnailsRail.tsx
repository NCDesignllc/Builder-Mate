import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  doc: any;               // pdfjs doc
  pages: number;
  pageIndex: number;      // 0-based selected
  onSelect: (i: number) => void;
  isDarkMode: boolean;
  className?: string;
};

function Thumb({
  doc,
  i,
  selected,
  onClick,
  isDarkMode,
}: {
  doc: any;
  i: number;
  selected: boolean;
  onClick: () => void;
  isDarkMode: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setDone(false);
        const page = await doc.getPage(i + 1);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 0.18 }); // thumbnail scale
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.ceil(viewport.width * dpr);
        canvas.height = Math.ceil(viewport.height * dpr);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;

        const ctx = canvas.getContext("2d", { alpha: false })!;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const task = page.render({ canvasContext: ctx, viewport });
        await task.promise;
        if (!cancelled) setDone(true);

        try {
          page.cleanup?.();
        } catch {}
      } catch {
        if (!cancelled) setDone(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doc, i]);

  const frame = selected
    ? "border-orange-500 ring-2 ring-orange-400"
    : isDarkMode
    ? "border-slate-700 hover:border-slate-500"
    : "border-slate-200 hover:border-slate-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex flex-col items-center gap-1 p-2 rounded-lg border ${frame} bg-white`}
      aria-label={`Select page ${i + 1}`}
      title={`Page ${i + 1}`}
    >
      <canvas ref={canvasRef} className="block bg-white rounded shadow-sm" />
      <div className="text-[10px] font-bold text-slate-700">{i + 1}</div>
      {!done && <div className="text-[10px] opacity-50">…</div>}
    </button>
  );
}

export function PdfThumbnailsRail({
  doc,
  pages,
  pageIndex,
  onSelect,
  isDarkMode,
  className = "",
}: Props) {
  const safePages = Math.max(0, Number(pages || 0));
  const safeIndex = Math.max(0, Math.min(Number(pageIndex || 0), Math.max(0, safePages - 1)));

  const shell = useMemo(
    () =>
      isDarkMode
        ? "bg-slate-900 border-slate-700 text-slate-100"
        : "bg-white border-slate-200 text-slate-900",
    [isDarkMode]
  );

  if (!doc || safePages <= 1) return null;

  return (
    <div
      className={`w-28 rounded-lg border overflow-auto ${shell} ${className}`}
      style={{ maxHeight: 600 }}
    >
      <div className="p-2 space-y-2">
        {Array.from({ length: safePages }, (_, i) => (
          <Thumb
            key={i}
            doc={doc}
            i={i}
            selected={i === safeIndex}
            onClick={() => onSelect(i)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
}
