import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

type Props = {
  doc: any;
  pageIndex: number;
  isActive: boolean;
  isHidden: boolean;
  showHiddenIndicator: boolean;
  label: string;
  onClick: () => void;
  onHide: () => void;
  onRemove: () => void;
  isDarkMode: boolean;
};

export function BlueprintThumbnailItem({
  doc,
  pageIndex,
  isActive,
  isHidden,
  showHiddenIndicator,
  label,
  onClick,
  onHide,
  onRemove,
  isDarkMode,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [done, setDone] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setDone(false);
        const page = await doc.getPage(pageIndex + 1);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 0.12 }); // smaller thumbnail for horizontal layout
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.ceil(viewport.width * dpr);
        canvas.height = Math.ceil(viewport.height * dpr);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;

        const ctx = canvas.getContext('2d', { alpha: false })!;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const task = page.render({ canvasContext: ctx, viewport });
        await task.promise;
        if (!cancelled) setDone(true);

        try {
          page.cleanup?.();
        } catch {}
      } catch {
        if (!cancelled) setDone(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doc, pageIndex]);

  const baseFrame = isDarkMode
    ? 'border-slate-700 bg-slate-800'
    : 'border-slate-200 bg-white';

  const activeFrame = isActive
    ? 'ring-2 ring-orange-500 border-orange-500'
    : hover && !isHidden
    ? isDarkMode
      ? 'border-slate-500'
      : 'border-slate-400'
    : '';

  const hiddenStyle = isHidden
    ? 'opacity-50 border-dashed'
    : '';

  return (
    <div
      className={`relative flex-shrink-0 group cursor-pointer transition-all duration-150 ${hiddenStyle}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${baseFrame} ${activeFrame} transition-all duration-150`}
        aria-label={`Select ${label}`}
        title={label}
      >
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="block bg-white rounded shadow-sm"
            style={{ minWidth: 60, minHeight: 80 }}
          />
          {!done && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 rounded">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {isHidden && showHiddenIndicator && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded">
              <EyeOff size={20} className="text-white drop-shadow" />
            </div>
          )}
        </div>
        <div
          className={`text-[10px] font-bold truncate max-w-[80px] ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label}
        </div>
        {isHidden && (
          <div className="text-[8px] font-bold uppercase tracking-wide text-orange-500">
            Hidden
          </div>
        )}
      </button>

      {/* Action buttons - show on hover */}
      {(hover || isActive) && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
            className={`p-1 rounded-full shadow-lg transition-colors ${
              isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-white hover:bg-slate-100 text-slate-700'
            } border ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}
            title={isHidden ? 'Show page' : 'Hide page'}
            aria-label={isHidden ? 'Show page' : 'Hide page'}
          >
            {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={`p-1 rounded-full shadow-lg transition-colors ${
              isDarkMode
                ? 'bg-red-900 hover:bg-red-800 text-red-200'
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            } border ${isDarkMode ? 'border-red-800' : 'border-red-200'}`}
            title="Remove page"
            aria-label="Remove page"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
