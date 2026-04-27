import { create } from 'zustand'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Toast — Global toast notification system (Zustand-powered).
 *
 * Usage (from any component):
 *   import { useToastStore } from '@/components/ui/Toast'
 *   const toast = useToastStore()
 *   toast.success('Item saved successfully')
 *   toast.error('Failed to delete item')
 *   toast.info('Processing your request...')
 *
 * Mount <ToastContainer /> once in main.tsx (already done).
 */

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
}

interface ToastStore {
  toasts: ToastItem[]
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  remove: (id: string) => void
}

let _id = 0

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  success: (message, duration = 4000) => {
    const id = `toast-${++_id}`
    set(state => ({ toasts: [...state.toasts, { id, message, type: 'success', duration }] }))
  },

  error: (message, duration = 5000) => {
    const id = `toast-${++_id}`
    set(state => ({ toasts: [...state.toasts, { id, message, type: 'error', duration }] }))
  },

  info: (message, duration = 4000) => {
    const id = `toast-${++_id}`
    set(state => ({ toasts: [...state.toasts, { id, message, type: 'info', duration }] }))
  },

  remove: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
  },
}))

/* ─── Icon helpers ─────────────────────────────────────────────────────────── */

const icons: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
}

const colorMap: Record<ToastType, { bg: string; border: string; text: string; icon: string; bar: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-900 dark:text-green-100',
    icon: 'text-green-600 dark:text-green-400',
    bar: 'bg-green-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
    icon: 'text-red-600 dark:text-red-400',
    bar: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-600 dark:text-blue-400',
    bar: 'bg-blue-500',
  },
}

/* ─── Single Toast ─────────────────────────────────────────────────────────── */

function ToastCard({ toast }: { toast: ToastItem }) {
  const remove = useToastStore(s => s.remove)
  const [exiting, setExiting] = useState(false)
  const c = colorMap[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), toast.duration - 300)
    const removeTimer = setTimeout(() => remove(toast.id), toast.duration)
    return () => {
      clearTimeout(timer)
      clearTimeout(removeTimer)
    }
  }, [toast.id, toast.duration, remove])

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[320px] max-w-[420px] relative overflow-hidden transition-all duration-300',
        c.bg, c.border,
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
      )}
      role="alert"
    >
      <span className={cn('material-symbols-outlined text-[20px] mt-0.5 shrink-0', c.icon)} style={{ fontVariationSettings: "'FILL' 1" }}>
        {icons[toast.type]}
      </span>
      <p className={cn('text-sm font-medium flex-1', c.text)}>{toast.message}</p>
      <button
        onClick={() => remove(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/5">
        <div
          className={cn('h-full', c.bar)}
          style={{ animation: `toast-shrink ${toast.duration}ms linear forwards` }}
        />
      </div>
    </div>
  )
}

/* ─── Container (mount once in main.tsx) ───────────────────────────────────── */

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)

  return (
    <>
      {/* Keyframe for progress bar */}
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard toast={t} />
          </div>
        ))}
      </div>
    </>
  )
}
