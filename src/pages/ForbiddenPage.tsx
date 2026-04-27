import { Link } from 'react-router-dom'

/**
 * ForbiddenPage — /403
 * Shown when a user tries to access a page their role doesn't permit.
 */
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 antialiased">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--error-container)] flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[var(--error)] text-[40px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield_lock
          </span>
        </div>
        <h1 className="text-5xl font-extrabold text-[var(--on-surface)] mb-2">403</h1>
        <h2 className="text-xl font-semibold text-[var(--on-surface)] mb-3">Access Denied</h2>
        <p className="text-sm text-[var(--on-surface-variant)] mb-8">
          You don't have permission to view this page. If you believe this is an error, please contact your administrator.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-[var(--primary)] text-[var(--on-primary)] font-semibold text-sm px-6 py-3 rounded-sm hover:bg-[var(--on-primary-fixed-variant)] transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
