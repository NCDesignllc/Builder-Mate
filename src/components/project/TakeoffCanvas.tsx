import React, { useMemo, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import type { PlanSource } from "../takeoff/types";
import { uuid } from "../takeoff/geometry";
import { useTakeoffPersist } from "../takeoff/useTakeoffPersist";
import { useUndoRedo } from "../takeoff/useUndoRedo";
import { TakeoffToolbar } from "../takeoff/TakeoffToolbar";
import { TakeoffItemsPanel } from "../takeoff/TakeoffItemsPanel";
import { TakeoffViewportPdf } from "../takeoff/TakeoffViewport.pdf";
import { usePdfDocument } from "../takeoff/usePdfDocument";
import { PdfThumbnailsRail } from "../takeoff/PdfThumbnailsRail";

type Props = {
  isDarkMode: boolean;
  projectId?: string;
};

export function TakeoffCanvas({ isDarkMode, projectId }: Props) {
  const [plan, setPlan] = useState<PlanSource | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [tool, setTool] = useState<"select" | "pan" | "scale" | "linear" | "area" | "count" | "label">("select");
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Persist is per-project + plan + page (per-page scale lock supported)
  const { 
    scale, 
    setScale, 
    measurements, 
    setMeasurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    clear, 
    storageKey 
  } = useTakeoffPersist(projectId, plan?.id, pageIndex);

  // Undo/Redo
  const { undo, redo, canUndo, canRedo } = useUndoRedo(measurements, setMeasurements);

  const isPdf =
    !!plan && (plan.mime === "application/pdf" || plan.name?.toLowerCase().endsWith(".pdf"));

  // Load doc only for PDF plans (needed for page count + thumbnails)
  const { doc, pages, loading: pdfLoading, error: pdfError } = usePdfDocument(isPdf ? plan : null);

  const theme = useMemo(
    () => ({
      canvas: isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-200",
      muted: isDarkMode ? "text-slate-400" : "text-slate-500",
      pill: isDarkMode
        ? "bg-slate-900/70 border-slate-700 text-slate-100"
        : "bg-white/85 border-slate-200 text-slate-800",
    }),
    [isDarkMode]
  );

  function onUpload(file: File) {
    const url = URL.createObjectURL(file);
    setPlan({
      id: uuid("plan"),
      name: file.name,
      mime: file.type || "application/octet-stream",
      url,
      file, // keep file for multipage PDFs
    });
    setPageIndex(0);
    setTool("select");
  }

  function clearPlanOnly() {
    if (plan?.url) URL.revokeObjectURL(plan.url);
    setPlan(null);
    setPageIndex(0);
    setTool("select");
  }

  function clearAll() {
    clearPlanOnly();
    clear();
  }

  // Clamp pageIndex when doc/pages changes
  const safePageIndex = pages > 0 ? Math.max(0, Math.min(pageIndex, pages - 1)) : pageIndex;

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') { setTool('select'); return; }
      if (e.key === 'h' || e.key === 'H') { setTool('pan'); return; }
      if (e.key === 's' || e.key === 'S') { setTool('scale'); return; }
      if (e.key === 'l' || e.key === 'L') { setTool('linear'); return; }
      if (e.key === 'a' || e.key === 'A') { setTool('area'); return; }
      if (e.key === 'c' || e.key === 'C') { setTool('count'); return; }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-[600px] flex gap-4">
      {/* Toolbar */}
      <TakeoffToolbar 
        isDarkMode={isDarkMode} 
        disabled={!plan} 
        tool={tool} 
        onChange={setTool}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Optional: thumbnails rail for PDF */}
      {doc && pages > 1 ? (
        <PdfThumbnailsRail
          doc={doc}
          pages={pages}
          pageIndex={safePageIndex}
          onSelect={(i) => setPageIndex(i)}
          isDarkMode={isDarkMode}
        />
      ) : null}

      {/* Canvas */}
      <div className={`flex-1 rounded-lg border relative overflow-hidden ${theme.canvas}`}>
        <input
          type="file"
          ref={fileRef}
          className="hidden"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
          }}
        />

        {!plan ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center mx-auto mb-4">
                <UploadCloud size={32} className="opacity-50" />
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="bg-orange-600 text-white px-6 py-2 rounded font-bold"
              >
                Upload Blueprint
              </button>
              <div className={`text-xs mt-2 ${theme.muted}`}>PDF + images supported.</div>
            </div>
          </div>
        ) : (
          <>
            <div className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-2 py-1.5 rounded-lg border ${theme.pill}`}>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs font-bold px-2 py-1 rounded hover:bg-orange-50 hover:text-orange-700"
              >
                Replace
              </button>
              <button
                onClick={clearPlanOnly}
                className="text-xs font-bold px-2 py-1 rounded hover:bg-slate-50 flex items-center gap-2"
              >
                <X size={14} /> Clear Plan
              </button>
            </div>

            <TakeoffViewportPdf 
              isDarkMode={isDarkMode} 
              plan={plan} 
              pageIndex={safePageIndex} 
              renderScale={1.5}
              tool={tool}
              scale={scale}
              measurements={measurements}
              onAddMeasurement={addMeasurement}
              onUpdateMeasurement={updateMeasurement}
              onSetScale={setScale}
            />

            {isPdf && (pdfLoading || pdfError) ? (
              <div className={`absolute bottom-4 left-4 z-10 px-3 py-2 rounded-lg border ${theme.pill}`}>
                <div className="text-xs font-bold">PDF Status</div>
                <div className={`text-[11px] ${theme.muted}`}>
                  {pdfLoading ? "Loading…" : pdfError ? `Error: ${pdfError}` : ""}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      <TakeoffItemsPanel
        isDarkMode={isDarkMode}
        plan={plan}
        pages={pages || 0}
        pageIndex={safePageIndex}
        onChangePage={(i) => setPageIndex(Number(i))}
        scale={scale}
        measurements={measurements}
        onDeleteMeasurement={deleteMeasurement}
        onClearAll={clearAll}
        persistKey={storageKey}
        onUpdateMeasurement={updateMeasurement}
      />
    </div>
  );
}
