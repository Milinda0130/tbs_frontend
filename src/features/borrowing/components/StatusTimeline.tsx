import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'pending_approval', label: 'Pending Approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'issued', label: 'Issued' },
  { key: 'returned', label: 'Returned' },
]

interface Props {
  currentStatus: string
}

/**
 * StatusTimeline — Horizontal stepper showing borrow request progress.
 * Usage: <StatusTimeline currentStatus="approved" />
 */
export default function StatusTimeline({ currentStatus }: Props) {
  const currentIndex = STEPS.findIndex(step => step.key === currentStatus)

  return (
    <div className="flex w-full items-center py-4">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isFuture = index > currentIndex

        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all',
                  isCompleted && 'border-blue-700 bg-blue-700 text-white',
                  isCurrent && 'border-blue-700 bg-blue-50 text-blue-700',
                  isFuture && 'border-gray-300 bg-white text-gray-400'
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={cn(
                  'mt-1 w-20 text-center text-xs',
                  isCompleted && 'text-blue-700 font-medium',
                  isCurrent && 'text-blue-700 font-semibold',
                  isFuture && 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-1 mb-5 h-0.5 flex-1',
                  index < currentIndex ? 'bg-blue-700' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
