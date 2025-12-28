import React from 'react';
import { AlertCircle, X } from 'lucide-react';

type Props = {
  title?: string;
  message: string;
  onClose?: () => void;
  isDarkMode?: boolean;
};

export function Alert({ title = 'Error', message, onClose, isDarkMode }: Props) {
  return (
    <div className={`rounded-lg border p-4 flex items-start gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      <AlertCircle className="text-red-600 mt-0.5" size={18} />
      <div className="flex-1">
        <div className="font-bold text-sm">{title}</div>
        <div className="text-sm opacity-80 whitespace-pre-wrap">{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100" aria-label="Close">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
