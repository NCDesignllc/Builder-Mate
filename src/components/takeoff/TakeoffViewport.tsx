import React, { useEffect, useMemo, useState } from "react";
import { usePdfDocument } from "./usePdfDocument";
import { PdfViewport } from "./PdfViewport";

/**
 * TakeoffViewport
 * - Fullscreen toggle: F
 * - Exit fullscreen: Esc
 * - Keeps a top toolbar area (placeholder for later drawing/count tools)
 */
export function TakeoffViewport({ plan, pageIndex = 0, scale = 1 }: any) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isPdf =
    plan?.mime === "application/pdf" ||
    plan?.type === "application/pdf" ||
    plan?.name?.toLowerCase?.().endsWith?.(".pdf");

  const { doc } = usePdfDocument(isPdf ? plan?.url : undefined);

  // Hotkeys: F toggles fullscreen, Esc exits
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
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const shellClass = useMemo(
    () =>
      isFullscreen
        ? "fixed inset-0 z-50 bg-neutral-950"
        : "w-full h-full bg-neutral-950",
    [isFullscreen]
  );

  // Toolbar height (keep consistent so the canvas never gets covered)
  const toolbarH = 52;

  return (
    <div className={shellClass}>
      {/* Toolbar (placeholder: keep this for future line/count tools) */}
      <div
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3"
        style={{ height: toolbarH }}
      >
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-neutral-100/90">
            Takeoff Tools
          </div>
          <div className="hidden sm:block text-[11px] text-neutral-300/80">
            (Toolbar reserved for linework, counts, snaps, etc.)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-[11px] text-neutral-300/80">
            Press <span className="font-semibold text-neutral-100">F</span> fullscreen •{" "}
            <span className="font-semibold text-neutral-100">Esc</span> exit
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="rounded-md border border-neutral-700 bg-neutral-900/70 px-3 py-1.5 text-xs text-neutral-100 hover:bg-neutral-800/80"
            title="Toggle fullscreen (F)"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0" style={{ paddingTop: toolbarH }}>
        <div className="absolute inset-0 flex items-center justify-center overflow-auto">
          {isPdf && doc ? (
            <div className="p-4">
              {/* NOTE: PdfViewport signature varies across versions.
                  Your current baseline uses {scale}. Keep it unchanged here. */}
              <PdfViewport doc={doc} pageIndex={pageIndex} scale={scale} />
            </div>
          ) : plan?.url ? (
            <div className="p-4">
              <img
                src={plan.url}
                alt={plan?.name || "plan"}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="text-sm text-neutral-400">No plan selected.</div>
          )}
        </div>
      </div>
    </div>
  );
}
