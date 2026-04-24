import axiosInstance from './axiosInstance'
import { mockUsers } from './mockData'

/**
 * usersApi
 * Encapsulates all user-management HTTP calls used by Chamath module pages.
 */
export interface UserDto {
  id: number
  name: string
  email: string
  role: string
  department?: string
  status: 'active' | 'inactive'
  created_at?: string
  last_login_at?: string
}

export interface UserFilters {
  search?: string
  role?: string
  department?: string
  status?: string
}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export const usersApi = {
  list: async (params: UserFilters) => {
    if (DEMO_MODE) {
      return mockUsers.filter(user => {
        const searchMatch = !params.search || `${user.name} ${user.email}`.toLowerCase().includes(params.search.toLowerCase())
        const roleMatch = !params.role || user.role === params.role
        const departmentMatch = !params.department || (user.department ?? '').toLowerCase().includes(params.department.toLowerCase())
        const statusMatch = !params.status || user.status === params.status
        return searchMatch && roleMatch && departmentMatch && statusMatch
      })
    }
    try {
      const { data } = await axiosInstance.get<UserDto[]>('/users', { params })
      return data
    } catch {
      return mockUsers.filter(user => {
        const searchMatch = !params.search || `${user.name} ${user.email}`.toLowerCase().includes(params.search.toLowerCase())
        const roleMatch = !params.role || user.role === params.role
        const departmentMatch = !params.department || (user.department ?? '').toLowerCase().includes(params.department.toLowerCase())
        const statusMatch = !params.status || user.status === params.status
        return searchMatch && roleMatch && departmentMatch && statusMatch
      })
    }
  },
  getById: async (id: string) => {
    if (DEMO_MODE) {
      return mockUsers.find(user => user.id === Number(id)) ?? mockUsers[0]
    }
    try {
      const { data } = await axiosInstance.get<UserDto>(`/users/${id}`)
      return data
    } catch {
      return mockUsers.find(user => user.id === Number(id)) ?? mockUsers[0]
    }
  },
  create: async (payload: Record<string, unknown>) => {
    if (DEMO_MODE) {
      return {
        id: Date.now(),
        name: String(payload.name ?? 'New User'),
        email: String(payload.email ?? 'new@tbs.edu'),
        role: String(payload.role ?? 'Dept Admin'),
        department: String(payload.department ?? ''),
        status: (payload.status === 'inactive' ? 'inactive' : 'active'),
      }
    }
    try {
      const { data } = await axiosInstance.post<UserDto>('/users', payload)
      return data
    } catch {
      return {
        id: Date.now(),
        name: String(payload.name ?? 'New User'),
        email: String(payload.email ?? 'new@tbs.edu'),
        role: String(payload.role ?? 'Dept Admin'),
        department: String(payload.department ?? ''),
        status: (payload.status === 'inactive' ? 'inactive' : 'active'),
      }
    }
  },
  update: async (id: number, payload: Record<string, unknown>) => {
    if (DEMO_MODE) {
      return {
        id,
        name: String(payload.name ?? 'Updated User'),
        email: String(payload.email ?? 'updated@tbs.edu'),
        role: String(payload.role ?? 'Dept Admin'),
        department: String(payload.department ?? ''),
        status: (payload.status === 'inactive' ? 'inactive' : 'active'),
      }
    }
    try {
      const { data } = await axiosInstance.put<UserDto>(`/users/${id}`, payload)
      return data
    } catch {
      return {
        id,
        name: String(payload.name ?? 'Updated User'),
        email: String(payload.email ?? 'updated@tbs.edu'),
        role: String(payload.role ?? 'Dept Admin'),
        department: String(payload.department ?? ''),
        status: (payload.status === 'inactive' ? 'inactive' : 'active'),
      }
    }
  },
  toggleStatus: async (id: number) => {
    if (DEMO_MODE) {
      const current = mockUsers.find(user => user.id === id) ?? mockUsers[0]
      return {
        ...current,
        status: current.status === 'active' ? 'inactive' : 'active',
      }
    }
    try {
      const { data } = await axiosInstance.patch<UserDto>(`/users/${id}/toggle-status`)
      return data
    } catch {
      const current = mockUsers.find(user => user.id === id) ?? mockUsers[0]
      return {
        ...current,
        status: current.status === 'active' ? 'inactive' : 'active',
      }
    }
  },
}

