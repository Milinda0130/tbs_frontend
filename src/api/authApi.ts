import axiosInstance from './axiosInstance'
import type { AuthUser } from '@/stores/AuthContext'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export const authApi = {
  login: (payload: LoginPayload) =>
    axiosInstance.post<LoginResponse>('/auth/login', payload),

  logout: () =>
    axiosInstance.post('/auth/logout'),

  me: () =>
    axiosInstance.get<AuthUser>('/auth/me'),

  forgotPassword: (email: string) =>
    axiosInstance.post('/auth/forgot-password', { email }),

  resetPassword: (payload: { token: string; email: string; password: string; password_confirmation: string }) =>
    axiosInstance.post('/auth/reset-password', payload),
}
