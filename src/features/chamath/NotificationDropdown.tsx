import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '@/api/notificationsApi'

/**
 * NotificationDropdown
 * Compact header surface that previews latest notifications and supports
 * quick read/redirect actions.
 */
export function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'dropdown'],
    queryFn: () => notificationsApi.list({ limit: 10 }),
  })

  const items = notificationsQuery.data ?? []

  return (
    <div className="absolute right-0 top-11 z-30 w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-800">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <button
          type="button"
          className="text-xs text-blue-400 hover:underline"
          onClick={async () => {
            await notificationsApi.markAllRead()
            await queryClient.invalidateQueries({ queryKey: ['notifications'] })
            await queryClient.invalidateQueries({ queryKey: ['notification-count'] })
          }}
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-[420px] space-y-1 overflow-y-auto p-2">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            className={`w-full rounded-lg border px-3 py-2 text-left ${item.is_read ? 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900/60' : 'border-blue-300 bg-blue-50 hover:bg-blue-100/40 dark:border-blue-700 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'}`}
            onClick={async () => {
              await notificationsApi.markRead(item.id)
              await queryClient.invalidateQueries({ queryKey: ['notification-count'] })
              await queryClient.invalidateQueries({ queryKey: ['notifications'] })
              onClose()
              navigate(item.link)
            }}
          >
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
          </button>
        ))}
      </div>

      <div className="border-t border-slate-200 px-3 py-2 text-right dark:border-slate-800">
        <button
          type="button"
          className="text-xs text-blue-400 hover:underline"
          onClick={() => {
            onClose()
            navigate('/notifications')
          }}
        >
          View all
        </button>
      </div>
    </div>
  )
}

