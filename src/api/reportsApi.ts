import axiosInstance from './axiosInstance'
import { mockReports } from './mockData'

/**
 * reportsApi
 * Shared report generation and export client for all report pages.
 */
export type ReportKey = 'monthly-stock-usage' | 'stock-movements' | 'borrowing' | 'department-issuing'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

function includesInsensitive(hay: unknown, needle: unknown) {
  const h = String(hay ?? '').toLowerCase()
  const n = String(needle ?? '').toLowerCase()
  return !n || h.includes(n)
}

export const reportsApi = {
  generate: async (report: ReportKey, filters: Record<string, unknown>) => {
    if (DEMO_MODE) {
      const rows = mockReports[report]
      const store = filters.store
      const department = filters.department
      const item = filters.item
      const dateFrom = filters.dateFrom
      const dateTo = filters.dateTo

      return rows.filter(r => {
        const storeMatch = !store || includesInsensitive(r.store, store)
        const deptMatch = !department || includesInsensitive(r.department, department)
        const itemMatch = !item || includesInsensitive(r.item, item)
        const date = (r.date ?? r.required_date) as unknown
        const afterFrom = !dateFrom || String(date ?? '') >= String(dateFrom)
        const beforeTo = !dateTo || String(date ?? '') <= String(dateTo)
        return storeMatch && deptMatch && itemMatch && afterFrom && beforeTo
      })
    }

    try {
      const { data } = await axiosInstance.get(`/reports/${report}`, { params: filters })
      return data as unknown[]
    } catch {
      return mockReports[report]
    }
  },
  export: async (report: ReportKey, format: 'pdf' | 'excel', filters: Record<string, unknown>) => {
    if (DEMO_MODE) {
      const rows = JSON.stringify(mockReports[report], null, 2)
      return new Blob([rows], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    }
    try {
      const { data } = await axiosInstance.get(`/reports/${report}/export`, {
        params: { ...filters, format },
        responseType: 'blob',
      })
      return data as Blob
    } catch {
      const rows = JSON.stringify(mockReports[report], null, 2)
      return new Blob([rows], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    }
  },
}

