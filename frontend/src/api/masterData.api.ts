import axiosClient from './axiosClient';

export const supplierApi = {
  list: (params?: Record<string, any>) => axiosClient.get('/master-data/suppliers', { params }),
  get: (id: string) => axiosClient.get(`/master-data/suppliers/${id}`),
  create: (data: any) => axiosClient.post('/master-data/suppliers', data),
  update: (id: string, data: any) => axiosClient.put(`/master-data/suppliers/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/master-data/suppliers/${id}`),
};

export const warehouseApi = {
  list: (params?: Record<string, any>) => axiosClient.get('/master-data/warehouses', { params }),
  get: (id: string) => axiosClient.get(`/master-data/warehouses/${id}`),
  create: (data: any) => axiosClient.post('/master-data/warehouses', data),
  update: (id: string, data: any) => axiosClient.put(`/master-data/warehouses/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/master-data/warehouses/${id}`),
};

export const materialApi = {
  list: (params?: Record<string, any>) => axiosClient.get('/master-data/materials', { params }),
  get: (id: string) => axiosClient.get(`/master-data/materials/${id}`),
  create: (data: any) => axiosClient.post('/master-data/materials', data),
  update: (id: string, data: any) => axiosClient.put(`/master-data/materials/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/master-data/materials/${id}`),
};

export const categoryApi = {
  list: (params?: Record<string, any>) => axiosClient.get('/master-data/categories', { params }),
};

export const unitApi = {
  list: (params?: Record<string, any>) => axiosClient.get('/master-data/units', { params }),
};