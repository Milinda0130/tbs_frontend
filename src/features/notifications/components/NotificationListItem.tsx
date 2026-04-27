import { Bell } from 'lucide-react'
import type { NotificationDto } from '@/api/notificationsApi'
import { toRelativeTime } from '@/features/notifications/utils'

interface NotificationListItemProps {
  item: NotificationDto
  icon: typeof Bell
  iconClassName: string
  onClick: () => Promise<void> | void
}

export function NotificationListItem({
  item,
  icon: Icon,
  iconClassName,
  onClick,
}: NotificationListItemProps) {
  return (
    <button
      type="button"
      className={`w-full rounded-lg border p-4 text-left ${item.is_read ? 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-900/60' : 'border-blue-300 bg-blue-50 hover:bg-blue-100/40 dark:border-blue-700 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-md bg-slate-100 p-1.5 ${iconClassName} dark:bg-slate-950/80 dark:text-slate-300`}>
            <Icon size={14} />
          </span>
          <h3 className="font-medium">{item.title}</h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{toRelativeTime(item.created_at)}</span>
      </div>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{item.description}</p>
    </button>
  )
}
