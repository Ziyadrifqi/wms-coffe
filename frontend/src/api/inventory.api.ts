import axiosClient from './axiosClient';
import type { PaginatedResponse } from '../types/masterData';
import type { StockOpname } from '../types/inventory';

type QueryParams = Record<string, string | number | boolean | undefined>;

interface StockOpnamePayload {
  warehouse_id: string;
  opname_date: string;
}

interface UpdateOpnameItemPayload {
  id: string;
  qty_actual: number;
  notes?: string;
}

export const stockOpnameApi = {
  list: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<StockOpname>>('/inventory/stock-opnames', { params }),
  get: (id: string) => axiosClient.get<{ data: StockOpname }>(`/inventory/stock-opnames/${id}`),
  create: (data: StockOpnamePayload) => axiosClient.post('/inventory/stock-opnames', data),
  updateItems: (id: string, items: UpdateOpnameItemPayload[]) =>
    axiosClient.put(`/inventory/stock-opnames/${id}/items`, { items }),
  complete: (id: string) => axiosClient.post(`/inventory/stock-opnames/${id}/complete`),
};