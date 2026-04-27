import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '@/api/notificationsApi'
import { NotificationDropdownItem } from '@/features/notifications/components/NotificationDropdownItem'

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
          <NotificationDropdownItem
            key={item.id}
            onClick={async () => {
              await notificationsApi.markRead(item.id)
              await queryClient.invalidateQueries({ queryKey: ['notification-count'] })
              await queryClient.invalidateQueries({ queryKey: ['notifications'] })
              onClose()
              navigate(item.link)
            }}
            item={item}
          />
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

