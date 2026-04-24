import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  actions,
  className,
  headerClassName,
  bodyClassName,
}) => {
  return (
    <div className={cn('card-container flex flex-col', className)}>
      {(title || actions) && (
        <div
          className={cn(
            'px-sm py-4 border-b border-outline_variant flex items-center justify-between bg-surface_container_lowest',
            headerClassName
          )}
        >
          {title && <h3 className="text-on_surface">{title}</h3>}
          {actions && <div className="flex items-center gap-sm">{actions}</div>}
        </div>

      )}
      <div className={cn('p-sm flex-1', bodyClassName)}>{children}</div>
    </div>
  );
};
