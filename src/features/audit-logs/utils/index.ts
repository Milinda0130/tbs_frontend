export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
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
