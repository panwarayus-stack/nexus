import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className = '', size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <span
      title="Verified Official System Account"
      className={`inline-flex items-center justify-center text-sky-400 shrink-0 ${className}`}
    >
      <BadgeCheck className={`${sizeClasses} fill-sky-500/20 text-sky-400`} />
    </span>
  );
};
