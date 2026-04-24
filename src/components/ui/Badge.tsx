import React from 'react';

type BadgeColor = 'green' | 'red' | 'orange' | 'blue' | 'purple' | 'gray' | 'teal';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  text: string;
  color: BadgeColor;
  size?: BadgeSize;
}

const colorMap: Record<BadgeColor, string> = {
  green:  'bg-green-100 text-green-700 border border-green-300',
  red:    'bg-[#FFF0F0] text-red-600 border border-red-300',
  orange: 'bg-orange-50 text-orange-700 border border-orange-300',
  blue:   'bg-blue-50 text-blue-800 border border-blue-300',
  purple: 'bg-purple-100 text-purple-800',
  gray:   'bg-slate-100 text-slate-600',
  teal:   'bg-teal-50 text-teal-700',
};

const sizeMap: Record<BadgeSize, string> = { 
  sm: 'px-2 py-0.5 text-label-md', 
  md: 'px-3 py-1 text-body-md' 
};

export const Badge: React.FC<BadgeProps> = ({ text, color, size = 'sm' }) => {
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium ${colorMap[color]} ${sizeMap[size]}`}>
      {text}
    </span>
  );
};
