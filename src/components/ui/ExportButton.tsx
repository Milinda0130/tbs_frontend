import { useState } from 'react'
import { Download } from 'lucide-react'

/**
 * ExportButton
 * Unified export action menu used by reporting-style pages.
 * Keeps PDF/Excel export UX identical across modules.
 */
interface ExportButtonProps {
  onExportPdf: () => Promise<void> | void
  onExportExcel: () => Promise<void> | void
  loading?: boolean
}

export function ExportButton({ onExportPdf, onExportExcel, loading = false }: ExportButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-70"
        onClick={() => setOpen(prev => !prev)}
        disabled={loading}
      >
        <Download size={16} />
        Export
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={async () => {
              await onExportPdf()
              setOpen(false)
            }}
          >
            Export as PDF
          </button>
          <button
            type="button"
            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={async () => {
              await onExportExcel()
              setOpen(false)
            }}
          >
            Export as Excel
          </button>
        </div>
      ) : null}
    </div>
  )
}

