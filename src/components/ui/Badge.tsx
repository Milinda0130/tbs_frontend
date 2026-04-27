import React from 'react';
import { cn } from '@/lib/utils';

type BadgeColor = 'green' | 'red' | 'orange' | 'blue' | 'purple' | 'gray' | 'teal';
type BadgeSize = 'sm' | 'md';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

type LegacyBadgeProps = {
  text: string;
  color: BadgeColor;
  size?: BadgeSize;
  className?: string;
};

type VariantBadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
};

export type BadgeProps = LegacyBadgeProps | VariantBadgeProps;

const colorMap: Record<BadgeColor, string> = {
  green: 'bg-green-100 text-green-700 border border-green-300',
  red: 'bg-[#FFF0F0] text-red-600 border border-red-300',
  orange: 'bg-orange-50 text-orange-700 border border-orange-300',
  blue: 'bg-blue-50 text-blue-800 border border-blue-300',
  purple: 'bg-purple-100 text-purple-800 border border-purple-200',
  gray: 'bg-slate-100 text-slate-600 border border-slate-200',
  teal: 'bg-teal-50 text-teal-700 border border-teal-200',
};

const sizeMap: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-label-md',
  md: 'px-3 py-1 text-body-md',
};

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface_container text-on_surface_variant border-outline_variant',
  primary: 'bg-primary_container text-primary border-primary_container',
  secondary: 'bg-secondary_container text-secondary border-secondary_container',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-surface_container_highest text-on_surface border-outline_variant',
};

export const Badge: React.FC<BadgeProps> = (props) => {
  if ('text' in props) {
    const { text, color, size = 'sm', className } = props;
    return (
      <span className={cn('inline-flex items-center justify-center rounded-full font-medium', colorMap[color], sizeMap[size], className)}>
        {text}
      </span>
    );
  }

  const { children, variant = 'default', className, dot = false } = props;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-current'
          )}
        ></span>
      )}
      {children}
    </span>
  );
};
