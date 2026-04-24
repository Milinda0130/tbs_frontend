import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, Pencil, ShieldCheck, User as UserIcon } from 'lucide-react'
import { FilterBar } from '@/components/ui/FilterBar'
import { auditApi } from '@/api/auditApi'
import { usersApi } from '@/api/usersApi'
import { toRelativeTime } from '@/features/chamath/utils'

/**
 * UserPages
 * User management pages and drawer form for Chamath scope.
 */
export function UserListPage() {
  const [openForm, setOpenForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const search = searchParams.get('search') ?? ''
  const role = searchParams.get('role') ?? ''
  const department = searchParams.get('department') ?? ''
  const status = searchParams.get('status') ?? ''
  const setFilter = (key: 'search' | 'role' | 'department' | 'status', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const usersQuery = useQuery({
    queryKey: ['users', search, role, department, status],
    queryFn: () => usersApi.list({ search, role, department, status }),
  })

  const toggleStatus = useMutation({
    mutationFn: (id: number) => usersApi.toggleStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const users = usersQuery.data ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
          onClick={() => {
            setEditingUserId(null)
            setOpenForm(true)
          }}
        >
          Add User
        </button>
      </div>

      <FilterBar>
        <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Search users" value={search} onChange={e => setFilter('search', e.target.value)} />
        <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" value={role} onChange={e => setFilter('role', e.target.value)}>
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Main Coordinator">Main Coordinator</option>
          <option value="Audit Officer">Audit Officer</option>
          <option value="Stock Keeper">Stock Keeper</option>
          <option value="Dept Admin">Dept Admin</option>
          <option value="Faculty">Faculty</option>
        </select>
        <input className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Department" value={department} onChange={e => setFilter('department', e.target.value)} />
        <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" value={status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </FilterBar>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950/70 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Department</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900">
                <td className="px-4 py-3"><Link to={`/users/${user.id}`} className="text-blue-600 hover:underline dark:text-blue-400">{user.name}</Link><div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div></td>
                <td className="px-4 py-3">{user.role}</td><td className="px-4 py-3">{user.department ?? '-'}</td><td className="px-4 py-3">{user.status}</td>
                <td className="px-4 py-3 text-right"><div className="inline-flex gap-2"><button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => { setEditingUserId(user.id); setOpenForm(true) }}>Edit</button><button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => toggleStatus.mutate(user.id)}>{user.status === 'active' ? 'Deactivate' : 'Activate'}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openForm ? <UserFormDrawer userId={editingUserId} onClose={() => setOpenForm(false)} /> : null}
    </div>
  )
}

function UserFormDrawer({ userId, onClose }: { userId: number | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const userQuery = useQuery({ queryKey: ['user', userId], queryFn: () => usersApi.getById(String(userId)), enabled: !!userId })
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Admin', department: '', status: 'active' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const current = userQuery.data
  useEffect(() => {
    if (!current) return
    setForm(prev => ({ ...prev, name: current.name ?? '', email: current.email ?? '', role: current.role ?? 'Admin', department: current.department ?? '', status: current.status ?? 'active' }))
  }, [current])

  const saveUser = useMutation({
    mutationFn: async () => {
      setFieldErrors({})
      const payload: Record<string, unknown> = { name: form.name, email: form.email, role: form.role, department: form.department || null, status: form.status }
      if (!userId) payload.password = form.password
      if (userId) await usersApi.update(userId, payload)
      else await usersApi.create(payload)
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); onClose() },
    onError: (error: unknown) => {
      const e = error as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } }
      if (e.response?.status === 422 && e.response.data?.errors) {
        setFieldErrors(Object.fromEntries(Object.entries(e.response.data.errors).map(([k, v]) => [k, v[0]])))
      }
    },
  })

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end bg-slate-900/30 backdrop-blur-sm dark:bg-slate-950/80">
      <div className="h-screen w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white px-5 pb-5 pt-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">{userId ? 'Edit User' : 'Create User'}</h2>
        <div className="mt-4 space-y-3">
          <input className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
          {fieldErrors.name ? <p className="text-xs text-red-400">{fieldErrors.name}</p> : null}
          <input className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
          {fieldErrors.email ? <p className="text-xs text-red-400">{fieldErrors.email}</p> : null}
          <select className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}><option>Admin</option><option>Main Coordinator</option><option>Audit Officer</option><option>Stock Keeper</option><option>Dept Admin</option><option>Faculty</option></select>
          {form.role.includes('Dept') || form.role === 'Faculty' ? <input className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Department" value={form.department} onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))} /> : null}
          {!userId ? <input className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Password" type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} /> : null}
          {fieldErrors.password ? <p className="text-xs text-red-400">{fieldErrors.password}</p> : null}
        </div>
        <div className="mt-5 flex gap-2"><button type="button" className="rounded-md border border-slate-200 bg-white px-4 py-2 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" onClick={onClose}>Cancel</button><button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500" onClick={() => saveUser.mutate()}>Save</button></div>
      </div>
    </div>,
    document.body,
  )
}

export function UserDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const [openForm, setOpenForm] = useState(false)
  const detailQuery = useQuery({ queryKey: ['user', id], queryFn: () => usersApi.getById(id) })
  const activityQuery = useQuery({ queryKey: ['audit-logs', 'user', id], queryFn: () => auditApi.list({ user: id, limit: '10' }) })
  const user = detailQuery.data
  const activities = activityQuery.data ?? []

  const toggleStatus = useMutation({
    mutationFn: () => usersApi.toggleStatus(Number(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })

  const initials = useMemo(() => {
    const name = user?.name ?? 'User'
    const parts = name.trim().split(/\s+/).slice(0, 2)
    return parts.map(p => p[0]?.toUpperCase()).join('') || 'U'
  }, [user?.name])

  const status = (user?.status ?? 'active') as 'active' | 'inactive'
  const statusPill =
    status === 'active'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'

  const rolePill = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  const deptPill = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-semibold text-white">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{user?.name ?? 'User'}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className={`rounded-full px-2.5 py-1 ${rolePill}`}>{user?.role ?? '-'}</span>
                <span className={`rounded-full px-2.5 py-1 ${deptPill}`}>{user?.department ?? '-'}</span>
                <span className={`rounded-full px-2.5 py-1 ${statusPill}`}>{status.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpenForm(true)}
            >
              <Pencil size={16} />
              Edit User
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-60"
              onClick={() => toggleStatus.mutate()}
              disabled={toggleStatus.isPending}
            >
              <Ban size={16} />
              {status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* Two-column detail */}
      <div className="grid gap-4 md:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Account Details</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">EMAIL</p>
              <p className="mt-1 text-slate-800 dark:text-slate-100">{user?.email ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ROLE</p>
              <p className="mt-1 text-slate-800 dark:text-slate-100">{user?.role ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">DEPARTMENT</p>
              <p className="mt-1 text-slate-800 dark:text-slate-100">{user?.department ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">STATUS</p>
              <p className="mt-1 text-slate-800 dark:text-slate-100">{status === 'active' ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {activities.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">No recent activity found.</div>
            ) : (
              activities.map(log => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {log.module === 'Auth' ? <ShieldCheck size={16} /> : <UserIcon size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {log.action} · {log.record}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {log.module} · {toRelativeTime(log.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-200 px-5 py-4 text-center dark:border-slate-800">
            <Link
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              to={`/audit-logs?user=${encodeURIComponent(user?.name ?? '')}`}
            >
              View Full Activity Log →
            </Link>
          </div>
        </div>
      </div>

      {openForm ? <UserFormDrawer userId={Number(id)} onClose={() => setOpenForm(false)} /> : null}
    </div>
  )
}

