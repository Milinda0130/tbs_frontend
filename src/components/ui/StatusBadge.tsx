import { cn } from '@/lib/utils'

export type BorrowStatus =
  | 'submitted'
  | 'pending_approval'
  | 'auto_approved'
  | 'approved'
  | 'rejected'
  | 'issued'
  | 'returned'

const statusConfig: Record<BorrowStatus, { label: string; className: string }> = {
  submitted:        { label: 'Submitted',       className: 'bg-gray-100 text-gray-700' },
  pending_approval: { label: 'Pending Approval', className: 'bg-orange-100 text-orange-700' },
  auto_approved:    { label: 'Auto Approved',    className: 'bg-blue-100 text-blue-700' },
  approved:         { label: 'Approved',         className: 'bg-green-100 text-green-700' },
  rejected:         { label: 'Rejected',         className: 'bg-red-100 text-red-700' },
  issued:           { label: 'Issued',           className: 'bg-purple-100 text-purple-700' },
  returned:         { label: 'Returned',         className: 'bg-teal-100 text-teal-700' },
}

/**
 * StatusBadge — Maps borrow request status to a colored pill badge.
 * Usage: <StatusBadge status="pending_approval" />
 */
export default function StatusBadge({ status }: { status: BorrowStatus }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}