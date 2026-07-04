import axiosClient from './axiosClient';
import type { LoginPayload, LoginResponse } from '../types/auth';

export const login = (payload: LoginPayload) => {
  return axiosClient.post<LoginResponse>('/login', payload);
};

export const logout = () => {
  return axiosClient.post('/logout');
};

export const getMe = () => {
  return axiosClient.get('/me');
};