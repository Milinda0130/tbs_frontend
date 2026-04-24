import axiosInstance from './axiosInstance'

export const issuingApi = {
  getAll: (params?: Record<string, unknown>) =>
    axiosInstance.get('/issuing', { params }),

  getById: (id: number) =>
    axiosInstance.get(`/issuing/${id}`),

  issue: (data: Record<string, unknown>) =>
    axiosInstance.post('/issuing', data),

  return: (id: number, data: Record<string, unknown>) =>
    axiosInstance.post(`/issuing/${id}/return`, data),
}
