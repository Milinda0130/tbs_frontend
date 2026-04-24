import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div className={cn('mb-lg flex flex-col gap-sm sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1 text-on_surface_variant mb-1">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <ChevronRight className="w-4 h-4 text-outline" />}
                <Link
                  to={crumb.href}
                  className={cn(
                    'label-md hover:text-primary transition-colors',
                    index === breadcrumbs.length - 1 ? 'text-on_surface font-semibold' : 'text-outline'
                  )}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-on_surface">{title}</h1>

        {subtitle && <p className="text-on_surface_variant max-w-2xl">{subtitle}</p>}

      </div>
      {actions && <div className="flex items-center gap-sm">{actions}</div>}
    </div>
  );
};
