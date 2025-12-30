import React from 'react';
import { User as UserIcon } from 'lucide-react';
import type { User } from '../../lib/types';

type Props = {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
};

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
};

export function ProfileBubble({ user, size = 'md', onClick, className = '' }: Props) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClass = sizeMap[size];

  const content = user.profilePhotoUrl ? (
    <img 
      src={user.profilePhotoUrl} 
      alt={user.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="flex items-center justify-center h-full w-full">
      {initials || <UserIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 24} />}
    </div>
  );

  const baseClassName = `${sizeClass} rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold flex items-center justify-center shrink-0 overflow-hidden transition-all ${className}`;

  // Only render as button if onClick is provided to avoid nested button issues
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClassName} hover:ring-2 hover:ring-orange-400 hover:ring-offset-2`}
        title={`${user.name} (${user.role})`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={baseClassName}
      title={`${user.name} (${user.role})`}
    >
      {content}
    </div>
  );
}
