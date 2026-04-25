import axiosInstance from './axiosInstance';

export const getSuppliers = async (params?: Record<string, unknown>) => {
  const { data } = await axiosInstance.get('/suppliers', { params });
  return data;
};

export const getSupplier = async (id: string) => {
  const { data } = await axiosInstance.get(`/suppliers/${id}`);
  return data;
};

export const getSupplierPOs = async (id: string) => {
  const { data } = await axiosInstance.get(`/suppliers/${id}/purchase-orders`);
  return data;
};

export const createSupplier = async (payload: Record<string, unknown>) => {
  const { data } = await axiosInstance.post('/suppliers', payload);
  return data;
};

export const updateSupplier = async (id: string, payload: Record<string, unknown>) => {
  const { data } = await axiosInstance.put(`/suppliers/${id}`, payload);
  return data;
};
