import { useState } from 'react'
import { Bell, Moon, Sun } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notificationsApi'
import { NotificationDropdown } from '@/features/notifications/components/NotificationDropdown'

/**
 * AppShell
 * Base authenticated layout for Chamath-owned reporting and administration pages.
 */
const navItems = [
  { to: '/users', label: 'Users' },
  { to: '/reports', label: 'Reports' },
  { to: '/audit-logs', label: 'Audit Logs' },
  { to: '/notifications', label: 'Notifications' },
]

export function AppShell() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const countQuery = useQuery({
    queryKey: ['notification-count'],
    queryFn: notificationsApi.count,
    staleTime: 10000,
  })

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-6 text-lg font-semibold">TBS Campus IMS</h1>
          <nav className="space-y-2">
            {navItems.map(item => (
              <Link key={item.to} to={item.to} className="block rounded-md px-3 py-2 text-sm hover:bg-slate-200 dark:hover:bg-slate-800">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div>
          <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="text-sm text-slate-500 dark:text-slate-400">Reporting Module</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                onClick={() => {
                  const next = !document.documentElement.classList.contains('dark')
                  document.documentElement.classList.toggle('dark', next)
                  localStorage.setItem('tbs_theme', next ? 'dark' : 'light')
                  setIsDark(next)
                }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                {isDark ? 'Light' : 'Dark'}
              </button>
              <button
                type="button"
                className="relative inline-flex rounded-md border border-slate-200 bg-white p-2 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                <Bell size={18} />
                <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                  {countQuery.data?.unread ?? 0}
                </span>
                {dropdownOpen ? <NotificationDropdown onClose={() => setDropdownOpen(false)} /> : null}
              </button>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

