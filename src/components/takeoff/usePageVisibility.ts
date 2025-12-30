import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PageVisibility, PageVisibilityMap, Measurement } from './types';

type UsePageVisibilityOptions = {
  projectId?: string;
  planId?: string;
  totalPages: number;
};

type UsePageVisibilityReturn = {
  pageVisibility: PageVisibilityMap;
  hiddenPageIndices: number[];
  visiblePageIndices: number[];
  showHiddenPages: boolean;
  setShowHiddenPages: (v: boolean) => void;
  isPageHidden: (pageIndex: number) => boolean;
  hidePageByIndex: (pageIndex: number) => void;
  showPageByIndex: (pageIndex: number) => void;
  togglePageVisibility: (pageIndex: number) => void;
  removePageByIndex: (pageIndex: number) => void;
  setPageLabel: (pageIndex: number, label: string) => void;
  getPageLabel: (pageIndex: number) => string;
  getNextVisiblePage: (currentIndex: number) => number;
  getPrevVisiblePage: (currentIndex: number) => number;
  filterMeasurementsByVisibility: (measurements: Measurement[], activePageIndex: number) => Measurement[];
  removedPages: Set<number>;
};

function storageKey(projectId?: string, planId?: string): string {
  if (projectId && planId) return `buildermate.pagevis.${projectId}.${planId}`;
  if (projectId) return `buildermate.pagevis.${projectId}`;
  return `buildermate.pagevis.demo`;
}

function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function usePageVisibility({
  projectId,
  planId,
  totalPages,
}: UsePageVisibilityOptions): UsePageVisibilityReturn {
  const key = useMemo(() => storageKey(projectId, planId), [projectId, planId]);

  const [pageVisibility, setPageVisibility] = useState<PageVisibilityMap>({});
  const [showHiddenPages, setShowHiddenPages] = useState(false);
  const [removedPages, setRemovedPages] = useState<Set<number>>(new Set());

  // Load from localStorage
  useEffect(() => {
    const saved = safeJsonParse<{
      pageVisibility: PageVisibilityMap;
      removedPages?: number[];
    }>(localStorage.getItem(key));

    if (saved) {
      setPageVisibility(saved.pageVisibility || {});
      setRemovedPages(new Set(saved.removedPages || []));
    }
  }, [key]);

  // Save to localStorage
  useEffect(() => {
    const payload = {
      pageVisibility,
      removedPages: Array.from(removedPages),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  }, [key, pageVisibility, removedPages]);

  const hiddenPageIndices = useMemo(() => {
    const hidden: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      if (removedPages.has(i)) continue;
      if (pageVisibility[i]?.isHidden) {
        hidden.push(i);
      }
    }
    return hidden;
  }, [pageVisibility, totalPages, removedPages]);

  const visiblePageIndices = useMemo(() => {
    const visible: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      if (removedPages.has(i)) continue;
      if (!pageVisibility[i]?.isHidden) {
        visible.push(i);
      }
    }
    return visible;
  }, [pageVisibility, totalPages, removedPages]);

  const isPageHidden = useCallback(
    (pageIndex: number) => {
      if (removedPages.has(pageIndex)) return true;
      return !!pageVisibility[pageIndex]?.isHidden;
    },
    [pageVisibility, removedPages]
  );

  const hidePageByIndex = useCallback((pageIndex: number) => {
    setPageVisibility((prev) => ({
      ...prev,
      [pageIndex]: {
        ...prev[pageIndex],
        pageIndex,
        isHidden: true,
      },
    }));
  }, []);

  const showPageByIndex = useCallback((pageIndex: number) => {
    setPageVisibility((prev) => ({
      ...prev,
      [pageIndex]: {
        ...prev[pageIndex],
        pageIndex,
        isHidden: false,
      },
    }));
  }, []);

  const togglePageVisibility = useCallback(
    (pageIndex: number) => {
      if (isPageHidden(pageIndex)) {
        showPageByIndex(pageIndex);
      } else {
        hidePageByIndex(pageIndex);
      }
    },
    [isPageHidden, hidePageByIndex, showPageByIndex]
  );

  const removePageByIndex = useCallback((pageIndex: number) => {
    setRemovedPages((prev) => {
      const next = new Set(prev);
      next.add(pageIndex);
      return next;
    });
    // Also remove from visibility map
    setPageVisibility((prev) => {
      const copy = { ...prev };
      delete copy[pageIndex];
      return copy;
    });
  }, []);

  const setPageLabel = useCallback((pageIndex: number, label: string) => {
    setPageVisibility((prev) => ({
      ...prev,
      [pageIndex]: {
        ...prev[pageIndex],
        pageIndex,
        isHidden: prev[pageIndex]?.isHidden ?? false,
        label,
      },
    }));
  }, []);

  const getPageLabel = useCallback(
    (pageIndex: number): string => {
      return pageVisibility[pageIndex]?.label || `Page ${pageIndex + 1}`;
    },
    [pageVisibility]
  );

  const getNextVisiblePage = useCallback(
    (currentIndex: number): number => {
      if (visiblePageIndices.length === 0) return currentIndex;
      const nextPages = visiblePageIndices.filter((i) => i > currentIndex);
      if (nextPages.length > 0) return nextPages[0];
      // Wrap around
      return visiblePageIndices[0];
    },
    [visiblePageIndices]
  );

  const getPrevVisiblePage = useCallback(
    (currentIndex: number): number => {
      if (visiblePageIndices.length === 0) return currentIndex;
      const prevPages = visiblePageIndices.filter((i) => i < currentIndex);
      if (prevPages.length > 0) return prevPages[prevPages.length - 1];
      // Wrap around
      return visiblePageIndices[visiblePageIndices.length - 1];
    },
    [visiblePageIndices]
  );

  const filterMeasurementsByVisibility = useCallback(
    (measurements: Measurement[], activePageIndex: number): Measurement[] => {
      return measurements.filter((m) => {
        // Always show measurements on the active page
        if (m.pageIndex === activePageIndex) return true;
        // Filter out measurements on hidden/removed pages
        if (removedPages.has(m.pageIndex)) return false;
        if (pageVisibility[m.pageIndex]?.isHidden && !showHiddenPages) return false;
        return true;
      });
    },
    [pageVisibility, removedPages, showHiddenPages]
  );

  return {
    pageVisibility,
    hiddenPageIndices,
    visiblePageIndices,
    showHiddenPages,
    setShowHiddenPages,
    isPageHidden,
    hidePageByIndex,
    showPageByIndex,
    togglePageVisibility,
    removePageByIndex,
    setPageLabel,
    getPageLabel,
    getNextVisiblePage,
    getPrevVisiblePage,
    filterMeasurementsByVisibility,
    removedPages,
  };
}
