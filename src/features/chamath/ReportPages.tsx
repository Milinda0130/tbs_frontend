import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileSpreadsheet, FileText, ShieldCheck, Users } from 'lucide-react'
import { FilterBar } from '@/components/ui/FilterBar'
import { reportsApi, type ReportKey } from '@/api/reportsApi'
import { ReportPageLayout } from '@/features/chamath/ReportPageLayout'
import { downloadBlob } from '@/features/chamath/utils'
import { useState } from 'react'
import { useAuth } from '@/stores/AuthContext'

/**
 * ReportPages
 * Reports hub and all report page implementations.
 */
function ReportPage({ title, report }: { title: string; report: ReportKey }) {
  const [generated, setGenerated] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({
    month: '', year: '', store: '', department: '', item: '', dateFrom: '', dateTo: '',
  })
  const reportQuery = useQuery({
    queryKey: ['report', report, generated, filters],
    queryFn: () => reportsApi.generate(report, filters),
    enabled: generated,
  })
  const showMonthYear = report === 'monthly-stock-usage'
  const showItemSearch = report === 'stock-movements' || report === 'department-issuing'
  const showDateRange = report !== 'monthly-stock-usage'
  const rows = (reportQuery.data ?? []) as Record<string, unknown>[]
  const columns = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <ReportPageLayout
      title={title}
      onExportPdf={async () => downloadBlob(await reportsApi.export(report, 'pdf', filters), `${report}.pdf`)}
      onExportExcel={async () => downloadBlob(await reportsApi.export(report, 'excel', filters), `${report}.xlsx`)}
      filters={(
        <FilterBar>
          {showMonthYear ? (<><select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" value={filters.month} onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}><option value="">Month</option>{Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1}</option>)}</select><input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Year" value={filters.year} onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))} /></>) : null}
          <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Store" value={filters.store} onChange={e => setFilters(prev => ({ ...prev, store: e.target.value }))} />
          <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Department" value={filters.department} onChange={e => setFilters(prev => ({ ...prev, department: e.target.value }))} />
          {showItemSearch ? <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Item search" value={filters.item} onChange={e => setFilters(prev => ({ ...prev, item: e.target.value }))} /> : null}
          {showDateRange ? (<><input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" type="date" value={filters.dateFrom} onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))} /><input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" type="date" value={filters.dateTo} onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))} /></>) : null}
          <button type="button" className="rounded-md bg-blue-600 px-3 py-2 text-sm" onClick={() => setGenerated(true)}>Generate Report</button>
        </FilterBar>
      )}
      results={(
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {!generated ? <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Set filters and click <span className="font-medium text-slate-900 dark:text-slate-200">Generate Report</span> to load data.</div> : null}
          {generated && reportQuery.isLoading ? <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading report data...</div> : null}
          {generated && !reportQuery.isLoading && rows.length === 0 ? <div className="p-6 text-sm text-slate-500 dark:text-slate-400">No data found for selected filters.</div> : null}
          {generated && !reportQuery.isLoading && rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950/70 dark:text-slate-300"><tr>{columns.map(column => <th key={column} className="whitespace-nowrap px-4 py-3 text-left capitalize">{column.replace(/_/g, ' ')}</th>)}</tr></thead>
                <tbody>{rows.map((row, index) => <tr key={index} className="border-t border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60">{columns.map(column => <td key={`${index}-${column}`} className="whitespace-nowrap px-4 py-3 text-slate-800 dark:text-slate-200">{String(row[column] ?? '-')}</td>)}</tr>)}</tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    />
  )
}

export function ReportsHubPage() {
  const { user } = useAuth()
  const cards = [
    { to: '/reports/monthly-stock-usage', title: 'Monthly Stock Usage', icon: FileSpreadsheet, roles: ['Admin', 'Main Coordinator', 'Audit Officer', 'Dept Admin'] },
    { to: '/reports/stock-movements', title: 'Stock Movement', icon: FileText, roles: ['Admin', 'Main Coordinator', 'Audit Officer'] },
    { to: '/reports/borrowing', title: 'Borrowing', icon: ShieldCheck, roles: ['Admin', 'Main Coordinator', 'Audit Officer', 'Dept Admin'] },
    { to: '/reports/department-issuing', title: 'Department Issuing', icon: Users, roles: ['Admin', 'Main Coordinator', 'Audit Officer', 'Dept Admin'] },
  ]
  const visibleCards = cards.filter(card => {
    if (!user) return true
    return card.roles.includes(user.role)
  })
  return <div className="grid gap-4 md:grid-cols-2">{visibleCards.map(card => <div key={card.to} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><card.icon className="mb-3 text-blue-600 dark:text-blue-400" /><h3 className="font-semibold">{card.title}</h3><Link className="mt-3 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400" to={card.to}>Generate report</Link></div>)}</div>
}

export const MonthlyStockUsageReportPage = () => <ReportPage title="Monthly Stock Usage Report" report="monthly-stock-usage" />
export const StockMovementReportPage = () => <ReportPage title="Stock Movement Report" report="stock-movements" />
export const BorrowingReportPage = () => <ReportPage title="Borrowing Report" report="borrowing" />
export const DepartmentIssuingReportPage = () => <ReportPage title="Department Issuing Report" report="department-issuing" />

