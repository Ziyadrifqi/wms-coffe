import axiosClient from './axiosClient';
import type { PaginatedResponse } from '../types/masterData';
import type { StockMovementReportItem } from '../types/report';

type QueryParams = Record<string, string | number | boolean | string[] | undefined>;

export const reportApi = {
  getStockMovements: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<StockMovementReportItem>>('/reports/stock-movements', {
      params,
      paramsSerializer: { indexes: null }, // biar array jadi material_ids[]=a&material_ids[]=b
    }),

  exportExcel: (params?: QueryParams) =>
    axiosClient.get('/reports/stock-movements/export-excel', {
      params,
      paramsSerializer: { indexes: null },
      responseType: 'blob',
    }),

  exportPdf: (params?: QueryParams) =>
    axiosClient.get('/reports/stock-movements/export-pdf', {
      params,
      paramsSerializer: { indexes: null },
      responseType: 'blob',
    }),
};