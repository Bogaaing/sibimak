import React from 'react';
import { clsx } from 'clsx';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className }) => {
  const getInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  return (
    <div
      className={clsx(
        'rounded-lg bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center flex-shrink-0 select-none shadow-2xs',
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};
