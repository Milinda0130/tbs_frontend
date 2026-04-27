import { FilterBar } from '@/components/ui/FilterBar'

interface AuditLogFiltersProps {
  searchParams: URLSearchParams
  setFilter: (key: string, value: string) => void
}

export function AuditLogFilters({ searchParams, setFilter }: AuditLogFiltersProps) {
  return (
    <FilterBar>
      <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="User" value={searchParams.get('user') ?? ''} onChange={e => setFilter('user', e.target.value)} />
      <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Action" value={searchParams.get('action') ?? ''} onChange={e => setFilter('action', e.target.value)} />
      <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Module" value={searchParams.get('module') ?? ''} onChange={e => setFilter('module', e.target.value)} />
      <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="IP Address" value={searchParams.get('ip') ?? ''} onChange={e => setFilter('ip', e.target.value)} />
      <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" type="date" value={searchParams.get('dateFrom') ?? ''} onChange={e => setFilter('dateFrom', e.target.value)} />
      <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" type="date" value={searchParams.get('dateTo') ?? ''} onChange={e => setFilter('dateTo', e.target.value)} />
    </FilterBar>
  )
}
