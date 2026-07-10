import axiosClient from './axiosClient';
import type { LoginPayload, LoginResponse } from '../types/auth';

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface UpdateProfilePayload {
  name: string;
  email: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const updateProfile = (payload: UpdateProfilePayload) => {
  return axiosClient.put('/profile', payload);
};

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

export const forgotPassword = (payload: ForgotPasswordPayload) => {
  return axiosClient.post('/forgot-password', payload);
};

export const resetPassword = (payload: ResetPasswordPayload) => {
  return axiosClient.post('/reset-password', payload);
};