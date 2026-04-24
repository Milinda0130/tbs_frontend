import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { queryClient } from './queryClient'
import axiosInstance from '@/api/axiosInstance'

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole =
  | 'Admin'
  | 'Stock Keeper'
  | 'Audit Officer'
  | 'Faculty'
  | 'Dept Admin'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  department?: string
  avatar?: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  hasRole: (roles: UserRole[]) => boolean
}

// ─── Token Store (module-level, no localStorage) ──────────────────────────────
// This is the ONLY place the token lives at runtime.
// axiosInstance reads it via getAuthToken() below.

let _token: string | null = sessionStorage.getItem('tbs_token')

export function getAuthToken(): string | null {
  return _token
}

function setAuthToken(token: string | null) {
  _token = token
  if (token) {
    sessionStorage.setItem('tbs_token', token)
  } else {
    sessionStorage.removeItem('tbs_token')
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(_token)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const logoutRef = useRef<() => void>(() => {})

  const logout = useCallback(() => {
    setAuthToken(null)
    setTokenState(null)
    setUser(null)
    queryClient.clear()
    navigate('/login', { replace: true })
  }, [navigate])

  // Keep ref always up to date so axiosInstance can call it
  logoutRef.current = logout

  // Expose logout ref for axiosInstance interceptor
  ;(window as unknown as Record<string, unknown>).__tbsLogout = () => logoutRef.current()

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    setAuthToken(newToken)
    setTokenState(newToken)
    setUser(newUser)

    // Redirect to role default page
    const roleDefaults: Record<UserRole, string> = {
      Admin:           '/dashboard',
      'Stock Keeper':  '/inventory',
      'Audit Officer': '/reports',
      Faculty:         '/borrow-requests',
      'Dept Admin':    '/borrow-requests',
    }
    navigate(roleDefaults[newUser.role] ?? '/dashboard', { replace: true })
  }, [navigate])

  const hasRole = useCallback(
    (roles: UserRole[]) => !!user && roles.includes(user.role),
    [user]
  )

  // On mount: if token exists in sessionStorage, verify with backend
  useEffect(() => {
    const stored = sessionStorage.getItem('tbs_token')
    if (!stored) {
      setIsLoading(false)
      return
    }

    axiosInstance
      .get<AuthUser>('/auth/me', { timeout: 5000 })
      .then(res => {
        setTokenState(stored)
        setUser(res.data)
      })
      .catch(() => {
        setAuthToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
