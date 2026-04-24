import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'error' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all rounded-md disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary text-on_primary hover:bg-primary_container shadow-sm',
    secondary: 'bg-secondary_container text-secondary hover:bg-surface_container_highest border border-outline_variant',
    outline: 'bg-transparent border border-outline text-on_surface hover:bg-surface_container',
    ghost: 'bg-transparent text-on_surface_variant hover:bg-surface_container hover:text-on_surface',
    error: 'bg-error text-on_error hover:opacity-90',
    success: 'bg-success text-white hover:bg-success/90 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-3',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ElementType;
}

export const Input: React.FC<InputProps> = ({ label, error, icon: Icon, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="label-bold text-on_surface_variant mb-1.5 block">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />}
        <input
          className={cn(
            'w-full px-4 py-2 bg-surface_container_low border border-outline_variant rounded-md text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
            Icon && 'pl-10',
            error && 'border-error focus:border-error focus:ring-error/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
};
