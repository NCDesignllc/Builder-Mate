import React, { useMemo } from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2 } from 'lucide-react';
import type { Layer } from './types';

type Props = {
  isDarkMode: boolean;
  layers: Layer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteLayer?: (id: string) => void;
  onAddLayer?: () => void;
};

export function LayersPanel({
  isDarkMode,
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onAddLayer,
}: Props) {
  const theme = useMemo(
    () => ({
      panel: isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900',
      muted: isDarkMode ? 'text-slate-300' : 'text-slate-600',
      active: 'bg-orange-600 text-white',
      idle: isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200',
      btn: isDarkMode
        ? 'bg-slate-700 hover:bg-slate-600 border-slate-600'
        : 'bg-white hover:bg-slate-50 border-slate-200',
    }),
    [isDarkMode]
  );

  return (
    <div className={`w-64 rounded-lg border p-3 ${theme.panel}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-black text-xs uppercase tracking-wide">Layers</h4>
        {onAddLayer && (
          <button
            onClick={onAddLayer}
            className={`p-1 rounded border ${theme.btn}`}
            title="Add custom layer"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <div className="space-y-1">
        {layers.map((layer) => {
          const isActive = layer.id === activeLayerId;

          return (
            <div
              key={layer.id}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                isActive ? theme.active : theme.idle
              }`}
              onClick={() => onSelectLayer(layer.id)}
            >
              {/* Color indicator */}
              <div
                className="w-4 h-4 rounded border border-white/20"
                style={{ backgroundColor: layer.color }}
              />

              {/* Layer name */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{layer.name}</div>
              </div>

              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(layer.id);
                }}
                className="p-1 rounded hover:bg-white/10"
                title={layer.visible ? 'Hide layer' : 'Show layer'}
              >
                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>

              {/* Lock toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock(layer.id);
                }}
                className="p-1 rounded hover:bg-white/10"
                title={layer.locked ? 'Unlock layer' : 'Lock layer'}
              >
                {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>

              {/* Delete (only for custom layers) */}
              {layer.type === 'custom' && onDeleteLayer && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayer(layer.id);
                  }}
                  className="p-1 rounded hover:bg-red-500/20 text-red-500"
                  title="Delete layer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className={`mt-3 text-[10px] ${theme.muted}`}>
        <div className="font-bold uppercase mb-1">Legend</div>
        <div className="space-y-1">
          {layers.filter(l => l.visible).map((layer) => (
            <div key={layer.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: layer.color }}
              />
              <span>{layer.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
