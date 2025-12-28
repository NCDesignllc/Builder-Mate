import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PdfPageCanvas } from "./PdfPageCanvas";
import { InteractiveCanvas } from "./InteractiveCanvas";
import type { Measurement, TakeoffScale, TakeoffTool } from "./types";

type Props = {
  doc: any;
  pageIndex: number;
  renderScale: number;
  isDarkMode: boolean;
  tool: TakeoffTool;
  measurements: Measurement[];
  scale: TakeoffScale | null;
  labelsVisible?: boolean;
  onAddMeasurement: (m: Measurement) => void;
  onUpdateMeasurement: (id: string, patch: Partial<Measurement>) => void;
  onDeleteMeasurement: (id: string) => void;
  onScaleCalibration?: (pixelDistance: number) => void;
};

/**
 * Enhanced PdfViewport with interactive measurement overlay
 */
export function PdfViewportInteractive({
  doc,
  pageIndex,
  renderScale,
  isDarkMode,
  tool,
  measurements,
  scale,
  labelsVisible = true,
  onAddMeasurement,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onScaleCalibration,
}: Props) {
  const [page, setPage] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!doc) {
      setPage(null);
      setErr(null);
      return;
    }

    (async () => {
      try {
        setErr(null);
        const numPages = Number(doc?.numPages || 0);
        const safeIndex = numPages > 0 ? Math.max(0, Math.min(pageIndex, numPages - 1)) : 0;
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
      cancelled = true;
    };
  }, [doc, pageIndex]);

  const frame = useMemo(
    () => (isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-200"),
    [isDarkMode]
  );

  const onCanvasSize = useCallback((w: number, h: number) => {
    setCanvasSize({ width: w, height: h });
  }, []);

  if (!page) {
    return (
      <div className={`w-full h-full ${frame} flex items-center justify-center`}>
        <div className="text-xs opacity-70">
          {err ? `PDF page error: ${err}` : "Loading page..."}
        </div>
      </div>
    );
  }

  const cursorClass = 
    tool === "pan" ? "cursor-grab" :
    tool === "select" ? "cursor-pointer" :
    "cursor-crosshair";

  return (
    <div ref={containerRef} className={`relative inline-block ${frame} rounded-lg border ${cursorClass}`}>
      <PdfPageCanvas page={page} scale={renderScale} onSize={onCanvasSize} className="block" />
      {canvasSize.width > 0 && canvasSize.height > 0 && (
        <InteractiveCanvas
          tool={tool}
          measurements={measurements}
          pageIndex={pageIndex}
          scale={scale}
          width={canvasSize.width}
          height={canvasSize.height}
          zoom={1} // Canvas is already scaled by renderScale
          labelsVisible={labelsVisible}
          onAddMeasurement={onAddMeasurement}
          onUpdateMeasurement={onUpdateMeasurement}
          onDeleteMeasurement={onDeleteMeasurement}
          onScaleCalibration={onScaleCalibration}
        />
      )}
    </div>
  );
}
