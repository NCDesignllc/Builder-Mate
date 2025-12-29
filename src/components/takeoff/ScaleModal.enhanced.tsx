import React, { useMemo, useState } from 'react';
import type { TakeoffScale } from './types';
import type { ScaleModel } from '../../types/measurements';
import { ARCHITECTURAL_PRESETS, createCalibratedScale, createStandardScale } from '../../services/scaleUtils';

type Props = {
  isOpen: boolean;
  isDarkMode: boolean;
  pixelDistance: number | null;
  calibrationPoints?: [{ x: number; y: number }, { x: number; y: number }] | null;
  pageIndex?: number;
  onClose: () => void;
  onApply: (scale: TakeoffScale) => void;
  onApplyEnhanced?: (scale: ScaleModel) => void;
  onStartCalibration?: () => void;
};

type TabType = 'calibrated' | 'standard';

export function ScaleModal({ 
  isOpen, 
  isDarkMode, 
  pixelDistance, 
  calibrationPoints,
  pageIndex = 0,
  onClose, 
  onApply,
  onApplyEnhanced,
  onStartCalibration,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('calibrated');
  
  // Calibrated tab state
  const [feet, setFeet] = useState<string>('20');
  const [inches, setInches] = useState<string>('0');
  const [fraction, setFraction] = useState<string>('0');
  const [showDimensionLine, setShowDimensionLine] = useState(true);
  
  // Standard tab state
  const [selectedPreset, setSelectedPreset] = useState<number>(4); // Default to 1/4" = 1'-0"
  const [applyToAll, setApplyToAll] = useState(false);

  const theme = useMemo(() => ({
    overlay: 'bg-slate-900/60 backdrop-blur-sm',
    card: isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800',
    header: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200',
    muted: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    input: isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800',
    btn: 'bg-orange-600 text-white hover:bg-orange-700',
    btn2: isDarkMode ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50',
    tabActive: 'bg-orange-600 text-white',
    tabInactive: isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  }), [isDarkMode]);

  if (!isOpen) return null;

  const canApplyCalibratedLegacy = pixelDistance != null && pixelDistance > 0 && 
    (Number(feet) > 0 || Number(inches) > 0 || Number(fraction) > 0);

  const canApplyCalibrated = calibrationPoints && 
    (Number(feet) > 0 || Number(inches) > 0 || Number(fraction) > 0);

  function applyCalibratedLegacy() {
    if (!canApplyCalibratedLegacy) return;
    const totalFeet = Number(feet) + Number(inches) / 12 + Number(fraction) / 12;
    const pxPerUnit = (pixelDistance as number) / totalFeet;
    onApply({ pxPerUnit, unit: 'ft', label: `${feet}' ${inches}"` });
    onClose();
  }

  function applyCalibrated() {
    if (!canApplyCalibrated || !calibrationPoints) return;
    
    if (onApplyEnhanced) {
      // Use new enhanced API
      const scale = createCalibratedScale(
        calibrationPoints[0],
        calibrationPoints[1],
        Number(feet),
        Number(inches),
        Number(fraction),
        {
          pageIndex,
          showDimensionLine,
          name: `Calibrated`,
        }
      );
      onApplyEnhanced(scale);
    } else {
      // Fallback to legacy API
      applyCalibratedLegacy();
    }
    onClose();
  }

  function applyStandard() {
    if (onApplyEnhanced) {
      // Use new enhanced API
      const scale = createStandardScale(
        selectedPreset,
        1.0, // viewport scale
        {
          pageIndex: applyToAll ? undefined : pageIndex,
          name: `Standard`,
          applyToAll,
        }
      );
      onApplyEnhanced(scale);
    } else {
      // Fallback to legacy API - approximate conversion
      const preset = ARCHITECTURAL_PRESETS[selectedPreset];
      const pxPerUnit = 96 * preset.ratio * 12; // Rough approximation
      onApply({ pxPerUnit, unit: 'ft', label: preset.label });
    }
    onClose();
  }

  function handleSetCalibrated() {
    if (onStartCalibration) {
      // Signal to start two-point capture
      onStartCalibration();
    } else {
      // Legacy: apply immediately with existing pixel distance
      applyCalibratedLegacy();
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme.overlay}`}>
      <div className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden border ${theme.card}`}>
        {/* Header */}
        <div className={`p-4 border-b ${theme.header}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-black uppercase text-sm tracking-wider">Set Scale</h3>
            <button onClick={onClose} className="text-xs font-bold opacity-70 hover:opacity-100">Close</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('calibrated')}
            className={`flex-1 px-4 py-3 text-sm font-bold transition ${
              activeTab === 'calibrated' ? theme.tabActive : theme.tabInactive
            }`}
          >
            Calibrated
          </button>
          <button
            onClick={() => setActiveTab('standard')}
            className={`flex-1 px-4 py-3 text-sm font-bold transition ${
              activeTab === 'standard' ? theme.tabActive : theme.tabInactive
            }`}
          >
            Standard
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 space-y-4">
          {activeTab === 'calibrated' && (
            <>
              <p className={`text-xs ${theme.muted}`}>
                Enter a known distance, then click two points on the plan to calibrate the scale.
              </p>

              {pixelDistance && (
                <div className={`text-xs ${theme.muted}`}>
                  Pixel distance: <span className="font-mono font-bold">{pixelDistance.toFixed(1)}</span>
                </div>
              )}

              {/* Quick presets */}
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 20, 50].map((n) => (
                  <button 
                    key={n} 
                    onClick={() => { setFeet(String(n)); setInches('0'); setFraction('0'); }}
                    className={`text-xs font-bold px-3 py-2 rounded border ${theme.btn2}`}
                  >
                    {n}'
                  </button>
                ))}
                <button 
                  onClick={() => { setFeet('1'); setInches('0'); setFraction('0'); }}
                  className={`text-xs font-bold px-3 py-2 rounded border ${theme.btn2}`}
                >
                  1'
                </button>
                <button 
                  onClick={() => { setFeet('100'); setInches('0'); setFraction('0'); }}
                  className={`text-xs font-bold px-3 py-2 rounded border ${theme.btn2}`}
                >
                  100'
                </button>
              </div>

              {/* Known distance inputs */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`text-[11px] font-bold uppercase ${theme.muted}`}>Feet</label>
                  <input
                    type="number"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded border outline-none ${theme.input}`}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className={`text-[11px] font-bold uppercase ${theme.muted}`}>Inches</label>
                  <input
                    type="number"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded border outline-none ${theme.input}`}
                    placeholder="0"
                    min="0"
                    max="11"
                  />
                </div>
                <div>
                  <label className={`text-[11px] font-bold uppercase ${theme.muted}`}>Fraction</label>
                  <select
                    value={fraction}
                    onChange={(e) => setFraction(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded border outline-none ${theme.input}`}
                  >
                    <option value="0">0</option>
                    <option value="0.0625">1/16"</option>
                    <option value="0.125">1/8"</option>
                    <option value="0.1875">3/16"</option>
                    <option value="0.25">1/4"</option>
                    <option value="0.3125">5/16"</option>
                    <option value="0.375">3/8"</option>
                    <option value="0.4375">7/16"</option>
                    <option value="0.5">1/2"</option>
                    <option value="0.5625">9/16"</option>
                    <option value="0.625">5/8"</option>
                    <option value="0.6875">11/16"</option>
                    <option value="0.75">3/4"</option>
                    <option value="0.8125">13/16"</option>
                    <option value="0.875">7/8"</option>
                    <option value="0.9375">15/16"</option>
                  </select>
                </div>
              </div>

              {/* Show dimension line toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDimensionLine}
                  onChange={(e) => setShowDimensionLine(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <span className={`text-sm ${theme.muted}`}>Show Dimension Line</span>
              </label>

              <div className={`text-[11px] ${theme.muted}`}>
                <b>Helper text:</b> Choose the longest line available for more accuracy
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={onClose} className={`text-xs font-bold px-4 py-2 rounded border ${theme.btn2}`}>
                  Cancel
                </button>
                <button 
                  onClick={handleSetCalibrated}
                  disabled={!canApplyCalibratedLegacy && !canApplyCalibrated}
                  className={`text-xs font-bold px-4 py-2 rounded ${theme.btn} ${
                    !canApplyCalibratedLegacy && !canApplyCalibrated ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Set
                </button>
              </div>
            </>
          )}

          {activeTab === 'standard' && (
            <>
              <p className={`text-xs ${theme.muted}`}>
                Select an architectural scale preset to apply to the current page or all pages.
              </p>

              {/* Preset dropdown */}
              <div>
                <label className={`text-[11px] font-bold uppercase ${theme.muted}`}>Scale Preset</label>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(Number(e.target.value))}
                  className={`w-full mt-1 px-3 py-2 rounded border outline-none ${theme.input}`}
                  size={9}
                >
                  {ARCHITECTURAL_PRESETS.map((preset, index) => (
                    <option key={index} value={index}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Apply to all toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <span className={`text-sm ${theme.muted}`}>Apply to all plan sheets</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={onClose} className={`text-xs font-bold px-4 py-2 rounded border ${theme.btn2}`}>
                  Cancel
                </button>
                <button 
                  onClick={applyStandard}
                  className={`text-xs font-bold px-4 py-2 rounded ${theme.btn}`}
                >
                  Set
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
