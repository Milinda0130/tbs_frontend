import axiosInstance from './axiosInstance'

export const borrowingApi = {
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
