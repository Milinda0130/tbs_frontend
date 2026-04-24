/**
 * Shared utility helpers for feature pages.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export function toRelativeTime(iso?: string) {
  if (!iso) return '-'
  const date = new Date(iso).getTime()
  const diffSec = Math.floor((Date.now() - date) / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  return `${Math.floor(diffHour / 24)}d ago`
}

export function diffJson(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined
) {
  const keys = new Set<string>([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ])
  return Array.from(keys).filter(key => {
    const left = JSON.stringify(before?.[key] ?? null)
    const right = JSON.stringify(after?.[key] ?? null)
    return left !== right
  })
}

