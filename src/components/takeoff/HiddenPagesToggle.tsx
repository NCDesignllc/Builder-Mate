import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = {
  showHiddenPages: boolean;
  onToggle: () => void;
  hiddenCount: number;
  isDarkMode: boolean;
};

export function HiddenPagesToggle({
  showHiddenPages,
  onToggle,
  hiddenCount,
  isDarkMode,
}: Props) {
  if (hiddenCount === 0) return null;

  const baseStyle = isDarkMode
    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

  const activeStyle = showHiddenPages
    ? 'ring-2 ring-orange-500 border-orange-500'
    : '';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${baseStyle} ${activeStyle}`}
      title={showHiddenPages ? 'Hide hidden pages' : 'Show hidden pages'}
    >
      {showHiddenPages ? <Eye size={14} /> : <EyeOff size={14} />}
      <span>{showHiddenPages ? 'Hide' : 'Show'} Hidden</span>
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
          isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {hiddenCount}
      </span>
    </button>
  );
}
