import React, { useState, useMemo } from 'react';
import { HelpCircle } from 'lucide-react';
import type { PlanSource, TakeoffTool, Measurement, TakeoffScale } from './types';
import { TakeoffToolbar } from './TakeoffToolbar';
import { TakeoffViewportPdf } from './TakeoffViewport.pdf';
import { TakeoffItemsPanel } from './TakeoffItemsPanel';
import { LayersPanel } from './LayersPanel';
import { TakeoffSummary } from './TakeoffSummary';
import { TakeoffHelp } from './TakeoffHelp';
import { BlueprintThumbnailBar } from './BlueprintThumbnailBar';
import { usePdfDocument } from './usePdfDocument';
import { useTakeoffPersist } from './useTakeoffPersist';
import { useUndoRedo } from './useUndoRedo';
import { useLayers } from './useLayers';
import { usePageVisibility } from './usePageVisibility';

type Props = {
  isDarkMode: boolean;
  plan: PlanSource | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
  projectId?: string;
};

/**
 * TakeoffWorkspace - Complete takeoff UI with all panels
 */
export function TakeoffWorkspace({
  isDarkMode,
  plan,
  pageIndex,
  onPageChange,
  projectId,
}: Props) {
  const [tool, setTool] = useState<TakeoffTool>('select');
  const [showHelp, setShowHelp] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  const isPdf = !!plan && (plan.mime === 'application/pdf' || plan.name?.toLowerCase().endsWith('.pdf'));
  const { doc, pages } = usePdfDocument(isPdf ? plan : null);

  // Persist measurements
  const {
    scale,
    setScale,
    measurements,
    setMeasurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
  } = useTakeoffPersist(projectId, plan?.id, pageIndex);

  // Undo/Redo
  const { undo, redo, canUndo, canRedo } = useUndoRedo(measurements, setMeasurements);

  // Layers
  const {
    layers,
    activeLayerId,
    setActiveLayerId,
    toggleVisibility,
    toggleLock,
    addLayer,
    deleteLayer,
  } = useLayers();

  // Page visibility management
  const {
    pageVisibility,
    hiddenPageIndices,
    visiblePageIndices,
    showHiddenPages,
    setShowHiddenPages,
    isPageHidden,
    hidePageByIndex,
    showPageByIndex,
    removePageByIndex,
    getPageLabel,
    getNextVisiblePage,
    getPrevVisiblePage,
    removedPages,
  } = usePageVisibility({
    projectId,
    planId: plan?.id,
    totalPages: pages || 0,
  });

  const safePageIndex = pages > 0 ? Math.max(0, Math.min(pageIndex, pages - 1)) : pageIndex;

  // Handle page selection - skip hidden pages if not showing them
  const handlePageSelect = (index: number) => {
    if (!isPageHidden(index) || showHiddenPages) {
      onPageChange(index);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') { setTool('select'); return; }
      if (e.key === 's' || e.key === 'S') { setTool('scale'); return; }
      if (e.key === 'l' || e.key === 'L') { setTool('linear'); return; }
      if (e.key === 'a' || e.key === 'A') { setTool('area'); return; }
      if (e.key === 'c' || e.key === 'C') { setTool('count'); return; }
      if (e.key === 'h' || e.key === 'H') { setTool('pan'); return; }

      // Page navigation with arrow keys
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevPage = getPrevVisiblePage(safePageIndex);
        if (prevPage !== safePageIndex) onPageChange(prevPage);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextPage = getNextVisiblePage(safePageIndex);
        if (nextPage !== safePageIndex) onPageChange(nextPage);
        return;
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      // Help
      if (e.key === '?') {
        setShowHelp((v) => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, safePageIndex, getPrevVisiblePage, getNextVisiblePage, onPageChange]);

  // Filter measurements for current page visibility
  const visibleMeasurements = useMemo(() => {
    return measurements.filter((m) => {
      if (m.pageIndex === safePageIndex) return true;
      if (removedPages.has(m.pageIndex)) return false;
      return true;
    });
  }, [measurements, safePageIndex, removedPages]);

  const theme = isDarkMode
    ? 'bg-slate-900 border-slate-700'
    : 'bg-slate-100 border-slate-200';

  return (
    <div className="h-full flex flex-col p-3">
      {/* Horizontal thumbnail bar at top */}
      {doc && pages > 1 && (
        <BlueprintThumbnailBar
          doc={doc}
          totalPages={pages}
          activePageIndex={safePageIndex}
          onPageSelect={handlePageSelect}
          pageVisibility={pageVisibility}
          hiddenPageIndices={hiddenPageIndices}
          showHiddenPages={showHiddenPages}
          onToggleShowHidden={() => setShowHiddenPages(!showHiddenPages)}
          onHidePage={hidePageByIndex}
          onShowPage={showPageByIndex}
          onRemovePage={removePageByIndex}
          getPageLabel={getPageLabel}
          removedPages={removedPages}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex gap-3 min-h-0 mt-3">
        {/* Left sidebar - Toolbar */}
        <div className="flex flex-col gap-3">
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
        </div>

        {/* Center - Main viewport */}
        <div className={`flex-1 rounded-lg border overflow-hidden ${theme} relative`}>
          {plan ? (
            <>
              {/* Help button */}
              <button
                onClick={() => setShowHelp(true)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 shadow-lg"
                title="Help & Shortcuts (?)"
              >
                <HelpCircle size={20} />
              </button>

              <TakeoffViewportPdf
                isDarkMode={isDarkMode}
                plan={plan}
                pageIndex={safePageIndex}
                renderScale={1.5}
                tool={tool}
                scale={scale}
                measurements={visibleMeasurements}
                onAddMeasurement={addMeasurement}
                onUpdateMeasurement={updateMeasurement}
                onSetScale={setScale}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              No plan loaded
            </div>
          )}
        </div>

        {/* Right sidebar - Panels */}
        <div className="w-80 flex flex-col gap-3 overflow-auto">
          {/* Layers toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowLayers((v) => !v)}
              className={`flex-1 px-3 py-2 rounded text-xs font-bold ${
                showLayers ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              Layers
            </button>
            <button
              onClick={() => setShowSummary((v) => !v)}
              className={`flex-1 px-3 py-2 rounded text-xs font-bold ${
                showSummary ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              Summary
            </button>
          </div>

          {/* Layers panel */}
          {showLayers && (
            <LayersPanel
              isDarkMode={isDarkMode}
              layers={layers}
              activeLayerId={activeLayerId}
              onSelectLayer={setActiveLayerId}
              onToggleVisibility={toggleVisibility}
              onToggleLock={toggleLock}
              onDeleteLayer={deleteLayer}
              onAddLayer={() => {
                const name = prompt('Enter layer name:');
                if (name) addLayer(name, 'custom');
              }}
            />
          )}

          {/* Summary panel */}
          {showSummary && (
            <TakeoffSummary
              isDarkMode={isDarkMode}
              measurements={visibleMeasurements}
              scale={scale}
              pageIndex={safePageIndex}
            />
          )}

          {/* Items panel */}
          <div className="flex-1 overflow-auto">
            <TakeoffItemsPanel
              isDarkMode={isDarkMode}
              plan={plan}
              pages={pages}
              pageIndex={safePageIndex}
              onChangePage={handlePageSelect}
              scale={scale}
              measurements={visibleMeasurements}
              onDeleteMeasurement={deleteMeasurement}
              onUpdateMeasurement={updateMeasurement}
              onClearAll={() => {
                if (confirm('Clear all measurements? This cannot be undone.')) {
                  setMeasurements([]);
                }
              }}
              persistKey={`${projectId || 'demo'}-${plan?.id || 'none'}`}
            />
          </div>
        </div>
      </div>

      {/* Help overlay */}
      {showHelp && <TakeoffHelp isDarkMode={isDarkMode} onClose={() => setShowHelp(false)} />}
    </div>
  );
}
