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
