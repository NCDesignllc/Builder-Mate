import React, { useMemo } from 'react';
import type { Measurement, TakeoffScale } from './types';
import { computeTotals, formatNumber } from './measurementMath';
import { Download } from 'lucide-react';
import { exportMeasurements } from './export';

type Props = {
  isDarkMode: boolean;
  measurements: Measurement[];
  scale: TakeoffScale | null;
  pageIndex?: number;
  showExport?: boolean;
};

export function TakeoffSummary({
  isDarkMode,
  measurements,
  scale,
  pageIndex,
  showExport = true,
}: Props) {
  const theme = useMemo(
    () => ({
      panel: isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900',
      muted: isDarkMode ? 'text-slate-300' : 'text-slate-600',
      highlight: isDarkMode ? 'bg-slate-700' : 'bg-slate-100',
      btn: 'bg-orange-600 text-white hover:bg-orange-700',
    }),
    [isDarkMode]
  );

  // Filter by page if specified
  const filteredMeasurements = useMemo(() => {
    if (pageIndex === undefined) return measurements;
    return measurements.filter((m) => m.pageIndex === pageIndex);
  }, [measurements, pageIndex]);

  const totals = useMemo(
    () => computeTotals(filteredMeasurements, scale),
    [filteredMeasurements, scale]
  );

  const handleExport = () => {
    const filename = `takeoff-${pageIndex !== undefined ? `page-${pageIndex + 1}` : 'all'}-${Date.now()}.csv`;
    exportMeasurements(filteredMeasurements, scale, filename);
  };

  return (
    <div className={`rounded-lg border p-3 ${theme.panel}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-black text-xs uppercase tracking-wide">
          Summary {pageIndex !== undefined ? `(Page ${pageIndex + 1})` : '(All Pages)'}
        </h4>
        {showExport && filteredMeasurements.length > 0 && (
          <button
            onClick={handleExport}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${theme.btn}`}
            title="Export to CSV"
          >
            <Download size={12} />
            Export
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Total measurements */}
        <div className={`p-2 rounded ${theme.highlight}`}>
          <div className={`text-[10px] uppercase font-bold ${theme.muted}`}>Total Items</div>
          <div className="text-xl font-black">{filteredMeasurements.length}</div>
        </div>

        {/* Linear total */}
        {totals.totalLength !== null && (
          <div className={`p-2 rounded ${theme.highlight}`}>
            <div className={`text-[10px] uppercase font-bold ${theme.muted}`}>Linear Total</div>
            <div className="text-xl font-black">
              {formatNumber(totals.totalLength, 2)} {scale?.unit}
            </div>
          </div>
        )}

        {/* Area total */}
        {totals.totalArea !== null && (
          <div className={`p-2 rounded ${theme.highlight}`}>
            <div className={`text-[10px] uppercase font-bold ${theme.muted}`}>Area Total</div>
            <div className="text-xl font-black">
              {formatNumber(totals.totalArea, 2)} {scale?.unit}²
            </div>
          </div>
        )}

        {/* Count total */}
        {totals.totalCount > 0 && (
          <div className={`p-2 rounded ${theme.highlight}`}>
            <div className={`text-[10px] uppercase font-bold ${theme.muted}`}>Count Total</div>
            <div className="text-xl font-black">{totals.totalCount}</div>
          </div>
        )}

        {/* Breakdown by type */}
        {filteredMeasurements.length > 0 && (
          <div className="pt-2 border-t">
            <div className={`text-[10px] uppercase font-bold ${theme.muted} mb-2`}>Breakdown</div>
            <div className="space-y-1 text-xs">
              {['linear', 'area', 'count'].map((type) => {
                const count = filteredMeasurements.filter((m) => m.kind === type).length;
                if (count === 0) return null;
                return (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type}:</span>
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredMeasurements.length === 0 && (
          <div className={`text-xs ${theme.muted} text-center py-4`}>
            No measurements yet.
          </div>
        )}
      </div>
    </div>
  );
}
