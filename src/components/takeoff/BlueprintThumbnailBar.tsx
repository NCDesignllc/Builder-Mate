import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BlueprintThumbnailItem } from './BlueprintThumbnailItem';
import { HiddenPagesToggle } from './HiddenPagesToggle';
import { Modal } from '../ui/Modal';
import type { PageVisibilityMap } from './types';

// Scroll distance in pixels when clicking navigation buttons
const SCROLL_DISTANCE = 200;

type Props = {
  doc: any;
  totalPages: number;
  activePageIndex: number;
  onPageSelect: (pageIndex: number) => void;
  pageVisibility: PageVisibilityMap;
  hiddenPageIndices: number[];
  showHiddenPages: boolean;
  onToggleShowHidden: () => void;
  onHidePage: (pageIndex: number) => void;
  onShowPage: (pageIndex: number) => void;
  onRemovePage: (pageIndex: number) => void;
  getPageLabel: (pageIndex: number) => string;
  removedPages: Set<number>;
  isDarkMode: boolean;
};

export function BlueprintThumbnailBar({
  doc,
  totalPages,
  activePageIndex,
  onPageSelect,
  pageVisibility,
  hiddenPageIndices,
  showHiddenPages,
  onToggleShowHidden,
  onHidePage,
  onShowPage,
  onRemovePage,
  getPageLabel,
  removedPages,
  isDarkMode,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<number | null>(null);

  // Compute visible pages (not removed, and either not hidden or showHiddenPages)
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

  const handleHideToggle = (pageIndex: number) => {
    const isHidden = pageVisibility[pageIndex]?.isHidden ?? false;
    if (isHidden) {
      onShowPage(pageIndex);
    } else {
      onHidePage(pageIndex);
    }
  };

  const handleRemoveClick = (pageIndex: number) => {
    setRemoveConfirm(pageIndex);
  };

  const confirmRemove = () => {
    if (removeConfirm !== null) {
      onRemovePage(removeConfirm);
      setRemoveConfirm(null);
    }
  };

  const theme = {
    bar: isDarkMode
      ? 'bg-slate-900 border-slate-700'
      : 'bg-white border-slate-200',
    scrollBtn: isDarkMode
      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-30'
      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30',
  };

  if (!doc || totalPages <= 1) return null;

  return (
    <>
      <div
        className={`sticky top-0 z-30 w-full border-b ${theme.bar}`}
        style={{ minHeight: 120 }}
      >
        <div className="flex items-center h-full px-2 py-2 gap-2">
          {/* Scroll left button */}
          <button
            type="button"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`flex-shrink-0 p-2 rounded-lg border transition-colors ${theme.scrollBtn}`}
            aria-label="Scroll thumbnails left"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Thumbnails container */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className="flex items-center gap-2 py-1 px-1">
              {visiblePages.map((pageIndex) => {
                const isHidden = pageVisibility[pageIndex]?.isHidden ?? false;
                return (
                  <div key={pageIndex} data-page-index={pageIndex}>
                    <BlueprintThumbnailItem
                      doc={doc}
                      pageIndex={pageIndex}
                      isActive={pageIndex === activePageIndex}
                      isHidden={isHidden}
                      showHiddenIndicator={showHiddenPages}
                      label={getPageLabel(pageIndex)}
                      onClick={() => onPageSelect(pageIndex)}
                      onHide={() => handleHideToggle(pageIndex)}
                      onRemove={() => handleRemoveClick(pageIndex)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll right button */}
          <button
            type="button"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`flex-shrink-0 p-2 rounded-lg border transition-colors ${theme.scrollBtn}`}
            aria-label="Scroll thumbnails right"
          >
            <ChevronRight size={18} />
          </button>

          {/* Hidden pages toggle */}
          <div className="flex-shrink-0 ml-2">
            <HiddenPagesToggle
              showHiddenPages={showHiddenPages}
              onToggle={onToggleShowHidden}
              hiddenCount={hiddenPageIndices.length}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Remove confirmation modal */}
      <Modal
        isOpen={removeConfirm !== null}
        onClose={() => setRemoveConfirm(null)}
        title="Remove Page"
        isDarkMode={isDarkMode}
      >
        <div className="space-y-4">
          <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
            Remove this page from the project?
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            This will remove the page and all its measurements from the project.
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setRemoveConfirm(null)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                isDarkMode
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRemove}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-red-600 text-white hover:bg-red-700"
            >
              Remove Page
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
