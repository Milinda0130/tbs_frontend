import type { ReactNode } from 'react'
import { ExportButton } from '@/components/ui/ExportButton'

/**
 * ReportPageLayout
 * Shared page scaffold for all report screens so filtering, export actions,
 * and result rendering remain consistent across report variants.
 */
interface ReportPageLayoutProps {
  title: string
  filters: ReactNode
  results: ReactNode
  onExportPdf: () => Promise<void> | void
  onExportExcel: () => Promise<void> | void
}

export function ReportPageLayout({
  title,
  filters,
  results,
  onExportPdf,
  onExportExcel,
}: ReportPageLayoutProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <ExportButton onExportPdf={onExportPdf} onExportExcel={onExportExcel} />
      </div>
      {filters}
      {results}
    </div>
  )
}

