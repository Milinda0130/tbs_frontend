import { Fragment, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ExportButton } from '@/components/ui/ExportButton'
import { FilterBar } from '@/components/ui/FilterBar'
import { auditApi } from '@/api/auditApi'
import { diffJson, downloadBlob } from '@/features/chamath/utils'

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
      <FilterBar>
        <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="User" value={searchParams.get('user') ?? ''} onChange={e => setFilter('user', e.target.value)} />
        <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Action" value={searchParams.get('action') ?? ''} onChange={e => setFilter('action', e.target.value)} />
        <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Module" value={searchParams.get('module') ?? ''} onChange={e => setFilter('module', e.target.value)} />
        <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="IP Address" value={searchParams.get('ip') ?? ''} onChange={e => setFilter('ip', e.target.value)} />
        <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" type="date" value={searchParams.get('dateFrom') ?? ''} onChange={e => setFilter('dateFrom', e.target.value)} />
        <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" type="date" value={searchParams.get('dateTo') ?? ''} onChange={e => setFilter('dateTo', e.target.value)} />
      </FilterBar>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950/70 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Timestamp</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Action</th>
              <th className="px-3 py-2 text-left">Module</th>
              <th className="px-3 py-2 text-left">IP</th>
              <th className="px-3 py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <Fragment key={log.id}>
                <tr className="border-t border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60">
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{log.created_at}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{log.user_name}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{log.action}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{log.module}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{log.ip_address}</td>
                  <td className="px-3 py-2">
                    <button type="button" className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => setExpandedId(prev => (prev === log.id ? null : log.id))}>
                      {expandedId === log.id ? 'Hide' : 'Expand'}
                    </button>
                  </td>
                </tr>
                {expandedId === log.id ? (
                  <tr className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
                    <td colSpan={6} className="p-3">
                      <div className="mb-2 flex flex-wrap gap-2">
                        {diffJson(log.before_values, log.after_values).map(key => (
                          <span key={key} className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">{key}</span>
                        ))}
                      </div>
                      <pre className="overflow-auto rounded-md bg-white p-3 text-xs text-slate-800 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-800">{JSON.stringify({ before: log.before_values, after: log.after_values }, null, 2)}</pre>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" disabled={page <= 1} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(Math.max(1, page - 1)) })}>Previous</button>
        <span className="text-sm text-slate-500 dark:text-slate-400">Page {page}</span>
        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" disabled={logs.length < 50} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page + 1) })}>Next</button>
      </div>
    </div>
  )
}

