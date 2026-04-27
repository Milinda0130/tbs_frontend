import axiosInstance from './axiosInstance';

export const getPurchaseOrders = async (params?: Record<string, unknown>) => {
  const { data } = await axiosInstance.get('/purchase-orders', { params });
  return data;
};

export const getPurchaseOrder = async (id: string) => {
  const { data } = await axiosInstance.get(`/purchase-orders/${id}`);
  return data;
};

export const createPurchaseOrder = async (payload: Record<string, unknown>) => {
  const { data } = await axiosInstance.post('/purchase-orders', payload);
  return data;
};

export const updatePurchaseOrder = async (id: string, payload: Record<string, unknown>) => {
  const { data } = await axiosInstance.put(`/purchase-orders/${id}`, payload);
  return data;
};

export const receivePurchaseOrder = async (id: string, payload: Record<string, unknown>) => {
  const { data } = await axiosInstance.patch(`/purchase-orders/${id}/receive`, payload);
  return data;
};
