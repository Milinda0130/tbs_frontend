import React from 'react';

export interface SkeletonProps {
  lines?: number;
  height?: string;
  width?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  lines = 5, 
  height = '20px', 
  width = '100%' 
}) => {
  return (
    <div className="flex flex-col space-y-2 w-full animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="bg-slate-200 rounded" 
          style={{ height, width }} 
        />
      ))}
    </div>
  );
};
