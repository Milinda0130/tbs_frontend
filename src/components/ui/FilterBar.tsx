import type { ReactNode } from 'react'

/**
 * FilterBar
 * Shared horizontal wrapper used to keep filter controls visually consistent
 * across report, user, audit, and notification surfaces.
 */
interface FilterBarProps {
  children: ReactNode
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-end gap-3">{children}</div>
    </div>
  )
}

