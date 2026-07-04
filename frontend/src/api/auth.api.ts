import axiosClient from './axiosClient';

export const login = (email: string, password: string) => {
  return axiosClient.post('/login', { email, password });
};

export const logout = () => {
  return axiosClient.post('/logout');
};

export const getMe = () => {
  return axiosClient.get('/me');
};