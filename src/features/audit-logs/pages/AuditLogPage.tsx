import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ExportButton } from '@/components/ui/ExportButton'
import { auditApi } from '@/api/auditApi'
import { downloadBlob } from '@/features/audit-logs/utils'
import { AuditLogFilters } from '@/features/audit-logs/components/AuditLogFilters'
import { AuditLogTable } from '@/features/audit-logs/components/AuditLogTable'

/**
 * AuditLogPage
 * Read-only audit trail page with expandable before/after payloads.
 */
export function AuditLogPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.set('page', '1')
    setSearchParams(next)
  }
  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams])
  const logsQuery = useQuery({ queryKey: ['audit-logs', params], queryFn: () => auditApi.list(params) })
  const logs = logsQuery.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Audit Logs</h1>
        <ExportButton onExportPdf={async () => downloadBlob(await auditApi.export('pdf', params), 'audit-logs.pdf')} onExportExcel={async () => downloadBlob(await auditApi.export('excel', params), 'audit-logs.xlsx')} />
      </div>
      <AuditLogFilters searchParams={searchParams} setFilter={setFilter} />
      <AuditLogTable logs={logs} expandedId={expandedId} setExpandedId={setExpandedId} />
      <div className="flex items-center justify-end gap-2">
        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" disabled={page <= 1} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(Math.max(1, page - 1)) })}>Previous</button>
        <span className="text-sm text-slate-500 dark:text-slate-400">Page {page}</span>
        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" disabled={logs.length < 50} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page + 1) })}>Next</button>
      </div>
    </div>
  )
}

