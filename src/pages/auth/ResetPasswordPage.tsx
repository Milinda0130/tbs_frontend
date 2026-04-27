import { FormEvent, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/authApi'

/**
 * ResetPasswordPage — /reset-password?token=xxx&email=xxx
 * Reads token + email from URL query params. New password + confirm fields.
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const emailParam = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setIsLoading(true)
    try {
      if (DEMO_MODE) {
        await new Promise(r => setTimeout(r, 1000))
        navigate('/login?reset=success', { replace: true })
        return
      }
      await authApi.resetPassword({
        token,
        email: emailParam,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/login?reset=success', { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr?.response?.data?.message ?? 'Failed to reset password. The link may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[var(--surface-container-low)] min-h-screen flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-[420px] flex flex-col gap-6">

        {/* Branding */}
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[var(--primary)] text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              inventory_2
            </span>
            <h1 className="text-2xl font-bold text-[var(--primary)] tracking-tight">
              TBS Campus IMS
            </h1>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)] p-8 shadow-sm">
          <div className="flex flex-col gap-4 mb-6 text-center">
            <h2 className="text-xl font-semibold text-[var(--on-surface)]">
              Reset your password
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)] px-4">
              Enter your new password below.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-[var(--error-container)] border border-[var(--error)]/20 rounded-sm p-3 mb-4 flex items-start gap-2" role="alert">
              <span
                className="material-symbols-outlined text-[var(--on-error-container)] text-[20px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
              <p className="text-sm text-[var(--on-error-container)]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* New Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="reset-password"
                className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--on-surface-variant)]"
              >
                New Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline-variant)] text-[20px]">
                  lock
                </span>
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className="w-full pl-10 pr-12 py-[10px] bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-sm text-sm text-[var(--on-surface)] placeholder:text-[var(--outline-variant)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--outline)] hover:text-[var(--on-surface-variant)] focus:outline-none transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="reset-confirm"
                className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--on-surface-variant)]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline-variant)] text-[20px]">
                  lock
                </span>
                <input
                  id="reset-confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  required
                  value={passwordConfirmation}
                  onChange={e => { setPasswordConfirmation(e.target.value); setError('') }}
                  className="w-full pl-10 pr-4 py-[10px] bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-sm text-sm text-[var(--on-surface)] placeholder:text-[var(--outline-variant)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--on-primary-fixed-variant)] text-[var(--on-primary)] font-semibold text-xs py-3 rounded-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading && (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              )}
              Reset Password
            </button>
          </form>
        </div>

        {/* Footer link */}
        <div className="text-center mt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--on-primary-fixed-variant)] transition-colors group"
          >
            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
