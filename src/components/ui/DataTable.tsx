import { cn } from '@/lib/utils'

type DataColumn<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  rowKey?: (row: T, index: number) => React.Key
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  rowKey,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                {columns.map(column => (
                  <th
                    key={String(column.key)}
                    className="px-4 py-3 text-left"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td colSpan={columns.length} className="px-4 py-4">
                    <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
              {columns.map(column => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={rowKey ? rowKey(row, index) : index}
                  className="border-t border-gray-100 text-sm hover:bg-gray-50"
                >
                  {columns.map(column => {
                    const value =
                      typeof column.key === 'string' && column.key in row
                        ? row[column.key as keyof T]
                        : undefined

                    return (
                      <td
                        key={String(column.key)}
                        className={cn('px-4 py-3 text-gray-700', column.className)}
                      >
                        {column.render ? column.render(row) : String(value ?? '')}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
