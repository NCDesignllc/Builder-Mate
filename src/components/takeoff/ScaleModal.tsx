import React, { useMemo, useState } from 'react';
import type { TakeoffScale } from './types';

type Props = {
  isOpen: boolean;
  isDarkMode: boolean;
  pixelDistance: number | null; // distance between clicked points in plan pixels
  onClose: () => void;
  onApply: (scale: TakeoffScale) => void;
};

const units: TakeoffScale['unit'][] = ['ft', 'in', 'm', 'cm'];

export function ScaleModal({ isOpen, isDarkMode, pixelDistance, onClose, onApply }: Props) {
  const [realDist, setRealDist] = useState<string>('10');
  const [unit, setUnit] = useState<TakeoffScale['unit']>('ft');

  const theme = useMemo(() => ({
    overlay: 'bg-slate-900/60 backdrop-blur-sm',
    card: isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800',
    header: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200',
    muted: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    input: isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800',
    btn: 'bg-orange-600 text-white hover:bg-orange-700',
    btn2: isDarkMode ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50',
  }), [isDarkMode]);

  if (!isOpen) return null;

  const canApply = pixelDistance != null && pixelDistance > 0 && Number(realDist) > 0;

  function apply() {
    if (!canApply) return;
    const val = Number(realDist);
    if (!Number.isFinite(val) || val <= 0) return;
    const pxPerUnit = (pixelDistance as number) / val;
    onApply({ pxPerUnit, unit, label: `${val} ${unit}` });
    onClose();
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme.overlay}`}>
      <div className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden border ${theme.card}`}>
        <div className={`p-4 border-b ${theme.header}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-black uppercase text-sm tracking-wider">Set Scale</h3>
            <button onClick={onClose} className="text-xs font-bold opacity-70 hover:opacity-100">Close</button>
          </div>
          <p className={`text-xs mt-1 ${theme.muted}`}>
            Click two points on the plan that represent a known distance, then enter the real-world distance.
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div className={`text-xs ${theme.muted}`}>
            Pixel distance: <span className="font-mono font-bold">{pixelDistance ? pixelDistance.toFixed(1) : '—'}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 20, 50].map((n) => (
              <button key={n} onClick={() => setRealDist(String(n))} className={`text-xs font-bold px-3 py-2 rounded border ${theme.btn2}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setRealDist('1')} className={`text-xs font-bold px-3 py-2 rounded border ${theme.btn2}`}>1</button>
            <button onClick={() => setRealDist('100')} className={`text-xs font-bold px-3 py-2 rounded border ${theme.btn2}`}>100</button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={`text-[11px] font-bold uppercase ${theme.muted}`}>Real distance</label>
              <input
                value={realDist}
                onChange={(e) => setRealDist(e.target.value)}
                inputMode="decimal"
                className={`w-full mt-1 px-3 py-2 rounded border outline-none ${theme.input}`}
                placeholder="10"
              />
            </div>
            <div>
              <label className={`text-[11px] font-bold uppercase ${theme.muted}`}>Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className={`w-full mt-1 px-3 py-2 rounded border outline-none ${theme.input}`}
              >
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={onClose} className={`text-xs font-bold px-4 py-2 rounded border ${theme.btn2}`}>Cancel</button>
            <button onClick={apply} disabled={!canApply} className={`text-xs font-bold px-4 py-2 rounded ${theme.btn} ${!canApply ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Apply Scale
            </button>
          </div>

          <div className={`text-[11px] ${theme.muted}`}>
            Tip: Hold <b>Shift</b> to snap to 45° angles. Press <b>Backspace</b> to undo a point. Press <b>Esc</b> to cancel.
          </div>
        </div>
      </div>
    </div>
  );
}
