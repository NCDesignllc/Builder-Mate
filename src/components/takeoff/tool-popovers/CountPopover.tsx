/**
 * Count tool popover with sub-mode selection
 */

import React from 'react';
import { MapPin, PenTool, Minus } from 'lucide-react';
import { ToolPopover, PopoverOption } from './ToolPopover';
import type { CountMode } from '../../../types/measurements';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  isDarkMode: boolean;
  onSelectMode: (mode: CountMode) => void;
};

export function CountPopover({ isOpen, onClose, anchorEl, isDarkMode, onSelectMode }: Props) {
  function handleSelect(mode: CountMode) {
    onSelectMode(mode);
    onClose();
  }

  return (
    <ToolPopover isOpen={isOpen} onClose={onClose} anchorEl={anchorEl} isDarkMode={isDarkMode} title="Count">
      <PopoverOption
        onClick={() => handleSelect('twoPoints')}
        label="Two Points"
        icon={<MapPin size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('multiPoint')}
        label="Multi Point"
        icon={<PenTool size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('line')}
        label="Line"
        icon={<Minus size={16} />}
        isDarkMode={isDarkMode}
      />
    </ToolPopover>
  );
}
