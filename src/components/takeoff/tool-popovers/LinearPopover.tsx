/**
 * Linear tool popover with sub-mode selection
 */

import React from 'react';
import { Minus, BezierCurve, BarChart3 } from 'lucide-react';
import { ToolPopover, PopoverOption } from './ToolPopover';
import type { LinearMode } from '../../../types/measurements';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  isDarkMode: boolean;
  onSelectMode: (mode: LinearMode) => void;
};

export function LinearPopover({ isOpen, onClose, anchorEl, isDarkMode, onSelectMode }: Props) {
  function handleSelect(mode: LinearMode) {
    onSelectMode(mode);
    onClose();
  }

  return (
    <ToolPopover isOpen={isOpen} onClose={onClose} anchorEl={anchorEl} isDarkMode={isDarkMode} title="Linear">
      <PopoverOption
        onClick={() => handleSelect('line')}
        label="Line"
        icon={<Minus size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('curve')}
        label="Curve"
        icon={<BezierCurve size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('segment')}
        label="Segment"
        icon={<BarChart3 size={16} />}
        isDarkMode={isDarkMode}
      />
    </ToolPopover>
  );
}
