import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/stores/AuthContext'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-center">
      <div className="relative mb-6">
        <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800 tracking-tighter">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-[64px] text-blue-500 drop-shadow-sm">
            explore_off
          </span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Page Not Found
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined text-[18px] mr-2">arrow_back</span>
          Go Back
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(isAuthenticated ? '/' : '/login')}
        >
          <span className="material-symbols-outlined text-[18px] mr-2">home</span>
          Return Home
        </Button>
      </div>
    </div>
  )
}
