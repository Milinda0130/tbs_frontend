import React, { ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T, index: number) => ReactNode;
}

export interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationProps;
  rowClassName?: (row: T) => string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available.',
  pagination,
  rowClassName,
  onSort,
  sortKey,
  sortDirection,
}: DataTableProps<T>) {
  const handleSortClick = (key: string) => {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-surface-container-lowest rounded-lg border border-[#E1E4E8] shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-[#E1E4E8]">
            {columns.map((col, index) => (
              <th 
                key={String(col.key) + index} 
                className={`py-3 px-4 text-label-bold text-on-surface-variant uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                onClick={() => col.sortable && handleSortClick(String(col.key))}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="p-4">
                <Skeleton lines={5} height="40px" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-on-surface-variant text-body-md">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`border-b border-[#E1E4E8] hover:bg-slate-50 transition-colors ${rowClassName ? rowClassName(row) : ''}`}
              >
                {columns.map((col, colIndex) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const value = (row as any)[col.key];
                  return (
                    <td key={colIndex} className="py-3 px-4 text-body-md text-on-surface">
                      {col.render ? col.render(value, row, rowIndex) : value as ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {!loading && data.length > 0 && pagination && pagination.total > pagination.perPage && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E1E4E8] bg-surface-container-lowest">
          <div className="text-body-md text-on-surface-variant">
            Showing {(pagination.page - 1) * pagination.perPage + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} entries
          </div>
          <div className="flex gap-2">
            <button 
              disabled={pagination.page === 1}
              onClick={() => pagination.onChange(pagination.page - 1)}
              className="px-3 py-1 text-body-md border border-outline-variant rounded disabled:opacity-50 text-primary"
            >
              Previous
            </button>
            <button 
              disabled={pagination.page * pagination.perPage >= pagination.total}
              onClick={() => pagination.onChange(pagination.page + 1)}
              className="px-3 py-1 text-body-md border border-outline-variant rounded disabled:opacity-50 text-primary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
