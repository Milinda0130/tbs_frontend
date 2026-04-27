import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { issuingApi } from '@/api/issuingApi';
import { inventoryApi } from '@/api/inventoryApi';
import { useAuth } from '@/stores/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

interface InventoryItem {
  id: number;
  name: string;
  store: string;
  current_stock: number;
  unit: string;
  approval_required: boolean;
}

interface IssueItem {
  item_id: number;
  name: string;
  store: string;
  current_stock: number;
  unit: string;
  approval_required: boolean;
  qty: number;
}

interface Department {
  id: number;
  name: string;
}

export default function IssueItemsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [items, setItems] = useState<IssueItem[]>([]);
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [recipientName, setRecipientName] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-wrapper')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: deptData } = useQuery({
    queryKey: ['departments'],
    queryFn: issuingApi.getDepartments,
    staleTime: 60_000,
  });
  const departments: Department[] = deptData?.data ?? [];

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['inventory-search', debouncedSearch],
    queryFn: () => inventoryApi.search(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 30_000,
  });
  const searchResults: InventoryItem[] = searchData?.data ?? [];

  const hasApprovalRequired = items.some((i) => i.approval_required);
  const allAutoApproved = items.length > 0 && items.every((i) => !i.approval_required);

  const handleAddItem = (item: InventoryItem) => {
    if (items.some((i) => i.item_id === item.id)) return;
    setItems((prev) => [
      ...prev,
      {
        item_id: item.id,
        name: item.name,
        store: item.store,
        current_stock: item.current_stock,
        unit: item.unit,
        approval_required: item.approval_required,
        qty: 1,
      },
    ]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveItem = (item_id: number) => {
    setItems((prev) => prev.filter((i) => i.item_id !== item_id));
  };

  const handleQtyChange = (item_id: number, value: number) => {
    setItems((prev) =>
      prev.map((i) => (i.item_id === item_id ? { ...i, qty: value } : i))
    );
  };

  const { mutate: submitIssue, isPending } = useMutation({
    mutationFn: issuingApi.createIssue,
    onSuccess: () => {
      navigate('/issuing-history');
    },
    onError: (error: { response?: { data?: { errors?: Record<string, string> } } }) => {
      const apiErrors = error?.response?.data?.errors ?? {};
      setErrors(apiErrors);
    },
  });

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!departmentId) newErrors.department_id = 'Department is required.';
    if (!recipientName.trim()) newErrors.recipient_name = 'Recipient name is required.';
    if (!dateOfIssue) newErrors.date_of_issue = 'Date of issue is required.';
    if (items.length === 0) newErrors.items = 'Add at least one item.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    submitIssue({
      department_id: Number(departmentId),
      recipient_name: recipientName,
      date_of_issue: dateOfIssue,
      notes: notes || undefined,
      items: items.map((i) => ({ item_id: i.item_id, qty: i.qty })),
    });
  };

  const isSubmitDisabled =
    items.length === 0 || !departmentId || !recipientName || !dateOfIssue || isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 max-w-screen-xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/issuing-history')} className="hover:text-gray-700">
            Issuing
          </button>
          <span>›</span>
          <span className="font-semibold text-gray-900">Record Issue</span>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900">Issue Items to Department</h1>

        {/* Approval Banner */}
        {items.length > 0 && hasApprovalRequired && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-start gap-3">
            <span className="text-orange-500 text-lg">⚠</span>
            <div>
              <p className="text-sm font-semibold text-orange-800">Approval Required</p>
              <p className="text-sm text-orange-700 mt-0.5">
                One or more items in this issue request exceed standard auto-approval
                thresholds or belong to restricted categories. This record will be
                routed to the Department Head for sign-off.
              </p>
            </div>
          </div>
        )}
        {allAutoApproved && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
            <span>ℹ️</span>
            <span>All selected items are auto-approved and will be issued immediately.</span>
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">

          {/* LEFT — Items */}
          <div className="flex-1 space-y-4">

            {/* Selected Items Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Selected Items</h2>

                {/* Search inside header */}
                <div className="relative search-wrapper w-72">
                  <input
                    type="text"
                    placeholder="Search inventory by Name or SKU..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    🔍
                  </span>

                  {showDropdown && debouncedSearch.length >= 2 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchLoading && (
                        <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
                      )}
                      {!searchLoading && searchResults.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500">No items found.</div>
                      )}
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleAddItem(item)}
                          disabled={items.some((i) => i.item_id === item.id)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed border-b border-gray-100 last:border-0"
                        >
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-gray-400 ml-2 text-xs">SKU · {item.store}</span>
                          {item.approval_required && (
                            <span className="ml-2 text-orange-600 text-xs font-medium">
                              Approval Required
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {errors.items && (
                <p className="text-red-600 text-xs px-5 pt-3">{errors.items}</p>
              )}

              {items.length === 0 ? (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">
                  Search and select items above to add them here.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Item Name', 'Store Location', 'Current Stock', 'Issue Qty', 'Status', ''].map((h) => (
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
                    {items.map((item) => (
                      <tr key={item.item_id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-gray-500">{item.store}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {item.current_stock} {item.unit}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={1}
                            max={item.current_stock}
                            value={item.qty}
                            onChange={(e) =>
                              handleQtyChange(item.item_id, Number(e.target.value))
                            }
                            className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {item.approval_required ? (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                              Requires Approval
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                              Auto-Approved
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(item.item_id)}
                            className="text-gray-300 hover:text-red-500 text-xl leading-none font-bold"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* RIGHT — Issue Details */}
          <div className="w-80 shrink-0">
            <div className="sticky top-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Issue Details</h2>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value ? Number(e.target.value) : '');
                    setErrors((p) => ({ ...p, department_id: '' }));
                  }}
                  disabled={user?.role === 'Dept Admin'}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 ${
                    errors.department_id ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.department_id && (
                  <p className="text-red-600 text-xs mt-1">{errors.department_id}</p>
                )}
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    setErrors((p) => ({ ...p, recipient_name: '' }));
                  }}
                  placeholder="e.g. Dr. Jane Smith"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.recipient_name ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {errors.recipient_name && (
                  <p className="text-red-600 text-xs mt-1">{errors.recipient_name}</p>
                )}
              </div>

              {/* Date of Issue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Issue <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateOfIssue}
                  onChange={(e) => {
                    setDateOfIssue(e.target.value);
                    setErrors((p) => ({ ...p, date_of_issue: '' }));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date_of_issue ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {errors.date_of_issue && (
                  <p className="text-red-600 text-xs mt-1">{errors.date_of_issue}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes{' '}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any specific instructions or context..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isPending ? 'Submitting...' : '→ Record Issue'}
              </button>

              <button
                onClick={() => navigate('/issuing-history')}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}