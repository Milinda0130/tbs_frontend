import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { dashboardApi } from '@/api/dashboardApi'
import { useChannel } from '@/hooks/useChannel'
import { queryClient } from '@/stores/queryClient'
import { cn } from '@/lib/utils'

/**
 * DashboardPage — /dashboard (Page 6)
 * Main landing page after login. Renders inside AppShell.
 * Sections: Metric cards, Store overview, Low stock table, Pending approvals, Recent movements.
 */

/* ─── Movement type badge config ───────────────────────────────────────────── */

const movementColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  stock_in:  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Stock In' },
  stock_out: { bg: 'bg-red-50',    text: 'text-red-700',   border: 'border-red-200',   label: 'Stock Out' },
  transfer:  { bg: 'bg-blue-100',  text: 'text-blue-800',  border: 'border-blue-200',  label: 'Transfer' },
  issue:     { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', label: 'Issued' },
  return:    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', label: 'Return' },
}

export default function DashboardPage() {
  /* ─── Queries ──────────────────────────────────────────────────── */
  const summaryQ = useQuery({ queryKey: ['dashboard-summary'],   queryFn: dashboardApi.getSummary })
  const storesQ  = useQuery({ queryKey: ['dashboard-stores'],    queryFn: dashboardApi.getStores })
  const lowQ     = useQuery({ queryKey: ['low-stock'],           queryFn: dashboardApi.getLowStock })
  const pendingQ = useQuery({ queryKey: ['pending-approvals'],   queryFn: dashboardApi.getPendingApprovals })
  const movesQ   = useQuery({ queryKey: ['recent-movements'],    queryFn: dashboardApi.getRecentMovements })

  /* ─── WebSocket: invalidate on real-time stock events ──────────── */
  useChannel('stock', 'StockUpdated', () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    queryClient.invalidateQueries({ queryKey: ['low-stock'] })
    queryClient.invalidateQueries({ queryKey: ['recent-movements'] })
  })

  const summary = summaryQ.data
  const isLoading = summaryQ.isLoading

  /* ─── Metric cards config ──────────────────────────────────────── */
  const metrics = [
    { label: 'Total Items',       value: summary?.totalItems,       icon: 'inventory',       iconBg: 'bg-[var(--primary-fixed)]', iconColor: 'text-[var(--primary)]' },
    { label: 'Low Stock Items',   value: summary?.lowStockItems,    icon: 'warning',         iconBg: 'bg-[var(--error-container)]', iconColor: 'text-[var(--error)]' },
    { label: 'Total Stores',      value: summary?.totalStores,      icon: 'storefront',      iconBg: 'bg-[var(--primary-fixed)]', iconColor: 'text-[var(--primary)]' },
    { label: 'Pending Approvals', value: summary?.pendingApprovals, icon: 'pending_actions', iconBg: 'bg-[var(--tertiary-fixed)]', iconColor: 'text-[var(--tertiary)]' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-background)] tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-[var(--secondary)] mt-1">Campus-wide inventory status and recent activities.</p>
        </div>
        <button className="bg-[var(--primary)] text-[var(--on-primary)] font-semibold text-xs px-6 py-2.5 rounded-sm hover:bg-[var(--primary-container)] transition-colors shadow-sm flex items-center gap-2 active:scale-[0.98]">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Quick Action
        </button>
      </div>

      {/* ─── Metric cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[var(--surface-container-lowest)] rounded-sm border border-[var(--outline-variant)] p-6 shadow-sm flex flex-col gap-4">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', m.iconBg)}>
              <span className={cn('material-symbols-outlined', m.iconColor)}>{m.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]">{m.label}</p>
              {isLoading ? (
                <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-1" />
              ) : (
                <h3 className="text-3xl font-bold text-[var(--on-surface)] mt-1">
                  {m.value?.toLocaleString() ?? '—'}
                </h3>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Store Locations Overview ────────────────────────────── */}
      <h3 className="text-xl font-semibold text-[var(--on-surface)]">Store Locations Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {storesQ.isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[var(--surface-container-lowest)] rounded-sm border border-[var(--outline-variant)] p-6 shadow-sm animate-pulse">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))
          : storesQ.data?.map(store => (
              <div key={store.id} className="bg-[var(--surface-container-lowest)] rounded-sm border border-[var(--outline-variant)] p-6 shadow-sm flex flex-col">
                <h4 className="text-lg font-semibold text-[var(--on-surface)] mb-1">{store.name}</h4>
                <p className="text-sm text-[var(--secondary)] mb-6">{store.department}</p>
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-[var(--surface-variant)]">
                  <div>
                    <p className="text-xs font-semibold text-[var(--secondary)] mb-1">
                      Items: <span className="text-[var(--on-surface)] font-bold">{store.itemCount.toLocaleString()}</span>
                    </p>
                    <p className="text-xs font-semibold text-[var(--error)]">Low Stock: {store.lowStockCount}</p>
                  </div>
                  <Link to={`/inventory?store=${store.id}`} className="text-[var(--primary)] text-xs font-semibold hover:underline">
                    View Store
                  </Link>
                </div>
              </div>
            ))
        }
      </div>

      {/* ─── Two-column: Low Stock + Pending Approvals ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts (2/3 width) */}
        <div className="lg:col-span-2 bg-[var(--surface-container-lowest)] rounded-sm border border-[var(--outline-variant)] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[var(--surface-variant)] bg-[var(--surface)] flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[var(--on-surface)]">Low Stock Alerts</h3>
            <Link to="/inventory/low-stock" className="text-[var(--primary)] text-xs font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--surface-container-low)] text-[11px] font-bold uppercase tracking-wider text-[var(--secondary)] border-b border-[var(--surface-variant)]">
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Store</th>
                  <th className="px-6 py-3 text-right">Current Qty</th>
                  <th className="px-6 py-3 text-right">Min Qty</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[var(--on-surface)] divide-y divide-[var(--surface-variant)]">
                {lowQ.isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /></td>
                      <td className="px-6 py-3"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /></td>
                      <td className="px-6 py-3"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded ml-auto" /></td>
                      <td className="px-6 py-3"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded ml-auto" /></td>
                      <td className="px-6 py-3"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mx-auto" /></td>
                    </tr>
                  ))
                ) : lowQ.data?.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-container-low)] transition-colors">
                    <td className="px-6 py-3 font-semibold">{item.name}</td>
                    <td className="px-6 py-3 text-[var(--secondary)]">{item.store}</td>
                    <td className="px-6 py-3 text-right text-[var(--error)] font-semibold">{item.currentQty}</td>
                    <td className="px-6 py-3 text-right text-[var(--secondary)]">{item.minQty}</td>
                    <td className="px-6 py-3 text-center">
                      <button className="text-[var(--primary)] text-xs font-semibold border border-[var(--primary)] px-2 py-1 rounded-sm hover:bg-[var(--primary)] hover:text-white transition-colors">
                        Stock In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals (1/3 width) */}
        <div className="bg-[var(--surface-container-lowest)] rounded-sm border border-[var(--outline-variant)] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[var(--surface-variant)] bg-[var(--surface)] flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[var(--on-surface)]">Pending Approvals</h3>
            <span className="bg-[var(--tertiary-fixed)] text-[var(--tertiary)] font-bold px-2 py-0.5 rounded-full text-[10px]">
              {summary?.pendingApprovals ?? 0}
            </span>
          </div>
          <ul className="divide-y divide-[var(--surface-variant)] overflow-y-auto max-h-[300px]">
            {pendingQ.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="px-6 py-4">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mb-2" />
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                </li>
              ))
            ) : pendingQ.data?.map(req => (
              <li key={req.id} className="px-6 py-4 hover:bg-[var(--surface-container-low)] transition-colors flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-[var(--on-surface)]">{req.department}</p>
                  <p className="text-xs text-[var(--secondary)]">Request: {req.itemCount} items</p>
                  <p className="text-[11px] text-[var(--outline)] mt-1">{req.timeAgo}</p>
                </div>
                <Link to={`/borrow-requests/${req.id}`} className="text-[var(--primary)] text-xs font-semibold hover:underline">
                  Review
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Recent Stock Movements ──────────────────────────────── */}
      <div className="bg-[var(--surface-container-lowest)] rounded-sm border border-[var(--outline-variant)] shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-[var(--surface-variant)] bg-[var(--surface)] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[var(--on-surface)]">Recent Stock Movements</h3>
          <Link to="/inventory" className="text-[var(--primary)] text-xs font-semibold hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-container-low)] text-[11px] font-bold uppercase tracking-wider text-[var(--secondary)] border-b border-[var(--surface-variant)]">
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Store</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Qty</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[var(--on-surface)] divide-y divide-[var(--surface-variant)]">
              {movesQ.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-3"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : movesQ.data?.map(m => {
                const col = movementColors[m.type] ?? movementColors.stock_in
                return (
                  <tr key={m.id} className="hover:bg-[var(--surface-container-low)] transition-colors">
                    <td className="px-6 py-3 font-medium">{m.item}</td>
                    <td className="px-6 py-3 text-[var(--secondary)]">{m.store}</td>
                    <td className="px-6 py-3">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border', col.bg, col.text, col.border)}>
                        {col.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium">
                      {m.qty > 0 ? `+${m.qty}` : m.qty}
                    </td>
                    <td className="px-6 py-3 text-[var(--secondary)]">{m.user}</td>
                    <td className="px-6 py-3 text-right text-[var(--outline)] text-xs">{m.timestamp}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
