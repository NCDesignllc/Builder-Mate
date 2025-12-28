import React from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  isDarkMode: boolean;
  onSetScale: () => void;
};

/**
 * ScaleWarningOverlay
 * Shows a warning when user tries to create measurements without a scale
 */
export function ScaleWarningOverlay({ isDarkMode, onSetScale }: Props) {
  const theme = isDarkMode
    ? "bg-orange-900/90 border-orange-700 text-orange-100"
    : "bg-orange-50/95 border-orange-300 text-orange-900";
  
  const btnTheme = isDarkMode
    ? "bg-orange-700 text-white hover:bg-orange-600"
    : "bg-orange-600 text-white hover:bg-orange-700";

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={`pointer-events-auto max-w-md mx-4 p-6 rounded-xl border-2 shadow-2xl ${theme}`}>
        <div className="flex items-start gap-4">
          <AlertTriangle size={32} className="flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Scale Required</h3>
            <p className="text-sm mb-4 leading-relaxed">
              To create accurate measurements, you must first set the scale for this page.
              Use the Scale tool to calibrate a known distance on the plan.
            </p>
            <button
              onClick={onSetScale}
              className={`px-4 py-2 rounded font-bold text-sm ${btnTheme}`}
            >
              Set Scale Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
