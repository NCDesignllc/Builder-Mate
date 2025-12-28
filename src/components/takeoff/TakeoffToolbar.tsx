import React, { useMemo } from 'react';
import { MousePointer2, Ruler, Minus, Square, Hand, Tag, Hash, Eye, EyeOff } from 'lucide-react';
import type { TakeoffTool } from './types';

type ToolDef = { id: TakeoffTool; label: string; icon: React.ComponentType<{ size?: number }>; };

const tools: ToolDef[] = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'pan', label: 'Pan', icon: Hand },
  { id: 'scale', label: 'Scale', icon: Ruler },
  { id: 'measure', label: 'Length', icon: Minus },
  { id: 'area', label: 'Area', icon: Square },
  { id: 'count', label: 'Count', icon: Hash },
  { id: 'label', label: 'Label', icon: Tag },
];

type Props = {
  isDarkMode: boolean;
  disabled?: boolean;
  tool: TakeoffTool;
  onChange: (t: TakeoffTool) => void;
  compact?: boolean;
  labelsVisible?: boolean;
  onToggleLabels?: () => void;
};

export function TakeoffToolbar({ isDarkMode, disabled, tool, onChange, compact = false, labelsVisible = true, onToggleLabels }: Props) {
  const theme = useMemo(
    () => ({
      panel: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
      active: 'bg-orange-600 text-white',
      idle: isDarkMode ? 'text-slate-300 hover:text-orange-400' : 'text-slate-500 hover:text-orange-600',
      toggle: isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200',
    }),
    [isDarkMode]
  );

  return (
    <div className={`rounded-lg border ${theme.panel} ${compact ? 'p-2' : 'p-3'} flex flex-col gap-2`}>
      {/* Tool buttons */}
      {tools.map((t) => {
        const active = t.id === tool;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            disabled={disabled}
            onClick={() => onChange(t.id)}
            title={t.label}
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
      
      {/* Divider */}
      {onToggleLabels && (
        <>
          <div className="h-px bg-slate-700 my-1" />
          
          {/* Label visibility toggle */}
          <button
            disabled={disabled}
            onClick={onToggleLabels}
            title={labelsVisible ? "Hide labels" : "Show labels"}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition border ${
              disabled
                ? 'opacity-30 cursor-not-allowed'
                : labelsVisible
                ? `${theme.active} border-orange-600`
                : `${theme.toggle} ${theme.idle} border-transparent hover:border-slate-400`
            }`}
          >
            {labelsVisible ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </>
      )}
    </div>
  );
}
