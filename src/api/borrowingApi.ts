import axiosInstance from './axiosInstance'

export interface CreateBorrowRequestPayload {
  purpose: string
  required_date: string
  expected_return_date: string
  items: { item_id: number; qty: number }[]
}

export interface CreateBorrowRequestResponse {
  data: {
    id: number
  }
}

export interface BorrowRequestDetailResponse {
  data: Record<string, unknown>
}

export const borrowingApi = {
  createRequest: async (payload: CreateBorrowRequestPayload) => {
    const { data } = await axiosInstance.post<CreateBorrowRequestResponse>('/borrow-requests', payload)
    return data
  },

  getRequest: async (id: string | number) => {
    const { data } = await axiosInstance.get<BorrowRequestDetailResponse>(`/borrow-requests/${id}`)
    return data
  },

  getPendingRequests: async () => {
    const { data } = await axiosInstance.get('/borrow-requests', {
      params: { status: 'pending_approval', sort: 'required_date' },
    })
    return data
  },

  getRequests: async (params?: Record<string, unknown>) => {
    const { data } = await axiosInstance.get('/borrow-requests', { params })
    return data
  },

  approveRequest: async (id: string | number, note?: string) => {
    const { data } = await axiosInstance.post(`/borrow-requests/${id}/approve`, { note })
    return data
  },

  rejectRequest: async (id: string | number, reason: string) => {
    const { data } = await axiosInstance.post(`/borrow-requests/${id}/reject`, { reason })
    return data
  },

  issueRequest: async (id: string | number) => {
    const { data } = await axiosInstance.post(`/borrow-requests/${id}/issue`)
    return data
  },

  downloadDocument: async (id: string | number) =>
    axiosInstance.get(`/borrow-requests/${id}/document`, {
      responseType: 'blob',
    }),

  getAll: (params?: Record<string, unknown>) =>
    axiosInstance.get('/borrowing', { params }),

  getById: (id: number) =>
    axiosInstance.get(`/borrowing/${id}`),

  create: (data: Record<string, unknown>) =>
    axiosInstance.post('/borrowing', data),

  approve: (id: number) =>
    axiosInstance.post(`/borrowing/${id}/approve`),

  reject: (id: number, reason: string) =>
    axiosInstance.post(`/borrowing/${id}/reject`, { reason }),

  getPendingCount: () =>
    axiosInstance.get<{ count: number }>('/borrowing/pending-count'),
}
