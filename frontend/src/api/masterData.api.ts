import axiosClient from './axiosClient';
import type { Supplier, Warehouse, Material, PaginatedResponse } from '../types/masterData';

type QueryParams = Record<string, string | number | boolean | undefined>;

interface SupplierPayload {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
}

interface WarehousePayload {
  code: string;
  name: string;
  address?: string;
  is_active: boolean;
}

interface MaterialPayload {
  sku: string;
  name: string;
  category_id: string;
  unit_id: string;
  min_stock: number;
  is_perishable: boolean;
  is_active: boolean;
}

export const supplierApi = {
  list: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<Supplier>>('/master-data/suppliers', { params }),
  get: (id: string) => axiosClient.get<{ data: Supplier }>(`/master-data/suppliers/${id}`),
  create: (data: SupplierPayload) => axiosClient.post('/master-data/suppliers', data),
  update: (id: string, data: SupplierPayload) => axiosClient.put(`/master-data/suppliers/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/master-data/suppliers/${id}`),
};

export const warehouseApi = {
  list: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<Warehouse>>('/master-data/warehouses', { params }),
  get: (id: string) => axiosClient.get<{ data: Warehouse }>(`/master-data/warehouses/${id}`),
  create: (data: WarehousePayload) => axiosClient.post('/master-data/warehouses', data),
  update: (id: string, data: WarehousePayload) => axiosClient.put(`/master-data/warehouses/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/master-data/warehouses/${id}`),
};

export const materialApi = {
  list: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<Material>>('/master-data/materials', { params }),
  get: (id: string) => axiosClient.get<{ data: Material }>(`/master-data/materials/${id}`),
  create: (data: MaterialPayload) => axiosClient.post('/master-data/materials', data),
  update: (id: string, data: MaterialPayload) => axiosClient.put(`/master-data/materials/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/master-data/materials/${id}`),
};

export const categoryApi = {
  list: (params?: QueryParams) => axiosClient.get('/master-data/categories', { params }),
};

export const unitApi = {
  list: (params?: QueryParams) => axiosClient.get('/master-data/units', { params }),
};