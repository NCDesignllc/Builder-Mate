import React, { useMemo, useState, useRef } from 'react';
import { 
  MousePointer2, Ruler, Hand, Minus, Square, MapPin, 
  Undo2, Redo2, Home, TrendingUp, Box, Scissors, 
  MessageSquare, Download 
} from 'lucide-react';
import type { TakeoffTool } from './types';
import type { AreaMode, LinearMode, CountMode, MarkupType, ExportFormat } from '../../types/measurements';
import { AreaPopover } from './tool-popovers/AreaPopover';
import { LinearPopover } from './tool-popovers/LinearPopover';
import { CountPopover } from './tool-popovers/CountPopover';
import { MarkupPopover } from './tool-popovers/MarkupPopover';
import { DownloadPopover } from './tool-popovers/DownloadPopover';

type ToolDef = { 
  id: TakeoffTool; 
  label: string; 
  icon: React.ComponentType<{ size?: number }>; 
  shortcut?: string;
  hasPopover?: boolean;
};

const tools: ToolDef[] = [
  { id: 'select', label: 'Select', icon: MousePointer2, shortcut: 'V' },
  { id: 'pan', label: 'Pan', icon: Hand, shortcut: 'H' },
  { id: 'scale', label: 'Scale', icon: Ruler, shortcut: 'S' },
  { id: 'area', label: 'Area', icon: Square, shortcut: 'A', hasPopover: true },
  { id: 'linear', label: 'Linear', icon: Minus, shortcut: 'L', hasPopover: true },
  { id: 'count', label: 'Count', icon: MapPin, shortcut: 'C', hasPopover: true },
  { id: 'wallArea', label: 'Wall Area', icon: Home },
  { id: 'slope', label: 'Slope', icon: TrendingUp },
  { id: 'volume', label: 'Volume', icon: Box },
  { id: 'subtract', label: 'Subtract', icon: Scissors },
  { id: 'markup', label: 'Markup', icon: MessageSquare, hasPopover: true },
  { id: 'download', label: 'Download', icon: Download, hasPopover: true },
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
  // Popover handlers
  onAreaModeSelect?: (mode: AreaMode) => void;
  onLinearModeSelect?: (mode: LinearMode) => void;
  onCountModeSelect?: (mode: CountMode) => void;
  onMarkupModeSelect?: (mode: MarkupType) => void;
  onExportFormatSelect?: (format: ExportFormat) => void;
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
  onAreaModeSelect,
  onLinearModeSelect,
  onCountModeSelect,
  onMarkupModeSelect,
  onExportFormatSelect,
}: Props) {
  const [openPopover, setOpenPopover] = useState<TakeoffTool | null>(null);
  const buttonRefs = useRef<Record<TakeoffTool, HTMLButtonElement | null>>({} as any);

  const theme = useMemo(
    () => ({
      panel: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
      active: 'bg-orange-600 text-white',
      idle: isDarkMode ? 'text-slate-300 hover:text-orange-400' : 'text-slate-500 hover:text-orange-600',
      separator: isDarkMode ? 'bg-slate-700' : 'bg-slate-200',
    }),
    [isDarkMode]
  );

  function handleToolClick(t: ToolDef) {
    if (t.hasPopover) {
      // Toggle popover
      if (openPopover === t.id) {
        setOpenPopover(null);
      } else {
        setOpenPopover(t.id);
        onChange(t.id);
      }
    } else {
      // Direct tool activation
      onChange(t.id);
      setOpenPopover(null);
    }
  }

  function closePopover() {
    setOpenPopover(null);
  }

  return (
    <>
      <div className={`rounded-lg border ${theme.panel} ${compact ? 'p-2' : 'p-3'} flex flex-col gap-2`}>
        {/* Tools */}
        {tools.map((t) => {
          const active = t.id === tool;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              ref={(el) => (buttonRefs.current[t.id] = el)}
              disabled={disabled}
              onClick={() => handleToolClick(t)}
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

      {/* Popovers */}
      <AreaPopover
        isOpen={openPopover === 'area'}
        onClose={closePopover}
        anchorEl={buttonRefs.current.area}
        isDarkMode={isDarkMode}
        onSelectMode={(mode) => {
          onAreaModeSelect?.(mode);
          closePopover();
        }}
      />
      <LinearPopover
        isOpen={openPopover === 'linear'}
        onClose={closePopover}
        anchorEl={buttonRefs.current.linear}
        isDarkMode={isDarkMode}
        onSelectMode={(mode) => {
          onLinearModeSelect?.(mode);
          closePopover();
        }}
      />
      <CountPopover
        isOpen={openPopover === 'count'}
        onClose={closePopover}
        anchorEl={buttonRefs.current.count}
        isDarkMode={isDarkMode}
        onSelectMode={(mode) => {
          onCountModeSelect?.(mode);
          closePopover();
        }}
      />
      <MarkupPopover
        isOpen={openPopover === 'markup'}
        onClose={closePopover}
        anchorEl={buttonRefs.current.markup}
        isDarkMode={isDarkMode}
        onSelectMode={(mode) => {
          onMarkupModeSelect?.(mode);
          closePopover();
        }}
      />
      <DownloadPopover
        isOpen={openPopover === 'download'}
        onClose={closePopover}
        anchorEl={buttonRefs.current.download}
        isDarkMode={isDarkMode}
        onSelectFormat={(format) => {
          onExportFormatSelect?.(format);
          closePopover();
        }}
      />
    </>
  );
}
