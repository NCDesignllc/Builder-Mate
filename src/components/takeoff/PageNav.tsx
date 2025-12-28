import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  pages: number;          // total pages (>= 0)
  pageIndex: number;      // 0-based
  onChange: (nextIndex: number) => void;
  disabled?: boolean;
  className?: string;
};

export function PageNav({ pages, pageIndex, onChange, disabled, className = "" }: Props) {
  const safePages = Math.max(0, Number(pages || 0));
  const safeIndex = Math.max(0, Math.min(Number(pageIndex || 0), Math.max(0, safePages - 1)));

  const options = useMemo(() => Array.from({ length: safePages }, (_, i) => i), [safePages]);

  const canPrev = !disabled && safePages > 0 && safeIndex > 0;
  const canNext = !disabled && safePages > 0 && safeIndex < safePages - 1;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => onChange(safeIndex - 1)}
        className="p-1.5 rounded border text-xs disabled:opacity-40 hover:bg-slate-50"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
      </button>

      <select
        disabled={disabled || safePages <= 1}
        value={safeIndex}
        onChange={(e) => onChange(Number(e.target.value))}
        className="text-xs border rounded px-2 py-1 bg-white disabled:opacity-60"
        aria-label="Select page"
      >
        {options.map((i) => (
          <option key={i} value={i}>
            Page {i + 1}
          </option>
        ))}
      </select>

      <div className="text-[11px] opacity-70 min-w-[64px] text-center">/ {safePages || "?"}</div>

      <button
        type="button"
        disabled={!canNext}
        onClick={() => onChange(safeIndex + 1)}
        className="p-1.5 rounded border text-xs disabled:opacity-40 hover:bg-slate-50"
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
