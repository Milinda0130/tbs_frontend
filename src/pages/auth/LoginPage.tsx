import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/AuthContext'
import { authApi } from '@/api/authApi'

/**
 * LoginPage — /login
 * Pixel-accurate implementation of the provided HTML mockup.
 * Full-page centered card, no sidebar, no header.
 */
export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (DEMO_MODE) {
        // Demo: accept any credentials
        login('demo-token', {
          id: 1,
          name: 'Admin User',
          email: email || 'admin@tbscampus.edu',
          role: 'Admin',
          department: 'Administration',
        })
        return
      }

      const res = await authApi.login({ email, password })
      login(res.data.token, res.data.user)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(
        axiosErr?.response?.data?.message ??
        'Invalid email or password. Please try again or contact support if the issue persists.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[var(--surface)] min-h-screen flex items-center justify-center p-4 md:p-8 antialiased">
      <main className="w-full max-w-[420px] bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)] shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 md:p-12 flex flex-col w-full">

          {/* Header */}
          <header className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[var(--primary-container)] text-[var(--primary-fixed)] flex items-center justify-center font-semibold text-xl mb-4 shadow-sm">
              TBS
            </div>
            <h1 className="text-xl font-semibold text-[var(--on-surface)] text-center mb-1">
              Inventory Management System
            </h1>
            <h2 className="text-2xl font-bold text-[var(--on-surface)] text-center">
              Sign in to your account
            </h2>
          </header>

          {/* Error banner */}
          {error && (
            <div className="bg-[var(--error-container)] border border-[var(--error)]/20 rounded-sm p-4 mb-6 flex items-start gap-2" role="alert">
              <span
                className="material-symbols-outlined text-[var(--on-error-container)] text-[20px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
              <p className="text-sm text-[var(--on-error-container)]">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow w-full">
            <div className="space-y-6 flex-grow">

              {/* Email / Username */}
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-xs font-bold uppercase tracking-[0.05em] text-[var(--on-surface-variant)] mb-2"
                >
                  Email or Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--outline)]">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </span>
                  <input
                    id="login-username"
                    type="text"
                    name="username"
                    placeholder="admin@tbscampus.edu"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    className="block w-full pl-12 pr-4 py-3 border border-[var(--outline-variant)] rounded-sm bg-[var(--surface-container-lowest)] text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-colors placeholder:text-[var(--outline-variant)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-[0.05em] text-[var(--on-surface-variant)] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--outline)]">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    className="block w-full pl-12 pr-12 py-3 border border-[var(--outline-variant)] rounded-sm bg-[var(--surface-container-lowest)] text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--outline)] hover:text-[var(--on-surface-variant)] focus:outline-none transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--primary)] hover:text-[var(--on-primary-fixed-variant)] transition-colors hover:underline underline-offset-2"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-sm shadow-sm text-xs font-bold uppercase tracking-[0.05em] text-[var(--on-primary)] bg-[var(--primary)] hover:bg-[var(--on-primary-fixed-variant)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              >
                {isLoading && (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                )}
                Sign In
              </button>
            </div>
          </form>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-[var(--outline-variant)]/30 text-center">
            <p className="text-sm text-[var(--on-surface-variant)]">
              Having trouble?{' '}
              <a href="#" className="text-[var(--primary)] hover:underline hover:text-[var(--on-primary-fixed-variant)] transition-colors">
                Contact your administrator.
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
