import axiosInstance from './axiosInstance'

// ── Add your inventory-specific types and calls here ──
export const inventoryApi = {
  getAll: (params?: Record<string, unknown>) =>
    axiosInstance.get('/inventory', { params }),

  getById: (id: number) =>
    axiosInstance.get(`/inventory/${id}`),

  getLowStock: () =>
    axiosInstance.get('/inventory/low-stock'),

  update: (id: number, data: Record<string, unknown>) =>
    axiosInstance.put(`/inventory/${id}`, data),

  adjustStock: (id: number, quantity: number, reason: string) =>
    axiosInstance.post(`/inventory/${id}/adjust`, { quantity, reason }),
}
