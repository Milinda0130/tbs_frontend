import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Select — Dropdown select component.
 * Usage: <Select label="Store" options={[{value:'1',label:'Main'}]} value={v} onChange={setV} />
 *
 * Props:
 *  - label (string) — field label above the select
 *  - options ({value:string, label:string}[]) — dropdown options
 *  - value (string) — controlled value
 *  - onChange (string => void) — change handler
 *  - error (string) — validation error message
 *  - required (bool) — shows required indicator
 *  - placeholder (string) — default empty option text
 *  - className (string) — additional wrapper classes
 *  - icon (React.ElementType) — optional leading icon
 */

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  className?: string
  icon?: React.ElementType
  disabled?: boolean
  id?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  required,
  placeholder = 'Select an option',
  className,
  icon: Icon,
  disabled,
  id,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="label-bold text-on_surface_variant mb-1.5 block"
        >
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
        )}
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={e => onChange?.(e.target.value)}
          className={cn(
            'w-full px-4 py-2 bg-surface_container_low border border-outline_variant rounded-md text-sm transition-all',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
            'appearance-none cursor-pointer',
            Icon && 'pl-10',
            error && 'border-error focus:border-error focus:ring-error/20',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Dropdown arrow */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  )
}
