import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Ruler } from "lucide-react";
import type { TakeoffScale } from "./types";

type Props = {
  scale: TakeoffScale | null;
  isDarkMode: boolean;
  compact?: boolean;
  onSetScale?: () => void;
};

/**
 * ScaleStatusIndicator
 * Shows the current scale status with visual feedback:
 * - Green checkmark: Scale is set and verified
 * - Orange warning: No scale set
 * - Displays scale info when set
 */
export function ScaleStatusIndicator({ scale, isDarkMode, compact = false, onSetScale }: Props) {
  const theme = useMemo(
    () => ({
      verified: isDarkMode
        ? "bg-green-900/30 border-green-700 text-green-100"
        : "bg-green-50 border-green-300 text-green-900",
      unverified: isDarkMode
        ? "bg-orange-900/30 border-orange-700 text-orange-100"
        : "bg-orange-50 border-orange-300 text-orange-900",
      muted: isDarkMode ? "text-slate-300" : "text-slate-600",
      btn: isDarkMode
        ? "bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700"
        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50",
    }),
    [isDarkMode]
  );

  if (!scale) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.unverified}`}>
        <AlertTriangle size={compact ? 14 : 16} />
        <div className="flex-1 min-w-0">
          <div className={`${compact ? "text-[10px]" : "text-xs"} font-bold uppercase tracking-wide`}>
            No Scale Set
          </div>
          {!compact && (
            <div className={`text-[11px] ${theme.muted}`}>
              Measurements will show in pixels only
            </div>
          )}
        </div>
        {onSetScale && (
          <button
            onClick={onSetScale}
            className={`text-xs font-bold px-2 py-1 rounded border ${theme.btn}`}
          >
            Set Scale
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.verified}`}>
      <CheckCircle2 size={compact ? 14 : 16} />
      <div className="flex-1 min-w-0">
        <div className={`${compact ? "text-[10px]" : "text-xs"} font-bold uppercase tracking-wide`}>
          Scale Verified
        </div>
        <div className={`${compact ? "text-[10px]" : "text-[11px]"} font-mono`}>
          {scale.pxPerUnit.toFixed(2)} px/{scale.unit}
        </div>
        {!compact && scale.label && (
          <div className={`text-[11px] ${theme.muted}`}>
            Calibrated: {scale.label}
          </div>
        )}
      </div>
      {onSetScale && (
        <button
          onClick={onSetScale}
          className={`text-xs font-bold px-2 py-1 rounded border ${theme.btn}`}
          title="Recalibrate scale"
        >
          <Ruler size={14} />
        </button>
      )}
    </div>
  );
}
