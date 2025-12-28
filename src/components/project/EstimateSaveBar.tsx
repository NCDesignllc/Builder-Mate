import React from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

type Props = {
  isDirty: boolean;
  lastSavedAt: Date | null;
  onSave: () => void;
  isDarkMode: boolean;
};

export function EstimateSaveBar({ isDirty, lastSavedAt, onSave, isDarkMode }: Props) {
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        {isDirty ? (
          <>
            <span className="inline-flex w-2 h-2 rounded-full bg-amber-500" />
            <span className="opacity-80">Unsaved changes</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="opacity-80">
              Saved{lastSavedAt ? ` at ${fmt(lastSavedAt)}` : ''}
            </span>
          </>
        )}
      </div>

      <button
        onClick={onSave}
        disabled={!isDirty}
        className={`text-xs font-bold uppercase flex items-center gap-2 px-3 py-2 rounded ${
          isDirty
            ? 'bg-orange-600 text-white hover:bg-orange-700'
            : isDarkMode
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
        title={isDirty ? 'Save estimate to project' : 'No changes to save'}
      >
        <Save size={14} />
        Save
      </button>
    </div>
  );
}
