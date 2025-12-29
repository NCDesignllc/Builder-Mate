/**
 * Markup tool popover with sub-mode selection
 */

import React from 'react';
import { Type, Pen, Ruler, List } from 'lucide-react';
import { ToolPopover, PopoverOption } from './ToolPopover';
import type { MarkupType } from '../../../types/measurements';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  isDarkMode: boolean;
  onSelectMode: (mode: MarkupType) => void;
};

export function MarkupPopover({ isOpen, onClose, anchorEl, isDarkMode, onSelectMode }: Props) {
  function handleSelect(mode: MarkupType) {
    onSelectMode(mode);
    onClose();
  }

  return (
    <ToolPopover isOpen={isOpen} onClose={onClose} anchorEl={anchorEl} isDarkMode={isDarkMode} title="Markup">
      <PopoverOption
        onClick={() => handleSelect('text')}
        label="Text"
        icon={<Type size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('draw')}
        label="Draw"
        icon={<Pen size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('ruler')}
        label="Ruler"
        icon={<Ruler size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('legend')}
        label="Legend"
        icon={<List size={16} />}
        isDarkMode={isDarkMode}
      />
    </ToolPopover>
  );
}
