import { AlertOctagon, AlertTriangle, Bell, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notificationsApi'
import { NotificationListItem } from '@/features/notifications/components/NotificationListItem'

/**
 * NotificationsPage
 * Full notification center with filtering and pagination.
 */
export function NotificationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const uiTab = searchParams.get('tab') ?? 'all'
  const tab = uiTab === 'approvals' ? 'approval' : uiTab
  const page = Number(searchParams.get('page') ?? '1')
  const limit = 10
  const notificationsQuery = useQuery({
    queryKey: ['notifications', uiTab, page],
    queryFn: () => notificationsApi.list({ tab, page, limit }),
  })
  const notifications = notificationsQuery.data ?? []

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-count'] })
    },
  })

  const typeMeta: Record<string, { label: string; icon: typeof Bell; className: string }> = {
    low_stock: { label: 'Low Stock', icon: AlertTriangle, className: 'text-red-400' },
    approval: { label: 'Approval', icon: Clock, className: 'text-orange-400' },
    decision: { label: 'Decision', icon: CheckCircle, className: 'text-emerald-400' },
    overdue: { label: 'Overdue', icon: AlertOctagon, className: 'text-rose-400' },
    system: { label: 'System', icon: Bell, className: 'text-blue-400' },
    all: { label: 'All', icon: Bell, className: 'text-slate-300' },
    unread: { label: 'Unread', icon: XCircle, className: 'text-slate-300' },
    approvals: { label: 'Approvals', icon: Clock, className: 'text-orange-400' },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => markAllRead.mutate()}>Mark All as Read</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {['all', 'unread', 'low_stock', 'approvals', 'overdue', 'system'].map(t => (
          <button key={t} type="button" className={`rounded-md px-3 py-1.5 text-sm capitalize ${uiTab === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'}`} onClick={() => setSearchParams({ tab: t, page: '1' })}>{typeMeta[t]?.label ?? t}</button>
        ))}
      </div>
      <div className="space-y-2">
        {notificationsQuery.isLoading ? <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading notifications...</div> : null}
        {!notificationsQuery.isLoading && notifications.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">No notifications available for this filter.</div> : null}
        {notifications.map(item => (
          <NotificationListItem
            key={item.id}
            item={item}
            icon={typeMeta[item.type]?.icon ?? Bell}
            iconClassName={typeMeta[item.type]?.className ?? 'text-slate-600'}
            onClick={async () => {
              await notificationsApi.markRead(item.id)
              navigate(item.link)
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" disabled={page <= 1} onClick={() => setSearchParams({ tab: uiTab, page: String(Math.max(1, page - 1)) })}>Previous</button>
        <span className="text-sm text-slate-500 dark:text-slate-400">Page {page}</span>
        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" disabled={notifications.length < limit} onClick={() => setSearchParams({ tab: uiTab, page: String(page + 1) })}>Next</button>
      </div>
    </div>
  )
}

