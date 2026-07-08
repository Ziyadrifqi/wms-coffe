import axiosClient from './axiosClient';
import type { LoginPayload, LoginResponse } from '../types/auth';

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const changePassword = (payload: ChangePasswordPayload) => {
  return axiosClient.post('/change-password', payload);
};

export const login = (payload: LoginPayload) => {
  return axiosClient.post<LoginResponse>('/login', payload);
};

export const logout = () => {
  return axiosClient.post('/logout');
};

export const getMe = () => {
  return axiosClient.get('/me');
};