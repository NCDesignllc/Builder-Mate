import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PageVisibilityMap } from './types';

// Smaller thumbnail scale for inline toolbar placement (~50% of original 0.12)
const INLINE_THUMBNAIL_SCALE = 0.06;
const SCROLL_DISTANCE = 100;

type Props = {
  doc: any;
  totalPages: number;
  activePageIndex: number;
  onPageSelect: (pageIndex: number) => void;
  pageVisibility: PageVisibilityMap;
  showHiddenPages: boolean;
  removedPages: Set<number>;
  isDarkMode: boolean;
};

function InlineThumbnail({
  doc,
  pageIndex,
  isActive,
  isHidden,
  onClick,
  isDarkMode,
}: {
  doc: any;
  pageIndex: number;
  isActive: boolean;
  isHidden: boolean;
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
        const page = await doc.getPage(pageIndex + 1);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: INLINE_THUMBNAIL_SCALE });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.ceil(viewport.width * dpr);
        canvas.height = Math.ceil(viewport.height * dpr);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;

        const ctx = canvas.getContext('2d', { alpha: false })!;
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
  }, [doc, pageIndex]);

  const baseStyle = isDarkMode
    ? 'border-slate-600 bg-slate-700'
    : 'border-slate-300 bg-white';

  const activeStyle = isActive
    ? 'ring-1 ring-orange-500 border-orange-500'
    : 'hover:border-slate-400';

  const hiddenStyle = isHidden ? 'opacity-40' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 p-0.5 rounded border transition-all ${baseStyle} ${activeStyle} ${hiddenStyle}`}
      title={`Page ${pageIndex + 1}`}
      aria-label={`Select page ${pageIndex + 1}`}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="block bg-white rounded-sm"
          style={{ minWidth: 28, minHeight: 36 }}
        />
        {!done && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 rounded-sm">
            <div className="w-2 h-2 border border-slate-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </button>
  );
}

export function InlineThumbnailStrip({
  doc,
  totalPages,
  activePageIndex,
  onPageSelect,
  pageVisibility,
  showHiddenPages,
  removedPages,
  isDarkMode,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Compute visible pages
  const visiblePages: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (removedPages.has(i)) continue;
    const isHidden = pageVisibility[i]?.isHidden ?? false;
    if (isHidden && !showHiddenPages) continue;
    visiblePages.push(i);
  }

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, visiblePages.length]);

  const scrollLeft = () => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: -SCROLL_DISTANCE, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: SCROLL_DISTANCE, behavior: 'smooth' });
  };

  // Scroll active page into view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector(`[data-page-index="${activePageIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activePageIndex]);

  const scrollBtnStyle = isDarkMode
    ? 'text-slate-400 hover:text-slate-200 disabled:opacity-30'
    : 'text-slate-500 hover:text-slate-700 disabled:opacity-30';

  if (!doc || totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-1 ml-4">
      {/* Scroll left */}
      <button
        type="button"
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        className={`flex-shrink-0 p-0.5 rounded transition-colors ${scrollBtnStyle}`}
        aria-label="Scroll thumbnails left"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Thumbnails container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-none"
        style={{ maxWidth: 300, scrollbarWidth: 'none' }}
      >
        <div className="flex items-center gap-1">
          {visiblePages.map((pageIndex) => {
            const isHidden = pageVisibility[pageIndex]?.isHidden ?? false;
            return (
              <div key={pageIndex} data-page-index={pageIndex}>
                <InlineThumbnail
                  doc={doc}
                  pageIndex={pageIndex}
                  isActive={pageIndex === activePageIndex}
                  isHidden={isHidden}
                  onClick={() => onPageSelect(pageIndex)}
                  isDarkMode={isDarkMode}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll right */}
      <button
        type="button"
        onClick={scrollRight}
        disabled={!canScrollRight}
        className={`flex-shrink-0 p-0.5 rounded transition-colors ${scrollBtnStyle}`}
        aria-label="Scroll thumbnails right"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
