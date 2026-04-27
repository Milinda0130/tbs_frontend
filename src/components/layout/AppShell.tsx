import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth, type UserRole } from '@/stores/AuthContext'
import { notificationsApi } from '@/api/notificationsApi'
import { NotificationDropdown } from '@/features/chamath/NotificationDropdown'
import { cn } from '@/lib/utils'

/**
 * AppShell — Main authenticated layout.
 * Sidebar (full nav, role-based, collapsible) + Top Header + <Outlet /> content.
 * All authenticated routes render inside this shell.
 */

/* ─── Navigation Config ───────────────────────────────────────────────────── */

interface NavItem {
  to: string
  label: string
  icon: string
  roles?: UserRole[]            // undefined = visible to all roles
  badgeKey?: 'lowStock' | 'pendingApprovals'
}

const navItems: NavItem[] = [
  { to: '/dashboard',          label: 'Dashboard',          icon: 'dashboard' },
  { to: '/inventory',          label: 'Inventory',          icon: 'inventory_2',       badgeKey: 'lowStock' },
  { to: '/borrow-requests',    label: 'Borrowing',          icon: 'handshake',         badgeKey: 'pendingApprovals' },
  { to: '/issue-items',        label: 'Issuing',            icon: 'outbound',          roles: ['Admin', 'Stock Keeper', 'Dept Admin'] },
  { to: '/suppliers',          label: 'Suppliers',          icon: 'local_shipping',    roles: ['Admin', 'Main Coordinator', 'Stock Keeper'] },
  { to: '/purchase-orders',    label: 'Purchase Orders',    icon: 'shopping_cart',      roles: ['Admin', 'Main Coordinator'] },
  { to: '/practical-sessions', label: 'Practical Sessions', icon: 'science',           roles: ['Admin', 'Faculty', 'Stock Keeper'] },
  { to: '/media-equipment',    label: 'Media Equipment',    icon: 'videocam',          roles: ['Admin', 'Stock Keeper'] },
  { to: '/waste-damage',       label: 'Waste & Damage',     icon: 'delete_outline',    roles: ['Admin', 'Stock Keeper', 'Audit Officer'] },
  { to: '/reports',            label: 'Reports',            icon: 'assessment',        roles: ['Admin', 'Audit Officer', 'Main Coordinator'] },
  { to: '/audit-logs',         label: 'Audit Logs',         icon: 'history_edu',       roles: ['Admin', 'Audit Officer'] },
  { to: '/users',              label: 'Users',              icon: 'group',             roles: ['Admin'] },
]

/* ─── Badge counts hook ───────────────────────────────────────────────────── */

function useSidebarBadges() {
  // Low stock count
  const lowStockQuery = useQuery({
    queryKey: ['sidebar-low-stock-count'],
    queryFn: async () => {
      // In demo mode or when API is unavailable, return mock count
      try {
        const { data } = await (await import('@/api/axiosInstance')).default.get<{ count: number }>('/inventory/low-stock-count')
        return data.count
      } catch {
        return 84 // demo fallback
      }
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  // Pending approvals count
  const pendingQuery = useQuery({
    queryKey: ['sidebar-pending-count'],
    queryFn: async () => {
      try {
        const { data } = await (await import('@/api/axiosInstance')).default.get<{ count: number }>('/borrowing/pending-count')
        return data.count
      } catch {
        return 27 // demo fallback
      }
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  return {
    lowStock: lowStockQuery.data ?? 0,
    pendingApprovals: pendingQuery.data ?? 0,
  }
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function AppShell() {
  const { user, logout, hasRole } = useAuth()
  const location = useLocation()
  const badges = useSidebarBadges()

  // Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  // Close sidebar on route change (mobile)
  useEffect(() => { closeSidebar() }, [location.pathname, closeSidebar])

  // Notification dropdown
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const notifCountQuery = useQuery({
    queryKey: ['notification-count'],
    queryFn: notificationsApi.count,
    staleTime: 10_000,
  })

  // User dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Dark mode
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const toggleDark = useCallback(() => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('tbs_theme', next ? 'dark' : 'light')
    setIsDark(next)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Filter nav items by role
  const visibleNav = navItems.filter(item => {
    if (!item.roles) return true
    return hasRole(item.roles)
  })

  const badgeCounts: Record<string, number> = {
    lowStock: badges.lowStock,
    pendingApprovals: badges.pendingApprovals,
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex">
      {/* ─── Mobile overlay ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ─── Sidebar ────────────────────────────────────────────────── */}
      <nav
        className={cn(
          'fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          'flex flex-col p-4 gap-2 overflow-y-auto z-50 transition-transform duration-300',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-extrabold text-sm tracking-tight shadow-sm">
            TBS
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">TBS IMS</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Campus Management</p>
          </div>
        </div>

        {/* Nav items */}
        <ul className="flex flex-col gap-1 w-full flex-1">
          {visibleNav.map(item => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            const badge = item.badgeKey ? badgeCounts[item.badgeKey] : 0

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 active:scale-[0.98] w-full border-l-4',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold border-blue-700 dark:border-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-transparent',
                  )}
                >
                  <span
                    className={cn('material-symbols-outlined text-[20px]', isActive && 'fill')}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && (
                    <span className={cn(
                      'min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center',
                      item.badgeKey === 'lowStock'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                    )}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>

        {/* Sidebar footer — version */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 px-2">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-wider font-semibold">
            TBS Campus IMS v1.0
          </p>
        </div>
      </nav>

      {/* ─── Main content area ──────────────────────────────────────── */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* ─── Top Header ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 md:px-8">
          {/* Left: hamburger (mobile) + branding */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <span className="text-lg font-bold tracking-tight text-primary hidden md:block">
              TBS Campus IMS
            </span>
          </div>

          {/* Center: search bar */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search by SKU, Building, or Category"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              onClick={toggleDark}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Notification bell */}
            <div ref={notifRef} className="relative">
              <button
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                onClick={() => setNotifOpen(prev => !prev)}
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {(notifCountQuery.data?.unread ?? 0) > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </button>
              {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button
                className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                onClick={() => setUserMenuOpen(prev => !prev)}
              >
                <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-slate-700">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {user?.name ?? 'User'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    {user?.role ?? 'Guest'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px] hidden sm:block">
                  expand_more
                </span>
              </button>

              {/* User dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Profile
                  </Link>
                  <button
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                    onClick={() => { setUserMenuOpen(false); logout() }}
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── Page content ───────────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-6 max-w-[1440px] mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
