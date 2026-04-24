import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-xl bg-surface_container_low border border-dashed border-outline_variant rounded-xl',
        className
      )}
    >
      <div className="bg-surface_container_highest p-4 rounded-full mb-md">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h2 className="mb-xs text-on_surface">{title}</h2>
      <p className="text-on_surface_variant max-w-sm mb-lg">{message}</p>
      {action && <div>{action}</div>}
    </div>

  );
};
