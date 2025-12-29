import React, { useMemo } from 'react';
import { MousePointer2, Ruler, Hand, Minus, Square, MapPin, Undo2, Redo2 } from 'lucide-react';
import type { TakeoffTool } from './types';

type ToolDef = { 
  id: TakeoffTool; 
  label: string; 
  icon: React.ComponentType<{ size?: number }>; 
  shortcut?: string;
};

const tools: ToolDef[] = [
  { id: 'select', label: 'Select', icon: MousePointer2, shortcut: 'V' },
  { id: 'pan', label: 'Pan', icon: Hand, shortcut: 'H' },
  { id: 'scale', label: 'Scale', icon: Ruler, shortcut: 'S' },
  { id: 'linear', label: 'Linear', icon: Minus, shortcut: 'L' },
  { id: 'area', label: 'Area', icon: Square, shortcut: 'A' },
  { id: 'count', label: 'Count', icon: MapPin, shortcut: 'C' },
];

type Props = {
  isDarkMode: boolean;
  disabled?: boolean;
  tool: TakeoffTool;
  onChange: (t: TakeoffTool) => void;
  compact?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

export function TakeoffToolbar({ 
  isDarkMode, 
  disabled, 
  tool, 
  onChange, 
  compact = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: Props) {
  const theme = useMemo(
    () => ({
      panel: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
      active: 'bg-orange-600 text-white',
      idle: isDarkMode ? 'text-slate-300 hover:text-orange-400' : 'text-slate-500 hover:text-orange-600',
      separator: isDarkMode ? 'bg-slate-700' : 'bg-slate-200',
    }),
    [isDarkMode]
  );

  return (
    <div className={`rounded-lg border ${theme.panel} ${compact ? 'p-2' : 'p-3'} flex flex-col gap-2`}>
      {/* Tools */}
      {tools.map((t) => {
        const active = t.id === tool;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            disabled={disabled}
            onClick={() => onChange(t.id)}
            title={`${t.label}${t.shortcut ? ` (${t.shortcut})` : ''}`}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition border ${
              disabled
                ? 'opacity-30 cursor-not-allowed border-transparent'
                : active
                ? `${theme.active} border-orange-600`
                : `${theme.idle} border-transparent hover:border-orange-200`
            }`}
          >
            <Icon size={20} />
          </button>
        );
      })}

      {/* Separator */}
      {(onUndo || onRedo) && <div className={`h-px ${theme.separator} my-1`} />}

      {/* Undo/Redo */}
      {onUndo && (
        <button
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition border ${
            !canUndo
              ? 'opacity-30 cursor-not-allowed border-transparent'
              : `${theme.idle} border-transparent hover:border-orange-200`
          }`}
        >
          <Undo2 size={20} />
        </button>
      )}
      {onRedo && (
        <button
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (Ctrl+Y)"
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition border ${
            !canRedo
              ? 'opacity-30 cursor-not-allowed border-transparent'
              : `${theme.idle} border-transparent hover:border-orange-200`
          }`}
        >
          <Redo2 size={20} />
        </button>
      )}
    </div>
  );
}
