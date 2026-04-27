import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FilterBar } from '@/components/ui/FilterBar'
import { usersApi } from '@/api/usersApi'
import { UserFormDrawer } from '@/features/users/components/UserFormDrawer'

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
