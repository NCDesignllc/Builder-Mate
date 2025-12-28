import React from 'react';
import { X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDarkMode: boolean;
  maxWidth?: string; // tailwind max-w-* class
};

export function Modal({ isOpen, onClose, title, children, isDarkMode, maxWidth = 'max-w-md' }: Props) {
  if (!isOpen) return null;

  const theme = {
    overlay: 'bg-slate-900/60 backdrop-blur-sm',
    container: isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200',
    header: isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-800',
    text: isDarkMode ? 'text-slate-200' : 'text-slate-700',
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme.overlay}`}>
      <div className={`w-full ${maxWidth} rounded-xl shadow-2xl overflow-hidden border ${theme.container}`}>
        <div className={`p-4 flex justify-between items-center border-b ${theme.header}`}>
          <h3 className="font-bold text-sm uppercase">{title}</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className={`p-6 ${theme.text}`}>{children}</div>
      </div>
    </div>
  );
}
