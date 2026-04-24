import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowingApi } from '@/api/borrowingApi';
import { useAuth } from '@/stores/AuthContext';
import StatusBadge, { type BorrowStatus } from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { useChannel } from '@/hooks/useChannel';
import { useCallback } from 'react';

interface RequestItem {
  id: number;
  name: string;
  store: string;
  qty: number;
  unit: string;
  approval_required: boolean;
}

interface BorrowRequest {
  id: number;
  status: BorrowStatus;
  purpose: string;
  created_at: string;
  required_date: string;
  expected_return_date: string;
  approved_at?: string;
  approval_note?: string;
  user?: { name: string };
  department?: { name: string };
  approved_by?: { name: string };
  items?: RequestItem[];
}

const STEPS: { key: BorrowStatus; label: string }[] = [
  { key: 'submitted',        label: 'Submitted' },
  { key: 'pending_approval', label: 'Pending Approval' },
  { key: 'approved',         label: 'Approved' },
  { key: 'issued',           label: 'Issued' },
  { key: 'returned',         label: 'Returned' },
];

export default function BorrowRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [approveModal, setApproveModal] = useState({ open: false, note: '' });
  const [rejectModal, setRejectModal]   = useState({ open: false, reason: '' });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['borrow-request', id],
    queryFn: () => borrowingApi.getRequest(id!),
    staleTime: 10_000,
  });

  const request = data?.data as BorrowRequest | undefined;

  // WebSocket
  const handleStatusUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['borrow-request', id] });
  }, [queryClient, id]);
  useChannel(`requests.${id}`, 'RequestStatusUpdated', handleStatusUpdate);

  const approveMutation = useMutation({
    mutationFn: () => borrowingApi.approveRequest(id!, approveModal.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-request', id] });
      setApproveModal({ open: false, note: '' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => borrowingApi.rejectRequest(id!, rejectModal.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-request', id] });
      setRejectModal({ open: false, reason: '' });
    },
  });

  const issueMutation = useMutation({
    mutationFn: () => borrowingApi.issueRequest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-request', id] });
    },
  });

  const handleDownload = async () => {
    const response = await borrowingApi.downloadDocument(id!);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `borrow-request-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-6">
        <div className="max-w-screen-xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Request not found.</p>
          <button
            onClick={() => navigate('/borrow-requests')}
            className="mt-3 text-blue-700 text-sm hover:underline"
          >
            ← Back to Borrow Requests
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === request.status);

  const renderActionPanel = () => {
    const role   = user?.role ?? '';
    const status = request.status;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Administrative Actions</h3>

        {['Admin', 'coordinator'].includes(role) && status === 'pending_approval' && (
          <>
            <p className="text-sm text-gray-500">
              Review this request to approve or reject the borrowing of restricted items.
            </p>
            <button
              onClick={() => setApproveModal({ open: true, note: '' })}
              className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 flex items-center justify-center gap-2"
            >
              ✓ Approve Request
            </button>
            <button
              onClick={() => setRejectModal({ open: true, reason: '' })}
              className="w-full border border-red-300 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2"
            >
              ✕ Reject Request
            </button>
          </>
        )}

        {role === 'Stock Keeper' && status === 'approved' && (
          <button
            onClick={() => issueMutation.mutate()}
            disabled={issueMutation.isPending}
            className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {issueMutation.isPending ? 'Marking...' : 'Mark as Issued'}
          </button>
        )}

        {['issued', 'returned'].includes(status) && (
          <>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-2">Documents</p>
              <p className="text-xs text-gray-400">Borrowing agreement available below.</p>
            </div>
            <button
              onClick={handleDownload}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              ⬇ Download PDF
            </button>
          </>
        )}

        {status === 'submitted' && (
          <button className="w-full text-red-600 text-sm underline hover:text-red-800">
            Cancel Request
          </button>
        )}

        {['approved', 'pending_approval', 'submitted'].includes(status) &&
          !['Admin', 'coordinator', 'Stock Keeper'].includes(role) && (
          <p className="text-sm text-gray-400 text-center">
            No actions available for your role at this stage.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 max-w-screen-xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => navigate('/borrow-requests')}
            className="hover:text-gray-700"
          >
            Borrow Requests
          </button>
          <span>›</span>
          <span className="font-semibold text-gray-900">BR-{request.id}</span>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                BR-{request.id}
              </h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-sm text-gray-500">
              Submitted by {request.user?.name} · {request.created_at}
            </p>
          </div>
          {request.status === 'submitted' && (
            <button className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50">
              Cancel Request
            </button>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
          <div className="flex items-center w-full">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent   = index === currentStepIndex;

              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      isCompleted ? 'bg-blue-700 border-blue-700 text-white' :
                      isCurrent   ? 'border-blue-700 text-blue-700 bg-blue-50' :
                                    'border-gray-300 text-gray-400 bg-white'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`text-xs mt-1 text-center w-20 ${
                      isCompleted ? 'text-blue-700 font-medium' :
                      isCurrent   ? 'text-blue-700 font-semibold' :
                                    'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-5 ${
                      index < currentStepIndex ? 'bg-blue-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">

          {/* LEFT */}
          <div className="flex-1 space-y-4">

            {/* Request Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Request Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Purpose / Event</p>
                  <p className="text-sm text-gray-900 mt-1">{request.purpose}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Department',       request.department?.name],
                    ['Required Date',    request.required_date],
                    ['Return Date',      request.expected_return_date],
                    ['Submitted',        request.created_at],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                      <p className="text-sm text-gray-900 mt-1">{value ?? '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Requested Items */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Requested Items</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {request.items?.length ?? 0} Items
                </span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Item Name', 'Store', 'Quantity', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {request.items?.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-gray-500">{item.store}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.qty} {item.unit}
                      </td>
                      <td className="px-4 py-3">
                        {item.approval_required ? (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                            Approval Required
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Auto Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT — Action Panel */}
          <div className="w-72 shrink-0">
            {renderActionPanel()}
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, note: '' })}
        title={`Approve Request #${id}`}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setApproveModal({ open: false, note: '' })}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
            >
              {approveMutation.isPending ? 'Approving...' : 'Confirm Approve'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 mb-3">
          You are about to approve <strong>BR-{id}</strong> for {request.user?.name}.
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
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
        onClose={() => setRejectModal({ open: false, reason: '' })}
        title={`Reject Request #${id}`}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRejectModal({ open: false, reason: '' })}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => rejectMutation.mutate()}
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