import axiosInstance from './axiosInstance'

export const issuingApi = {
  createIssue: async (payload: {
    department_id: number
    recipient_name: string
    date_of_issue: string
    notes?: string
    items: { item_id: number; qty: number }[]
  }) => {
    const { data } = await axiosInstance.post('/department-issues', payload)
    return data
  },

  getDepartments: async () => {
    const { data } = await axiosInstance.get('/departments')
    return data
  },

  getHistory: async (params: {
    department_id?: number
    store?: string
    category?: string
    date_from?: string
    date_to?: string
    search?: string
    page?: number
  }) => {
    const { data } = await axiosInstance.get('/department-issues', { params })
    return data
  },

  exportHistory: async (params: Record<string, unknown>, format: 'pdf' | 'excel') =>
    axiosInstance.get('/department-issues/export', {
      params: { ...params, format },
      responseType: 'blob',
    }),

  getAll: (params?: Record<string, unknown>) =>
    axiosInstance.get('/issuing', { params }),

  getById: (id: number) =>
    axiosInstance.get(`/issuing/${id}`),

  issue: (data: Record<string, unknown>) =>
    axiosInstance.post('/issuing', data),

  return: (id: number, data: Record<string, unknown>) =>
    axiosInstance.post(`/issuing/${id}/return`, data),
}
