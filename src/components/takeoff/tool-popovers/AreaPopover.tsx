/**
 * Area tool popover with sub-mode selection
 */

import React from 'react';
import { Square, PenTool, Circle } from 'lucide-react';
import { ToolPopover, PopoverOption } from './ToolPopover';
import type { AreaMode } from '../../../types/measurements';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  isDarkMode: boolean;
  onSelectMode: (mode: AreaMode) => void;
};

export function AreaPopover({ isOpen, onClose, anchorEl, isDarkMode, onSelectMode }: Props) {
  function handleSelect(mode: AreaMode) {
    onSelectMode(mode);
    onClose();
  }

  return (
    <ToolPopover isOpen={isOpen} onClose={onClose} anchorEl={anchorEl} isDarkMode={isDarkMode} title="Area">
      <PopoverOption
        onClick={() => handleSelect('twoPoints')}
        label="Two Points"
        icon={<Square size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('multiPoint')}
        label="Multi Point"
        icon={<PenTool size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('oval')}
        label="Oval"
        icon={<Circle size={16} />}
        isDarkMode={isDarkMode}
      />
    </ToolPopover>
  );
}
