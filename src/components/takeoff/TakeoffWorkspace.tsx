import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { PlanSource, TakeoffTool, Measurement, TakeoffScale } from './types';
import { TakeoffToolbar } from './TakeoffToolbar';
import { TakeoffViewportPdf } from './TakeoffViewport.pdf';
import { TakeoffItemsPanel } from './TakeoffItemsPanel';
import { LayersPanel } from './LayersPanel';
import { TakeoffSummary } from './TakeoffSummary';
import { TakeoffHelp } from './TakeoffHelp';
import { PdfThumbnailsRail } from './PdfThumbnailsRail';
import { usePdfDocument } from './usePdfDocument';
import { useTakeoffPersist } from './useTakeoffPersist';
import { useUndoRedo } from './useUndoRedo';
import { useLayers } from './useLayers';

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

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      // Help
      if (e.key === '?') {
        setShowHelp((v) => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const safePageIndex = pages > 0 ? Math.max(0, Math.min(pageIndex, pages - 1)) : pageIndex;

  const theme = isDarkMode
    ? 'bg-slate-900 border-slate-700'
    : 'bg-slate-100 border-slate-200';

  return (
    <div className="h-full flex gap-3 p-3">
      {/* Left sidebar - Toolbar + optional thumbnails */}
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

        {doc && pages > 1 && (
          <div className="flex-1 overflow-auto">
            <PdfThumbnailsRail
              doc={doc}
              pages={pages}
              pageIndex={safePageIndex}
              onSelect={onPageChange}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
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
              measurements={measurements}
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
            measurements={measurements}
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
            onChangePage={onPageChange}
            scale={scale}
            measurements={measurements}
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

      {/* Help overlay */}
      {showHelp && <TakeoffHelp isDarkMode={isDarkMode} onClose={() => setShowHelp(false)} />}
    </div>
  );
}
