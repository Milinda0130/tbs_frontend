import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { borrowingApi } from '@/api/borrowingApi';

interface RequestItem {
  id: number;
  name: string;
  store: string;
  qty: number;
  unit: string;
  serial_number?: string;
  condition?: string;
}

interface BorrowRequest {
  id: number;
  status: string;
  purpose: string;
  created_at: string;
  required_date: string;
  expected_return_date: string;
  approved_at?: string;
  approval_note?: string;
  user?: { name: string; role?: string };
  department?: { name: string };
  approved_by?: { name: string };
  items?: RequestItem[];
}

export default function BorrowDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['borrow-request', id],
    queryFn: () => borrowingApi.getRequest(id!),
    staleTime: 10_000,
  });

  const request = data?.data as BorrowRequest | undefined;

  const handleDownload = async () => {
    const response = await borrowingApi.downloadDocument(id!);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `borrow-document-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Document not found.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 max-w-screen-xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 no-print">
          <button
            onClick={() => navigate('/borrow-requests')}
            className="hover:text-gray-700"
          >
            Borrow Requests
          </button>
          <span>›</span>
          <button
            onClick={() => navigate(`/borrow-requests/${id}`)}
            className="hover:text-gray-700"
          >
            BR-{request.id}
          </button>
          <span>›</span>
          <span className="font-semibold text-gray-900">Document</span>
        </div>

        {/* Page Header + Actions */}
        <div className="flex items-center justify-between no-print">
          <h1 className="text-2xl font-bold text-gray-900">
            Borrow Document — BR-{request.id}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              🖨 Print
            </button>
            <button
              onClick={handleDownload}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 flex items-center gap-2"
            >
              ⬇ Download PDF
            </button>
          </div>
        </div>

        {/* Document Card */}
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-10 space-y-6 print-card">

          {/* Document Header */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                TBS CAMPUS
              </h2>
              <p className="text-sm text-gray-500 mt-1">Inventory Management System</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-gray-900 uppercase tracking-wider">
                Equipment Borrowing Record
              </p>
            </div>
          </div>

          {/* Reference + Date */}
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-500">Reference No. </span>
              <span className="font-bold text-gray-900">BR-{request.id}</span>
            </div>
            <div>
              <span className="text-gray-500">Issue Date </span>
              <span className="font-semibold text-gray-900">{request.created_at}</span>
            </div>
          </div>

          {/* Borrower Info */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Borrower Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Name',            request.user?.name],
                ['Role',            request.user?.role],
                ['Department',      request.department?.name],
                ['Required Date',   request.required_date],
                ['Expected Return', request.expected_return_date],
              ].map(([label, value]) => (
                <div key={label} className={label === 'Department' ? 'col-span-2' : ''}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Borrowing Details */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Borrowing Details
            </h3>
            <div>
              <p className="text-xs text-gray-500">Purpose / Event</p>
              <p className="text-sm text-gray-900 mt-0.5">{request.purpose}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Items Borrowed
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Item Name', 'Quantity', 'Serial No.', 'Condition at Issue'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {request.items?.map((item, index) => (
                    <tr key={item.id} className={index > 0 ? 'border-t border-gray-100' : ''}>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.qty} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {item.serial_number ?? 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.condition ?? 'Good'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Authorization */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Authorization
            </h3>
            <p className="text-sm text-gray-700">
              <span className="text-gray-500">Approved By: </span>
              <span className="font-medium">
                {request.approved_by?.name ?? '—'}
              </span>
              {request.approved_at && (
                <span className="text-gray-400"> on {request.approved_at}</span>
              )}
            </p>
            <div className="w-48 border-t border-gray-400 pt-2 mt-8">
              <p className="text-xs text-gray-400 text-center">Authorized Signature</p>
            </div>
          </div>

          {/* Acknowledgement / Signature Fields */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Acknowledgement
            </h3>
            <div className="grid grid-cols-2 gap-8">
              {['Received By (Borrower)', 'Released By (Stock Keeper)'].map((label) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 mb-8">{label}</p>
                  <div className="border-t border-gray-400 pt-1 mb-4">
                    <p className="text-xs text-gray-400 text-center">Signature</p>
                  </div>
                  <div className="border-t border-gray-400 pt-1">
                    <p className="text-xs text-gray-400 text-center">Date</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-400">
              TBS Campus Inventory Management System — Confidential Record
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}