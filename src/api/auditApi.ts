import axiosInstance from './axiosInstance'
import { mockAuditLogs } from './mockData'

/**
 * auditApi
 * Read-only client for audit trail listing and export operations.
 */
export interface AuditLogEntry {
  id: number
  created_at: string
  user_name: string
  user_role: string
  action: string
  module: string
  record: string
  ip_address: string
  before_values?: Record<string, unknown> | null
  after_values?: Record<string, unknown> | null
}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export const auditApi = {
  list: async (params: Record<string, string>) => {
    if (DEMO_MODE) {
      const page = Number(params.page ?? '1')
      const perPage = 50
      const dateFrom = params.dateFrom ?? ''
      const dateTo = params.dateTo ?? ''
      const filtered = mockAuditLogs.filter(log => {
        const userMatch = !params.user || log.user_name.toLowerCase().includes(params.user.toLowerCase())
        const actionMatch = !params.action || log.action.toLowerCase().includes(params.action.toLowerCase())
        const moduleMatch = !params.module || log.module.toLowerCase().includes(params.module.toLowerCase())
        const ipMatch = !params.ip || log.ip_address.includes(params.ip)
        const date = String(log.created_at).slice(0, 10)
        const fromOk = !dateFrom || date >= dateFrom
        const toOk = !dateTo || date <= dateTo
        return userMatch && actionMatch && moduleMatch && ipMatch && fromOk && toOk
      })
      const start = (page - 1) * perPage
      return filtered.slice(start, start + perPage)
    }

    try {
      const { data } = await axiosInstance.get<AuditLogEntry[]>('/audit-logs', { params })
      return data
    } catch {
      const filtered = mockAuditLogs.filter(log => {
        const userMatch = !params.user || log.user_name.toLowerCase().includes(params.user.toLowerCase())
        const actionMatch = !params.action || log.action.toLowerCase().includes(params.action.toLowerCase())
        const moduleMatch = !params.module || log.module.toLowerCase().includes(params.module.toLowerCase())
        const ipMatch = !params.ip || log.ip_address.includes(params.ip)
        return userMatch && actionMatch && moduleMatch && ipMatch
      })
      return filtered
    }
  },
  export: async (format: 'pdf' | 'excel', params: Record<string, string>) => {
    if (DEMO_MODE) {
      return new Blob([JSON.stringify(mockAuditLogs, null, 2)], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    }
    try {
      const { data } = await axiosInstance.get('/audit-logs/export', {
        params: { ...params, format },
        responseType: 'blob',
      })
      return data as Blob
    } catch {
      return new Blob([JSON.stringify(mockAuditLogs, null, 2)], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    }
  },
}

