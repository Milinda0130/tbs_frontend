import type { NotificationDto } from '@/api/notificationsApi'

interface NotificationDropdownItemProps {
  item: NotificationDto
  onClick: () => Promise<void> | void
}

export function NotificationDropdownItem({ item, onClick }: NotificationDropdownItemProps) {
  return (
    <button
      type="button"
      className={`w-full rounded-lg border px-3 py-2 text-left ${item.is_read ? 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900/60' : 'border-blue-300 bg-blue-50 hover:bg-blue-100/40 dark:border-blue-700 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'}`}
      onClick={onClick}
    >
      <p className="text-sm font-medium">{item.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
    </button>
  )
}
