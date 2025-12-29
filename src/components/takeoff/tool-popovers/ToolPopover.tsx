/**
 * Base popover component for tool sub-options
 */

import React, { useEffect, useRef } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  isDarkMode: boolean;
  title?: string;
  children: React.ReactNode;
};

export function ToolPopover({ isOpen, onClose, anchorEl, isDarkMode, title, children }: Props) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        anchorEl &&
        !anchorEl.contains(target)
      ) {
        onClose();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen || !anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const style: React.CSSProperties = {
    position: 'fixed',
    left: rect.left + rect.width / 2,
    bottom: window.innerHeight - rect.top + 8,
    transform: 'translateX(-50%)',
    zIndex: 100,
  };

  const theme = isDarkMode
    ? 'bg-slate-800 border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-800';

  return (
    <div ref={popoverRef} style={style} className={`rounded-lg border shadow-xl ${theme} min-w-[150px]`}>
      {title && (
        <div className="px-3 py-2 border-b border-slate-700 font-bold text-xs uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="p-2">{children}</div>
    </div>
  );
}

type OptionProps = {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  isDarkMode: boolean;
  disabled?: boolean;
};

export function PopoverOption({ onClick, label, icon, isDarkMode, disabled }: OptionProps) {
  const theme = isDarkMode
    ? 'hover:bg-slate-700 text-slate-200'
    : 'hover:bg-slate-100 text-slate-700';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition ${theme} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
