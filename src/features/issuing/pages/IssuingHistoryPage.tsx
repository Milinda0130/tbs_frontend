import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { issuingApi } from '@/api/issuingApi';
import { useAuth } from '@/stores/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

interface IssueRecord {
  id: number;
  date_of_issue: string;
  department?: { name: string };
  item?: { name: string; category: string; unit: string };
  qty: number;
  recipient_name: string;
  issued_by?: { name: string };
  notes?: string;
}

export default function IssuingHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const department = searchParams.get('department') ?? '';
  const store      = searchParams.get('store')      ?? '';
  const category   = searchParams.get('category')   ?? '';
  const dateFrom   = searchParams.get('date_from')  ?? '';
  const dateTo     = searchParams.get('date_to')    ?? '';
  const search     = searchParams.get('search')     ?? '';
  const page       = Number(searchParams.get('page') ?? 1);

  const debouncedSearch = useDebounce(search, 300);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      'issuing-history',
      department, store, category,
      dateFrom, dateTo, debouncedSearch, page,
    ],
    queryFn: () =>
      issuingApi.getHistory({
        department_id: department ? Number(department) : undefined,
        store:         store      || undefined,
        category:      category   || undefined,
        date_from:     dateFrom   || undefined,
        date_to:       dateTo     || undefined,
        search:        debouncedSearch || undefined,
        page,
      }),
    staleTime: 30_000,
  });

  const issues: IssueRecord[] = data?.data ?? [];
  const total    = data?.meta?.total ?? 0;
  const totalQty = issues.reduce((sum, i) => sum + i.qty, 0);

  const handleExport = async (format: 'pdf' | 'excel') => {
    const params = {
      department_id: department || undefined,
      store:         store      || undefined,
      category:      category   || undefined,
      date_from:     dateFrom   || undefined,
      date_to:       dateTo     || undefined,
      search:        debouncedSearch || undefined,
    };
    const response = await issuingApi.exportHistory(params, format);
    const ext  = format === 'pdf' ? 'pdf' : 'xlsx';
    const url  = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', `issuing-history.${ext}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const hasFilters = search || department || store || category || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 max-w-screen-xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Issuing</span>
          <span>›</span>
          <span className="font-semibold text-gray-900">Issuing History</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Issuing History</h1>
          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <div className="relative group">
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                ⬇ Export
                <span className="text-gray-400">▾</span>
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-10">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  Export Excel
                </button>
              </div>
            </div>
            <button
              onClick={() => navigate('/issue-items')}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
            >
              + Issue Items
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">

            {/* Department */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => updateParam('department', e.target.value)}
                disabled={user?.role === 'Dept Admin'}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 min-w-[160px]"
              >
                <option value="">All Departments</option>
              </select>
            </div>

            {/* Store */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Store
              </label>
              <select
                value={store}
                onChange={(e) => updateParam('store', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
              >
                <option value="">All Stores</option>
                <option value="main">Main Store</option>
                <option value="nursing">Nursing Stock</option>
                <option value="hospitality">Hospitality Stock</option>
                <option value="media">Media Equipment</option>
              </select>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Category
              </label>
              <input
                type="text"
                placeholder="All Categories"
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
              />
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => updateParam('date_from', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => updateParam('date_to', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by item, SKU, or recipient..."
                value={search}
                onChange={(e) => updateParam('search', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-red-500 hover:text-red-700 font-medium pb-0.5"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 text-sm font-medium">No issuing records found.</p>
              <p className="text-gray-400 text-xs mt-1">
                Try adjusting your filters or issue some items.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    'Issue Date', 'Department', 'Item Name', 'Category',
                    'Qty', 'Unit', 'Recipient', 'Issued By', 'Notes',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <>
                    <tr
                      key={issue.id}
                      onClick={() => toggleRow(issue.id)}
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500">{issue.date_of_issue}</td>
                      <td className="px-4 py-3 text-gray-700">{issue.department?.name}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {issue.item?.name}
                      </td>
                      <td className="px-4 py-3">
                        {issue.item?.category && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                            {issue.item.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{issue.qty}</td>
                      <td className="px-4 py-3 text-gray-500">{issue.item?.unit}</td>
                      <td className="px-4 py-3 text-gray-700">{issue.recipient_name}</td>
                      <td className="px-4 py-3 text-gray-500">{issue.issued_by?.name}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[140px] truncate">
                        {issue.notes || '—'}
                      </td>
                    </tr>

                    {/* Expanded notes row */}
                    {expandedRows.has(issue.id) && issue.notes && (
                      <tr key={`${issue.id}-expanded`} className="bg-blue-50">
                        <td colSpan={9} className="px-6 py-3 text-sm text-gray-700">
                          <span className="font-medium text-gray-500">Notes: </span>
                          {issue.notes}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>

              {/* Footer summary */}
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total Selected Quantity
                  </td>
                  <td className="px-4 py-3 text-base font-bold text-blue-700">
                    {totalQty}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Showing 1–{issues.length} of {total} records</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateParam('page', String(page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm"
              >
                ‹
              </button>
              <span className="px-3 py-1.5 bg-blue-700 text-white rounded-lg text-sm font-medium">
                {page}
              </span>
              <button
                onClick={() => updateParam('page', String(page + 1))}
                disabled={issues.length < 20}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 text-sm"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}