import axiosInstance from './axiosInstance'
import { mockNotifications } from './mockData'

/**
 * notificationsApi
 * Notification-center API wrapper used by header bell and full-page inbox.
 */
export interface NotificationDto {
  id: number
  title: string
  description: string
  type: 'low_stock' | 'approval' | 'decision' | 'overdue' | 'system'
  link: string
  is_read: boolean
  created_at: string
}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export const notificationsApi = {
  count: async () => {
    if (DEMO_MODE) {
      return { unread: mockNotifications.filter(item => !item.is_read).length }
    }
    try {
      const { data } = await axiosInstance.get<{ unread: number }>('/notifications/unread-count')
      return data
    } catch {
      return { unread: mockNotifications.filter(item => !item.is_read).length }
    }
  },
  list: async (params: Record<string, string | number>) => {
    if (DEMO_MODE) {
      const tab = String(params.tab ?? 'all')
      const page = Number(params.page ?? 1)
      const limit = Number(params.limit ?? 10)
      const filtered = mockNotifications.filter(item => {
        if (tab === 'all') return true
        if (tab === 'unread') return !item.is_read
        return item.type === tab
      })
      const start = (page - 1) * limit
      return filtered.slice(start, start + limit)
    }
    try {
      const { data } = await axiosInstance.get<NotificationDto[]>('/notifications', { params })
      return data
    } catch {
      const tab = String(params.tab ?? 'all')
      const page = Number(params.page ?? 1)
      const limit = Number(params.limit ?? 10)
      const filtered = mockNotifications.filter(item => {
        if (tab === 'all') return true
        if (tab === 'unread') return !item.is_read
        return item.type === tab
      })
      const start = (page - 1) * limit
      return filtered.slice(start, start + limit)
    }
  },
  markRead: async (id: number) => {
    if (DEMO_MODE) return
    try {
      await axiosInstance.patch(`/notifications/${id}/read`)
    } catch {
      void id
    }
  },
  markAllRead: async () => {
    if (DEMO_MODE) return
    try {
      await axiosInstance.patch('/notifications/mark-all-read')
    } catch {
      return
    }
  },
}

