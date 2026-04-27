import Modal from './Modal'
import { Button } from './Button'

/**
 * ConfirmModal — Reusable confirmation dialog.
 * Usage:
 *   <ConfirmModal
 *     open={showConfirm}
 *     title="Delete Item"
 *     message="Are you sure? This action cannot be undone."
 *     confirmLabel="Delete"
 *     confirmVariant="error"
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 */

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'primary' | 'error'
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
    </Modal>
  )
}
