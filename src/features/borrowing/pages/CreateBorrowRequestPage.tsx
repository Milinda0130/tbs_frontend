import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventoryApi';
import { borrowingApi } from '@/api/borrowingApi';
import { useDebounce } from '@/hooks/useDebounce';

interface InventoryItem {
  id: number;
  name: string;
  store: string;
  current_stock: number;
  unit: string;
  approval_required: boolean;
}

interface RequestItem {
  item_id: number;
  name: string;
  store: string;
  current_stock: number;
  unit: string;
  approval_required: boolean;
  qty: number;
}

export default function CreateBorrowRequestPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [purpose, setPurpose] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-wrapper')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['inventory-search', debouncedSearch],
    queryFn: () => inventoryApi.search(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 30_000,
  });

  const searchResults: InventoryItem[] = searchData?.data ?? [];

  const hasApprovalRequired = items.some((i) => i.approval_required);
  const allAutoApproved = items.length > 0 && items.every((i) => !i.approval_required);

  const handleAddItem = useCallback(
    (item: InventoryItem) => {
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
    },
    [items]
  );

  const handleRemoveItem = (item_id: number) => {
    setItems((prev) => prev.filter((i) => i.item_id !== item_id));
  };

  const handleQtyChange = (item_id: number, value: number) => {
    setItems((prev) =>
      prev.map((i) => (i.item_id === item_id ? { ...i, qty: value } : i))
    );
  };

  const { mutate: submitRequest, isPending } = useMutation({
    mutationFn: borrowingApi.createRequest,
    onSuccess: (data) => {
      navigate(`/borrow-requests/${data.data.id}`);
    },
    onError: (error: { response?: { data?: { errors?: Record<string, string> } } }) => {
      const apiErrors = error?.response?.data?.errors ?? {};
      setErrors(apiErrors);
    },
  });

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!purpose.trim()) newErrors.purpose = 'Purpose is required.';
    if (!requiredDate) newErrors.required_date = 'Required date is required.';
    if (!expectedReturnDate) newErrors.expected_return_date = 'Expected return date is required.';
    if (expectedReturnDate && requiredDate && expectedReturnDate <= requiredDate)
      newErrors.expected_return_date = 'Must be after required date.';
    if (items.length === 0) newErrors.items = 'Add at least one item.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    submitRequest({
      purpose,
      required_date: requiredDate,
      expected_return_date: expectedReturnDate,
      items: items.map((i) => ({ item_id: i.item_id, qty: i.qty })),
    });
  };

  const isSubmitDisabled =
    items.length === 0 || !purpose || !requiredDate || !expectedReturnDate || isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 max-w-screen-xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/borrow-requests')} className="hover:text-gray-700">
            Borrow Requests
          </button>
          <span>›</span>
          <span className="font-semibold text-gray-900">New Request</span>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900">Create Borrow Request</h1>

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">

          {/* LEFT — Item Search + Table */}
          <div className="flex-1 space-y-4">

            {/* Approval Banner */}
            {items.length > 0 && hasApprovalRequired && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <span>⚠️</span>
                <span>This request includes items that require admin approval. It will be sent for review before processing.</span>
              </div>
            )}
            {allAutoApproved && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <span>ℹ️</span>
                <span>All selected items are auto-approved and will be issued without review.</span>
              </div>
            )}

            {/* Search */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
              <h2 className="text-base font-semibold text-gray-900">Find Items to Borrow</h2>
              <div className="relative search-wrapper">
                <input
                  type="text"
                  placeholder="Search by SKU, Building, or Category..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                        <span className="text-gray-400 ml-2">· {item.store}</span>
                        <span className="text-gray-400 ml-2">· Stock: {item.current_stock} {item.unit}</span>
                        {item.approval_required && (
                          <span className="ml-2 text-orange-600 text-xs font-medium">Approval Required</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.items && <p className="text-red-600 text-xs">{errors.items}</p>}
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900">Request Items</h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Item Name', 'Store', 'Current Stock', 'Quantity', 'Status', 'Action'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                        <td className="px-4 py-3 text-gray-500">{item.current_stock} {item.unit}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={1}
                            max={item.current_stock}
                            value={item.qty}
                            onChange={(e) => handleQtyChange(item.item_id, Number(e.target.value))}
                            className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
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
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(item.item_id)}
                            className="text-gray-400 hover:text-red-500 text-lg leading-none font-bold"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT — Request Summary (sticky) */}
          <div className="w-80 shrink-0">
            <div className="sticky top-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Request Summary</h2>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose / Event Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => { setPurpose(e.target.value); setErrors((p) => ({ ...p, purpose: '' })); }}
                  placeholder="Briefly describe why these items are needed..."
                  rows={3}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.purpose ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {errors.purpose && <p className="text-red-600 text-xs mt-1">{errors.purpose}</p>}
              </div>

              {/* Required Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={requiredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => { setRequiredDate(e.target.value); setErrors((p) => ({ ...p, required_date: '' })); }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.required_date ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {errors.required_date && <p className="text-red-600 text-xs mt-1">{errors.required_date}</p>}
              </div>

              {/* Expected Return */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Return <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  min={requiredDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => { setExpectedReturnDate(e.target.value); setErrors((p) => ({ ...p, expected_return_date: '' })); }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expected_return_date ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {errors.expected_return_date && <p className="text-red-600 text-xs mt-1">{errors.expected_return_date}</p>}
              </div>

              {/* Items Summary */}
              {items.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600">Items Summary</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {items.length} Items Total
                    </span>
                  </div>
                  {items.map((item) => (
                    <p key={item.item_id} className="text-xs text-gray-600">
                      {item.qty}x {item.name}
                    </p>
                  ))}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Submitting...' : 'Submit Request'}
              </button>

              <button
                onClick={() => navigate('/borrow-requests')}
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