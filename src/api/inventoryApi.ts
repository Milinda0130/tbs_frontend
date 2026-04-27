import axiosInstance from './axiosInstance';

export const getItems = async (params?: Record<string, unknown>) => {
  const { data } = await axiosInstance.get('/inventory', { params });
  return data;
};

export const getItem = async (id: string) => {
  const { data } = await axiosInstance.get(`/inventory/${id}`);
  return data;
};

export const getItemMovements = async (id: string) => {
  const { data } = await axiosInstance.get(`/inventory/${id}/movements`);
  return data;
};

export const createItem = async (payload: Record<string, unknown>) => {
  const { data } = await axiosInstance.post('/inventory', payload);
  return data;
};

export const updateItem = async (id: string, payload: Record<string, unknown>) => {
  const { data } = await axiosInstance.put(`/inventory/${id}`, payload);
  return data;
};

export const stockIn = async (id: string, payload: Record<string, unknown>) => {
  const { data } = await axiosInstance.post(`/inventory/${id}/stock-in`, payload);
  return data;
};

export const getLowStock = async (params?: Record<string, unknown>) => {
  const { data } = await axiosInstance.get('/inventory/low-stock', { params });
  return data;
};

export const inventoryApi = {
  search: async (query: string) => {
    const { data } = await axiosInstance.get('/inventory', {
      params: { search: query },
    });
    return data;
  },

  getAll: async (params?: Record<string, unknown>) => getItems(params),

  getById: async (id: number | string) => getItem(String(id)),

  getLowStock: async (params?: Record<string, unknown>) => getLowStock(params),

  update: async (id: number | string, payload: Record<string, unknown>) =>
    updateItem(String(id), payload),

  adjustStock: async (id: number | string, quantity: number, reason: string) => {
    const { data } = await axiosInstance.post(`/inventory/${id}/adjust`, { quantity, reason });
    return data;
  },
};
