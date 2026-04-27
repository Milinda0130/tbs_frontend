import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '@/api/authApi'

/**
 * ForgotPasswordPage — /forgot-password
 * Matching the provided HTML mockup: centered card with email input + reset link button.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (DEMO_MODE) {
        // Simulate API delay in demo mode
        await new Promise(r => setTimeout(r, 1000))
        setSuccess(true)
        return
      }
      await authApi.forgotPassword(email)
      setSuccess(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr?.response?.data?.message ?? 'Failed to send reset link. Please try again.')
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

          {!success ? (
            <>
              <div className="flex flex-col gap-4 mb-6 text-center">
                <h2 className="text-xl font-semibold text-[var(--on-surface)]">
                  Forgot your password?
                </h2>
                <p className="text-sm text-[var(--on-surface-variant)] px-4">
                  Enter your email and we will send you a reset link.
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
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="forgot-email"
                    className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--on-surface-variant)]"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline-variant)] text-[20px]">
                      mail
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="name@tbs-campus.edu"
                      required
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
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
                  Send Reset Link
                  {!isLoading && (
                    <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-green-600 dark:text-green-400 text-[32px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mark_email_read
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--on-surface)] mb-2">
                Check your email
              </h2>
              <p className="text-sm text-[var(--on-surface-variant)] mb-6">
                We've sent a password reset link to <strong className="text-[var(--on-surface)]">{email}</strong>.
                Please check your inbox and follow the instructions.
              </p>
              <button
                onClick={() => { setSuccess(false); setEmail('') }}
                className="text-sm text-[var(--primary)] hover:underline transition-colors"
              >
                Didn't receive it? Send again
              </button>
            </div>
          )}
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
