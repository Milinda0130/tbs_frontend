import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { borrowingApi } from '@/api/borrowingApi';
import Modal from '@/components/ui/Modal';
import { useChannel } from '@/hooks/useChannel';

interface RequestItem {
  id: number;
  name: string;
  qty: number;
  approval_required: boolean;
}

interface BorrowRequest {
  id: number;
  department?: { name: string };
  user?: { name: string; avatar?: string };
  purpose: string;
  required_date: string;
  created_at: string;
  items?: RequestItem[];
  items_count: number;
}

export default function ApprovalQueuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [approveModal, setApproveModal] = useState({ open: false, id: 0, note: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, id: 0, reason: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: borrowingApi.getPendingRequests,
    staleTime: 10_000,
  });

  const requests: BorrowRequest[] = (data?.data ?? []).filter(
    (r: BorrowRequest) => !dismissed.has(r.id)
  );

  // WebSocket
  const handleNewRequest = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
  }, [queryClient]);
  useChannel('approvals', 'NewPendingRequest', handleNewRequest);

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      borrowingApi.approveRequest(String(id), note),
    onSuccess: (_, { id }) => {
      setDismissed((prev) => new Set(prev).add(id));
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      setApproveModal({ open: false, id: 0, note: '' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      borrowingApi.rejectRequest(String(id), reason),
    onSuccess: (_, { id }) => {
      setDismissed((prev) => new Set(prev).add(id));
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      setRejectModal({ open: false, id: 0, reason: '' });
    },
  });

  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const getDateColor = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    const diffDays = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 0) return 'text-red-600 font-semibold';
    if (diffDays <= 2) return 'text-orange-500 font-medium';
    return 'text-gray-500';
  };

  const getDateLabel = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    const diffDays = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return dateStr;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-6">
        <div className="max-w-screen-xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 max-w-screen-xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Borrowing</span>
          <span>›</span>
          <span className="font-semibold text-gray-900">Approval Queue</span>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
              {requests.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {requests.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Borrow requests waiting for your approval
            </p>
          </div>
        </div>

        {/* Empty State */}
        {requests.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">No pending requests</h2>
            <p className="text-gray-400 text-sm mt-1">You are all caught up!</p>
          </div>
        )}

        {/* Request Cards */}
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300"
            >
              {/* Card Header */}
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">

                    {/* Title row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/borrow-requests/${request.id}`)}
                        className="font-bold text-blue-700 hover:underline text-sm"
                      >
                        BR-{request.id}
                      </button>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {request.department?.name}
                      </span>
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {request.items_count} item{request.items_count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {request.created_at}
                      </span>
                    </div>

                    {/* Purpose */}
                    <p className="text-sm text-gray-700">{request.purpose}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-gray-400 uppercase font-medium tracking-wide">
                          Required Date
                        </span>
                        <div className={`mt-0.5 flex items-center gap-1 ${getDateColor(request.required_date)}`}>
                          {getDateColor(request.required_date).includes('red') && '⚠ '}
                          {getDateColor(request.required_date).includes('orange') && '📅 '}
                          {getDateLabel(request.required_date)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 uppercase font-medium tracking-wide">
                          Requested By
                        </span>
                        <div className="mt-0.5 text-gray-700 font-medium">
                          {request.user?.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setRejectModal({ open: true, id: request.id, reason: '' })}
                      className="border border-red-200 text-red-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setApproveModal({ open: true, id: request.id, note: '' })}
                      className="bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>

                {/* Expandable Items */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleExpand(request.id)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    {expandedCards.has(request.id) ? 'Hide Items ▲' : 'Show Items ▼'}
                  </button>

                  {expandedCards.has(request.id) && (
                    <div className="mt-3 space-y-2">
                      {request.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <span className="text-gray-700 font-medium">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">× {item.qty}</span>
                            {item.approval_required && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                Approval Required
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, id: 0, note: '' })}
        title={`Approve Request BR-${approveModal.id}`}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setApproveModal({ open: false, id: 0, note: '' })}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                approveMutation.mutate({ id: approveModal.id, note: approveModal.note })
              }
              disabled={approveMutation.isPending}
              className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
            >
              {approveMutation.isPending ? 'Approving...' : 'Confirm Approve'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 mb-3">
          You are about to approve <strong>BR-{approveModal.id}</strong>.
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note (Optional)
        </label>
        <textarea
          placeholder="Add any instructions for pickup or handling..."
          value={approveModal.note}
          onChange={(e) => setApproveModal((p) => ({ ...p, note: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: 0, reason: '' })}
        title={`Reject Request BR-${rejectModal.id}`}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRejectModal({ open: false, id: 0, reason: '' })}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                rejectMutation.mutate({ id: rejectModal.id, reason: rejectModal.reason })
              }
              disabled={!rejectModal.reason || rejectMutation.isPending}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 mb-3">
          Please provide a reason for rejecting <strong>BR-{rejectModal.id}</strong>.
        </p>
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