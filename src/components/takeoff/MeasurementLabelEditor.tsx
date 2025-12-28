import React, { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';

type Props = {
  isDarkMode: boolean;
  label?: string | null;
  tag?: string | null;
  onSave: (next: { label?: string; tag?: string }) => void;
  onCancel: () => void;
};

export function MeasurementLabelEditor({ isDarkMode, label, tag, onSave, onCancel }: Props) {
  const [nextLabel, setNextLabel] = useState(label ?? '');
  const [nextTag, setNextTag] = useState(tag ?? '');

  useEffect(() => {
    setNextLabel(label ?? '');
    setNextTag(tag ?? '');
  }, [label, tag]);

  const theme = useMemo(
    () => ({
      input: isDarkMode
        ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500'
        : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400',
      btn: isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50',
    }),
    [isDarkMode]
  );

  function commit() {
    const cleanLabel = nextLabel.trim();
    const cleanTag = nextTag.trim();
    onSave({
      label: cleanLabel ? cleanLabel : undefined,
      tag: cleanTag ? cleanTag : undefined,
    });
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2">
        <input
          value={nextLabel}
          onChange={(e) => setNextLabel(e.target.value)}
          placeholder="Label (e.g., Kitchen perimeter)"
          className={`w-full text-xs px-2 py-1 rounded border outline-none ${theme.input}`}
        />
      </div>
      <div className="flex gap-2 items-center">
        <input
          value={nextTag}
          onChange={(e) => setNextTag(e.target.value)}
          placeholder="Tag (e.g., Kitchen)"
          className={`w-full text-xs px-2 py-1 rounded border outline-none ${theme.input}`}
        />
        <button onClick={commit} className={`p-1.5 rounded ${theme.btn} text-emerald-600`} title="Save">
          <Check size={16} />
        </button>
        <button onClick={onCancel} className={`p-1.5 rounded ${theme.btn} text-red-600`} title="Cancel">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
