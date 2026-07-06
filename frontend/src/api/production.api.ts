import axiosClient from './axiosClient';
import type { PaginatedResponse } from '../types/masterData';
import type { ProductionRequest } from '../types/production';

type QueryParams = Record<string, string | number | boolean | undefined>;

interface ProductionRequestItemPayload {
  material_id: string;
  qty_requested: number;
}

interface ProductionRequestPayload {
  warehouse_id: string;
  request_date: string;
  notes?: string;
  items: ProductionRequestItemPayload[];
}

interface FulfillItemPayload {
  production_request_item_id: string;
  qty_fulfilled: number;
}

interface FulfillPayload {
  items: FulfillItemPayload[];
}

export const productionRequestApi = {
  list: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<ProductionRequest>>('/production/requests', { params }),
  get: (id: string) => axiosClient.get<{ data: ProductionRequest }>(`/production/requests/${id}`),
  create: (data: ProductionRequestPayload) => axiosClient.post('/production/requests', data),
  approve: (id: string) => axiosClient.post(`/production/requests/${id}/approve`),
  reject: (id: string) => axiosClient.post(`/production/requests/${id}/reject`),
  fulfill: (id: string, data: FulfillPayload) => axiosClient.post(`/production/requests/${id}/fulfill`, data),
};