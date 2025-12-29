import React, { useMemo } from "react";
import type { PlanSource, Measurement, TakeoffScale } from "./types";
import { PageNav } from "./PageNav";
import { Trash2 } from "lucide-react";
import { computeMeasurement, formatNumber } from "./measurementMath";

type Props = {
  isDarkMode: boolean;
  plan: PlanSource | null;
  pages?: number;
  pageIndex: number;
  onChangePage: (i: number) => void;

  scale: TakeoffScale | null;
  measurements: Measurement[];
  onDeleteMeasurement: (id: string) => void;
  onUpdateMeasurement?: (id: string, patch: Partial<Measurement>) => void;

  onClearAll: () => void;
  persistKey: string;
};

export function TakeoffItemsPanel({
  isDarkMode,
  plan,
  pages = 0,
  pageIndex,
  onChangePage,
  scale,
  measurements,
  onDeleteMeasurement,
  onUpdateMeasurement,
  onClearAll,
  persistKey,
}: Props) {
  const shell = useMemo(
    () =>
      isDarkMode
        ? "bg-slate-800 border-slate-700 text-slate-100"
        : "bg-white border-slate-200 text-slate-900",
    [isDarkMode]
  );

  const muted = isDarkMode ? "text-slate-300" : "text-slate-600";

  const visibleMeasurements = useMemo(() => {
    return (measurements || []).filter((m) => {
      const p = typeof m?.pageIndex === "number" ? m.pageIndex : 0;
      return p === pageIndex;
    });
  }, [measurements, pageIndex]);

  return (
    <div className={`w-72 rounded-lg border p-4 ${shell}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-black text-xs uppercase">Takeoff Items</h4>
          <div className={`text-[11px] ${muted} mt-1 break-words`}>
            {plan ? plan.name : "Upload a plan to begin."}
          </div>
          <div className={`text-[10px] ${muted} mt-1`}>
            Persist: <span className="font-mono">{persistKey}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] font-bold px-2 py-1 rounded border hover:bg-red-50 hover:text-red-700"
        >
          Clear All
        </button>
      </div>

      {/* Page controls */}
      <div className="mt-3">
        <PageNav pages={pages} pageIndex={pageIndex} onChange={onChangePage} disabled={!plan} />
      </div>

      {/* Scale readout */}
      <div className={`mt-3 text-[11px] ${muted}`}>
        <div className="font-bold uppercase tracking-wide text-[10px] mb-1">Scale (per page)</div>
        <div className="rounded border px-2 py-2 bg-slate-50 text-slate-700">
          {scale
            ? `${scale.pxPerUnit.toFixed(3)} px / ${scale.unit}`
            : "Not set (use the Scale tool)."}
        </div>
      </div>

      {/* Items list */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-black uppercase tracking-wide opacity-70">
            Measurements (page {pageIndex + 1})
          </div>
          <div className="text-[10px] opacity-60">{visibleMeasurements.length}</div>
        </div>

        {!plan ? (
          <div className="text-xs opacity-60">Upload a plan to begin.</div>
        ) : visibleMeasurements.length === 0 ? (
          <div className="text-xs opacity-60">No measurements on this page yet.</div>
        ) : (
          <div className="space-y-2">
            {visibleMeasurements.map((m) => {
              const computed = computeMeasurement(m, scale);
              let displayValue = '';
              
              if (computed.kind === 'linear' && computed.value !== null) {
                displayValue = `${formatNumber(computed.value, 2)} ${computed.unitLabel}`;
              } else if (computed.kind === 'area' && computed.value !== null) {
                displayValue = `${formatNumber(computed.value, 2)} ${computed.unitLabel}`;
              } else if (computed.kind === 'count') {
                displayValue = `Count: ${computed.count}`;
              }

              return (
                <div
                  key={m.id}
                  className="rounded border p-2 flex items-start justify-between gap-2 bg-white text-slate-800"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">
                      {m.label || m.kind.charAt(0).toUpperCase() + m.kind.slice(1)}
                    </div>
                    <div className="text-[11px] opacity-70 break-words">
                      {displayValue}
                    </div>
                    {onUpdateMeasurement && (
                      <input
                        className="mt-1 w-full text-[11px] border rounded px-2 py-1"
                        value={m.label || ""}
                        placeholder="Label…"
                        onChange={(e) => onUpdateMeasurement(m.id, { label: e.target.value })}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteMeasurement(m.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-600"
                    aria-label="Delete measurement"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
