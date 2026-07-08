import axiosClient from './axiosClient';
import type { PaginatedResponse } from '../types/masterData';
import type { ManagedUser } from '../types/user';

type QueryParams = Record<string, string | number | boolean | undefined>;

interface UserPayload {
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export const userManagementApi = {
  list: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<ManagedUser>>('/settings/users', { params }),
  get: (id: string) => axiosClient.get<{ data: ManagedUser }>(`/settings/users/${id}`),
  create: (data: UserPayload) => axiosClient.post('/settings/users', data),
  update: (id: string, data: UserPayload) => axiosClient.put(`/settings/users/${id}`, data),
  getRoles: () => axiosClient.get<{ data: string[] }>('/settings/roles'),
};