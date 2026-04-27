import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/usersApi'

interface UserFormDrawerProps {
  userId: number | null
  onClose: () => void
}

export function UserFormDrawer({ userId, onClose }: UserFormDrawerProps) {
  const queryClient = useQueryClient()
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getById(String(userId)),
    enabled: !!userId,
  })
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
    department: '',
    status: 'active',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const current = userQuery.data

  useEffect(() => {
    if (!current) return
    setForm(prev => ({
      ...prev,
      name: current.name ?? '',
      email: current.email ?? '',
      role: current.role ?? 'Admin',
      department: current.department ?? '',
      status: current.status ?? 'active',
    }))
  }, [current])

  const saveUser = useMutation({
    mutationFn: async () => {
      setFieldErrors({})
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department || null,
        status: form.status,
      }
      if (!userId) payload.password = form.password
      if (userId) await usersApi.update(userId, payload)
      else await usersApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
    onError: (error: unknown) => {
      const e = error as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } }
      if (e.response?.status === 422 && e.response.data?.errors) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(e.response.data.errors).map(([key, value]) => [key, value[0]])
          )
        )
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
