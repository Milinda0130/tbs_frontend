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
