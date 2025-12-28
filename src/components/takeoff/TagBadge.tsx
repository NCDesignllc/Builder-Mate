import React from 'react';
import { Tag } from 'lucide-react';
import { colorForTag } from './colors';

type Props = {
  tag?: string | null;
  className?: string;
  compact?: boolean;
};

export function TagBadge({ tag, className = '', compact = false }: Props) {
  if (!tag) return null;
  const c = colorForTag(tag);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 ${compact ? 'py-0.5 text-[10px]' : 'py-1 text-xs'} font-bold ${c} ${className}`}
      title={`Tag: ${tag}`}
    >
      <Tag size={12} />
      <span className="truncate max-w-[120px]">{tag}</span>
    </span>
  );
}
