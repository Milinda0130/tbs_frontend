import axios from 'axios'
import { getAuthToken } from '@/stores/AuthContext'

/**
 * ─── SHARED AXIOS INSTANCE (F1) ────────────────────────────────────────────
 *
 * This is the ONE AND ONLY axios instance for the entire project.
 * All 5 developers must import this file — NEVER call axios.create() yourself.
 *
 * Usage:
 *   import axiosInstance from '@/api/axiosInstance'
 *   const res = await axiosInstance.get('/your-endpoint')
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 8000,
})

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Reads token from AuthContext (via getAuthToken helper — NOT localStorage).
// Attaches Authorization: Bearer {token} to every request.

axiosInstance.interceptors.request.use(
  config => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────────────────────
// On 401 Unauthorized: call authContext.logout() and redirect to /login.
// The logout function is registered on window.__tbsLogout by AuthProvider.

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const logoutFn = (window as unknown as Record<string, unknown>).__tbsLogout
      if (typeof logoutFn === 'function') {
        logoutFn()
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
