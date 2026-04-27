import { Fragment } from 'react'
import type { AuditLogEntry } from '@/api/auditApi'
import { diffJson } from '@/features/audit-logs/utils'

interface AuditLogTableProps {
  logs: AuditLogEntry[]
  expandedId: number | null
  setExpandedId: (value: number | null | ((prev: number | null) => number | null)) => void
}

export function AuditLogTable({ logs, expandedId, setExpandedId }: AuditLogTableProps) {
  return (
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
  )
}
