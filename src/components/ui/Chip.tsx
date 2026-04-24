import React from 'react';
import { cn } from '../../lib/utils';

type ChipVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  className?: string;
}

const variants: Record<ChipVariant, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-primary_container text-primary border-primary_container',
  neutral: 'bg-surface_container_high text-on_surface_variant border-outline_variant',
};


export const Chip: React.FC<ChipProps> = ({ label, variant = 'neutral', className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}
    >
      {label}
    </span>
  );
};
