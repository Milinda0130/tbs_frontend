import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, Pencil, ShieldCheck, User as UserIcon } from 'lucide-react'
import { auditApi } from '@/api/auditApi'
import { usersApi } from '@/api/usersApi'
import { UserFormDrawer } from '@/features/users/components/UserFormDrawer'
import { toRelativeTime } from '@/features/users/utils'

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
