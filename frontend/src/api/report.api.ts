import axiosClient from './axiosClient';
import type { PaginatedResponse } from '../types/masterData';
import type { StockMovementReportItem } from '../types/report';

type QueryParams = Record<string, string | number | boolean | undefined>;

export const reportApi = {
  getStockMovements: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<StockMovementReportItem>>('/reports/stock-movements', { params }),

  exportExcel: (params?: QueryParams) =>
    axiosClient.get('/reports/stock-movements/export-excel', {
      params,
      responseType: 'blob',
    }),

  exportPdf: (params?: QueryParams) =>
    axiosClient.get('/reports/stock-movements/export-pdf', {
      params,
      responseType: 'blob',
    }),
};