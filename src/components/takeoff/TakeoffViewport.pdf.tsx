import React, { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { usePdfDocument } from "./usePdfDocument";
import { PdfViewportInteractive } from "./PdfViewportInteractive";
import { ScaleModal } from "./ScaleModal";
import type { PlanSource, Measurement, TakeoffScale, TakeoffTool } from "./types";

type Props = {
  isDarkMode: boolean;
  plan: PlanSource | null;
  pageIndex?: number; // 0-based
  renderScale?: number; // initial visual scale, default 1.5
  tool: TakeoffTool;
  measurements: Measurement[];
  scale: TakeoffScale | null;
  labelsVisible?: boolean;
  onAddMeasurement: (m: Measurement) => void;
  onUpdateMeasurement: (id: string, patch: Partial<Measurement>) => void;
  onDeleteMeasurement: (id: string) => void;
  onSetScale: (scale: TakeoffScale) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * TakeoffViewportPdf
 * - Fullscreen toggle: F
 * - Exit fullscreen: Esc
 * - Zoom:
 *    - Mouse wheel over canvas area zooms (prevents scroll-pan)
 *    - +/- buttons
 *    - Keyboard +/- ; 0 resets to 100%
 * - Keeps a top toolbar placeholder for future takeoff tools
 *
 * NOTE: Zoom changes ONLY PdfViewport renderScale (no CSS transforms).
 */
export function TakeoffViewportPdf({ 
  isDarkMode, 
  plan, 
  pageIndex = 0, 
  renderScale = 1.5,
  tool,
  measurements,
  scale,
  labelsVisible = true,
  onAddMeasurement,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onSetScale,
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Scale modal state
  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [scalePixelDistance, setScalePixelDistance] = useState<number | null>(null);

  const isPdf = !!plan && (plan.mime === "application/pdf" || plan.name?.toLowerCase().endsWith(".pdf"));
  const { doc, pages, loading, error } = usePdfDocument(isPdf ? plan : null);

  const theme = useMemo(
    () => ({
      pill: isDarkMode
        ? "bg-slate-900/70 border-slate-700 text-slate-100"
        : "bg-white/85 border-slate-200 text-slate-800",
      muted: isDarkMode ? "text-slate-300" : "text-slate-600",
      toolbar: isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200",
      toolbarText: isDarkMode ? "text-slate-100" : "text-slate-900",
      toolbarMuted: isDarkMode ? "text-slate-300" : "text-slate-600",
      btn: isDarkMode
        ? "bg-slate-900/70 border-slate-700 text-slate-100 hover:bg-slate-800/70"
        : "bg-white/85 border-slate-200 text-slate-800 hover:bg-white",
    }),
    [isDarkMode]
  );

  const safeIndex = pages > 0 ? Math.max(0, Math.min(pageIndex, pages - 1)) : pageIndex;

  // Local zoom state (starts from prop, stays in sync if prop changes)
  const [zoomScale, setZoomScale] = useState(renderScale);
  useEffect(() => setZoomScale(renderScale), [renderScale]);

  const minScale = 0.5;
  const maxScale = 6;
  const step = 1.12;

  const zoomIn = () => setZoomScale((s) => clamp(s * step, minScale, maxScale));
  const zoomOut = () => setZoomScale((s) => clamp(s / step, minScale, maxScale));
  const zoomReset = () => setZoomScale(1);

  const zoomPct = useMemo(() => Math.round(zoomScale * 100), [zoomScale]);

  // Canvas area ref (this is the element that currently scroll-pans on wheel)
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Hotkeys: F toggle fullscreen, Esc exit, +/- zoom, 0 reset
  useEffect(() => {
    const isTypingTarget = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      return tag === "input" || tag === "textarea" || (el as any)?.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFullscreen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setIsFullscreen(false);
        return;
      }
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        zoomIn();
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        zoomReset();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouse wheel zoom over canvas area:
  // - Prevents default so wheel doesn't just scroll-pan.
  // - Hold Shift to allow normal scroll-pan if you ever want it.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.shiftKey) return; // allow scroll-pan with Shift+wheel
      e.preventDefault();

      // wheel up (deltaY < 0) -> zoom in
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []); // attach once

  if (!plan) return null;

  const shellClass = isFullscreen ? "fixed inset-0 z-[80] bg-neutral-950" : "absolute inset-0";

  const toolbarH = 56;

  return (
    <div className={shellClass}>
      {/* Toolbar placeholder */}
      <div
        className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 border-b ${theme.toolbar}`}
        style={{ height: toolbarH }}
      >
        <div className="flex items-center gap-3">
          <div className={`text-xs font-semibold ${theme.toolbarText}`}>Takeoff Tools</div>
          <div className={`hidden sm:block text-[11px] ${theme.toolbarMuted}`}>
            (reserved: Select • Line • Polyline • Count • Snap • Undo/Redo)
          </div>
          <div className={`hidden md:block text-[11px] ${theme.toolbarMuted}`}>
            Hotkeys: <span className="font-semibold">F</span> fullscreen • <span className="font-semibold">Esc</span> exit •{" "}
            <span className="font-semibold">+</span>/<span className="font-semibold">-</span> zoom • <span className="font-semibold">0</span> reset
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={zoomOut}
            className={`inline-flex items-center justify-center h-9 w-9 rounded-md border ${theme.btn}`}
            title="Zoom out (-)"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            onClick={zoomReset}
            className={`h-9 px-3 rounded-md border text-xs tabular-nums ${theme.btn}`}
            title="Reset zoom (0)"
          >
            {zoomPct}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className={`inline-flex items-center justify-center h-9 w-9 rounded-md border ${theme.btn}`}
            title="Zoom in (+)"
          >
            <Plus size={16} />
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${theme.btn}`}
            title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen (F)"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Info pill (kept, but pushed below toolbar) */}
      <div className={`absolute left-4 z-10 px-3 py-2 rounded-lg border ${theme.pill}`} style={{ top: toolbarH + 12 }}>
        <div className="text-xs font-bold">PDF</div>
        <div className={`text-[11px] ${theme.muted}`}>
          {loading ? "Loading…" : error ? "Error loading PDF" : `Page ${safeIndex + 1} / ${pages || "?"}`}
        </div>
        <div className={`text-[11px] ${theme.muted}`}>Mouse wheel to zoom (Shift+wheel to scroll)</div>
        {error && <div className="text-[11px] text-red-400 mt-1 max-w-[360px] break-words">{error}</div>}
      </div>

      {/* Canvas area */}
      <div className="absolute inset-0" style={{ paddingTop: toolbarH }}>
        <div ref={viewportRef} className="absolute inset-0 overflow-auto overscroll-contain">
          {isPdf && doc && !error ? (
            <div className="p-6 inline-block align-top">
              <PdfViewportInteractive 
                doc={doc} 
                pageIndex={safeIndex} 
                renderScale={zoomScale} 
                isDarkMode={isDarkMode}
                tool={tool}
                measurements={measurements}
                scale={scale}
                labelsVisible={labelsVisible}
                onAddMeasurement={onAddMeasurement}
                onUpdateMeasurement={onUpdateMeasurement}
                onDeleteMeasurement={onDeleteMeasurement}
                onScaleCalibration={(pixelDistance) => {
                  setScalePixelDistance(pixelDistance);
                  setScaleModalOpen(true);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Scale modal */}
      <ScaleModal
        isOpen={scaleModalOpen}
        isDarkMode={isDarkMode}
        pixelDistance={scalePixelDistance}
        onClose={() => {
          setScaleModalOpen(false);
          setScalePixelDistance(null);
        }}
        onApply={(newScale) => {
          onSetScale(newScale);
          setScaleModalOpen(false);
          setScalePixelDistance(null);
        }}
      />
    </div>
  );
}
