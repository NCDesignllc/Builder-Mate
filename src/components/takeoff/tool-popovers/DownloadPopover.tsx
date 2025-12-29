/**
 * Download/Export tool popover
 */

import React from 'react';
import { FileText, Table, Image } from 'lucide-react';
import { ToolPopover, PopoverOption } from './ToolPopover';
import type { ExportFormat } from '../../../types/measurements';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  isDarkMode: boolean;
  onSelectFormat: (format: ExportFormat) => void;
};

export function DownloadPopover({ isOpen, onClose, anchorEl, isDarkMode, onSelectFormat }: Props) {
  function handleSelect(format: ExportFormat) {
    onSelectFormat(format);
    onClose();
  }

  return (
    <ToolPopover isOpen={isOpen} onClose={onClose} anchorEl={anchorEl} isDarkMode={isDarkMode} title="Export">
      <PopoverOption
        onClick={() => handleSelect('annotatedPdf')}
        label="Annotated PDF"
        icon={<FileText size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('csv')}
        label="CSV"
        icon={<Table size={16} />}
        isDarkMode={isDarkMode}
      />
      <PopoverOption
        onClick={() => handleSelect('image')}
        label="Image Snapshot"
        icon={<Image size={16} />}
        isDarkMode={isDarkMode}
      />
    </ToolPopover>
  );
}
