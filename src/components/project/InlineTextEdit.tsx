import React, { useEffect, useRef, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';

type Props = {
  value: string;
  placeholder?: string;
  isDarkMode: boolean;
  onSave: (next: string) => void;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
};

export function InlineTextEdit({
  value,
  placeholder,
  isDarkMode,
  onSave,
  className = '',
  inputClassName = '',
  maxLength = 120,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setText(value ?? ''), [value]);

  useEffect(() => {
    if (!editing) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [editing]);

  const commit = () => {
    const next = (text ?? '').trim();
    if (next && next !== value) onSave(next);
    setEditing(false);
  };

  const cancel = () => {
    setText(value ?? '');
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`inline-flex items-center gap-2 min-w-0 ${className}`}
        title="Edit"
      >
        <span className="truncate">{value || placeholder || '—'}</span>
        <Pencil size={12} className="opacity-60 shrink-0" />
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 min-w-0 ${className}`}>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') cancel();
        }}
        placeholder={placeholder}
        className={`px-2 py-1 rounded border text-sm outline-none min-w-[180px] ${
          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        } ${inputClassName}`}
      />
      <button
        onClick={commit}
        className="p-1 rounded hover:bg-orange-500/10 text-orange-600"
        title="Save"
      >
        <Check size={16} />
      </button>
      <button
        onClick={cancel}
        className="p-1 rounded hover:bg-red-500/10 text-red-600"
        title="Cancel"
      >
        <X size={16} />
      </button>
    </div>
  );
}
