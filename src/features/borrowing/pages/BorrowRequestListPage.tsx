import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowingApi } from '@/api/borrowingApi';
import { useAuth } from '@/stores/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import StatusBadge, { type BorrowStatus } from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';

interface BorrowRequest {
  id: number;
  user?: { name: string };
  department?: { name: string };
  purpose: string;
  items_count: number;
  required_date: string;
  expected_return_date: string;
  status: BorrowStatus;
}

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Approved', value: 'approved' },
  { label: 'Issued', value: 'issued' },
  { label: 'Returned', value: 'returned' },
  { label: 'Rejected', value: 'rejected' },
];

export default function BorrowRequestListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const status = searchParams.get('status') ?? '';
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 300);

  const [approveModal, setApproveModal] = useState<{
    open: boolean;
    id: number | null;
    note: string;
  }>({ open: false, id: null, note: '' });

  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    id: number | null;
    reason: string;
  }>({ open: false, id: null, reason: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['borrow-requests', status, debouncedSearch],
    queryFn: () =>
      borrowingApi.getRequests({
        status: status || undefined,
        search: debouncedSearch || undefined,
      }),
    staleTime: 30_000,
  });

  const requests: BorrowRequest[] = data?.data ?? [];

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      borrowingApi.approveRequest(String(id), note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      setApproveModal({ open: false, id: null, note: '' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      borrowingApi.rejectRequest(String(id), reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      setRejectModal({ open: false, id: null, reason: '' });
    },
  });

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 max-w-screen-xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Borrowing</span>
          <span>›</span>
          <span className="font-semibold text-gray-900">Requests</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Borrow Requests</h1>
          <button
            onClick={() => navigate('/borrow-requests/create')}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 flex items-center gap-2"
          >
            + New Request
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-0 border-b border-gray-200 bg-white rounded-t-xl px-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateParam('status', tab.value)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                status === tab.value
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-b-xl px-4 py-3 -mt-5 border-t-0">
          <input
            type="text"
            placeholder="Search by request ID or item name..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  'Request ID', 'Requested By', 'Department', 'Purpose',
                  'Items', 'Required Date', 'Expected Return', 'Status', 'Actions',
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
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && requests.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No borrow requests found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                requests.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      <button onClick={() => navigate(`/borrow-requests/${row.id}`)}>
                        #{row.id}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{row.user?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{row.department?.name}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">
                      {row.purpose}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        {row.items_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.required_date}</td>
                    <td className="px-4 py-3 text-gray-500">{row.expected_return_date}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/borrow-requests/${row.id}`)}
                          className="text-blue-700 text-xs font-medium hover:underline"
                        >
                          View
                        </button>
                        {['Admin', 'coordinator'].includes(user?.role ?? '') &&
                          row.status === 'pending_approval' && (
                            <>
                              <button
                                onClick={() =>
                                  setApproveModal({ open: true, id: row.id, note: '' })
                                }
                                className="text-green-700 text-xs font-medium hover:underline"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  setRejectModal({ open: true, id: row.id, reason: '' })
                                }
                                className="text-red-600 text-xs font-medium hover:underline"
                              >
                                Reject
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, id: null, note: '' })}
        title={`Approve Request #${approveModal.id}`}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setApproveModal({ open: false, id: null, note: '' })}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                approveMutation.mutate({
                  id: approveModal.id!,
                  note: approveModal.note,
                })
              }
              disabled={approveMutation.isPending}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {approveMutation.isPending ? 'Approving...' : 'Confirm Approve'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 mb-3">Add an optional note for this approval.</p>
        <textarea
          placeholder="Optional note..."
          value={approveModal.note}
          onChange={(e) => setApproveModal((p) => ({ ...p, note: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: null, reason: '' })}
        title={`Reject Request #${rejectModal.id}`}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRejectModal({ open: false, id: null, reason: '' })}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                rejectMutation.mutate({
                  id: rejectModal.id!,
                  reason: rejectModal.reason,
                })
              }
              disabled={!rejectModal.reason || rejectMutation.isPending}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 mb-3">Please provide a reason for rejection.</p>
        <textarea
          placeholder="Reason for rejection (required)..."
          value={rejectModal.reason}
          onChange={(e) => setRejectModal((p) => ({ ...p, reason: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Modal>
    </div>
  );
}