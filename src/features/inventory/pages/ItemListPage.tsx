import React, { useState, useEffect } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Eye, Edit2, Plus, ChevronDown, Funnel } from 'lucide-react';
import { getItems } from '@/api/inventoryApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/stores/AuthContext';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { StockInSlideOver } from '@/features/inventory/components/StockInSlideOver';
import { ItemFormItem, ItemFormSlideOver } from '@/features/inventory/components/ItemFormSlideOver';

interface InventoryItem {
  id: string;
  item_name: string;
  sku: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  approval_required: boolean;
  item_type: 'Consumable' | 'Non-Consumable';
}

const STORES = [
  { id: 'main', label: 'Main Store' },
  { id: 'nursing', label: 'Nursing Stock' },
  { id: 'hospitality', label: 'Hospitality Stock' },
  { id: 'media', label: 'Media Equipment Store' },
];

export const ItemListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const store = searchParams.get('store') || 'main';
  const itemType = searchParams.get('itemType') || 'All';
  const category = searchParams.get('category') || '';
  const approvalRequired = searchParams.get('approvalRequired') === 'true';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [itemFormItem, setItemFormItem] = useState<ItemFormItem | null>(null);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [stockInItem, setStockInItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearchParams((prev) => {
        if (debouncedSearch) prev.set('search', debouncedSearch);
        else prev.delete('search');
        prev.set('page', '1');
        return prev;
      });
    }
  }, [debouncedSearch, search, setSearchParams]);

  const updateFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      if (value && value !== 'All') prev.set(key, value);
      else prev.delete(key);
      prev.set('page', '1');
      return prev;
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', store, { search: debouncedSearch, category, itemType, approvalRequired, page }],
    queryFn: () => getItems({ store, search: debouncedSearch, category, itemType, approvalRequired, page }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const columns: Column<InventoryItem>[] = [
    {
      key: 'index',
      label: '#',
      render: (_, __, idx: number) => ((page - 1) * 10) + (idx !== undefined ? idx + 1 : 0),
    },
    {
      key: 'item_name',
      label: 'Item Name',
      sortable: true,
      render: (value: string, row) => (
        <button
          onClick={() => navigate(`/inventory/${row.id}`)}
          className="font-medium text-[#0052CC] hover:underline"
        >
          {value}
        </button>
      ),
    },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    {
      key: 'current_stock',
      label: 'Current Stock',
      render: (value: number, row) => (
        <span className={row.current_stock < row.min_stock ? 'font-bold text-red-600' : ''}>{value}</span>
      ),
    },
    { key: 'min_stock', label: 'Min Stock' },
    {
      key: 'approval_required',
      label: 'Approval Required',
      render: (val: boolean) => (
        <Badge text={val ? 'Yes' : 'No'} color={val ? 'orange' : 'gray'} />
      ),
    },
    {
      key: 'item_type',
      label: 'Item Type',
      render: (val: string) => (
        <Badge text={val} color={val === 'Consumable' ? 'blue' : 'purple'} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: InventoryItem) => (
        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button 
            onClick={() => navigate(`/inventory/${row.id}`)}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-[#0052CC]"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          
          {!hasRole(['Audit Officer']) && (
            <>
              <button 
                onClick={() => {
                  setItemFormItem(row);
                  setIsItemFormOpen(true);
                }}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Edit Item"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => setStockInItem(row)}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-600"
                title="Stock In"
              >
                <Plus size={18} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <main className="flex-1 p-6 md:p-8 max-w-container-max mx-auto w-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant pb-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex justify-between items-center w-full">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Inventory</h1>
            <button 
              onClick={() => {
                setItemFormItem(null);
                setIsItemFormOpen(true);
              }}
              className="bg-primary-container text-white px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          {/* Store Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-6 border-b border-transparent w-full">
            {STORES.map((s) => {
              const isActive = store === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => updateFilter('store', s.id)}
                  className={`pb-2 whitespace-nowrap px-1 transition-colors ${
                    isActive 
                      ? 'text-primary-container border-b-2 border-primary-container font-label-bold text-label-bold' 
                      : 'text-on-surface-variant hover:text-on-surface font-label-md text-label-md'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-lg border border-[#E1E4E8] p-4 flex flex-col lg:flex-row gap-4 items-center shadow-sm">
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or SKU" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E1E4E8] rounded-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-shadow bg-surface-container-lowest text-on-surface"
          />
        </div>

        <div className="w-full lg:w-48 flex-shrink-0 relative">
          <select 
            value={category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2 border border-[#E1E4E8] rounded-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none bg-surface-container-lowest"
          >
            <option value="">Category</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="stationery">Stationery</option>
            <option value="medical">Medical</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        <div className="flex items-center bg-slate-100 rounded-md p-1 w-full lg:w-auto overflow-x-auto flex-shrink-0">
          {['All', 'Consumable', 'Non-Consumable'].map((type) => {
            const isActive = itemType === type;
            return (
              <button
                key={type}
                onClick={() => updateFilter('itemType', type)}
                className={`px-4 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-surface-container-lowest shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex w-full items-center justify-end gap-2 lg:w-auto">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={approvalRequired}
              onChange={(event) => updateFilter('approvalRequired', event.target.checked ? 'true' : '')}
              className="rounded border-slate-300 text-primary-container focus:ring-primary-container"
            />
            Approval Required
          </label>
          <button
            type="button"
            title="Filter options"
            className="rounded-md border border-transparent p-2 text-slate-500 transition-colors hover:border-slate-200 hover:bg-slate-100"
          >
            <Funnel size={16} />
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-surface-container-lowest rounded-lg border border-[#E1E4E8] shadow-sm overflow-hidden flex flex-col">
        <DataTable
          columns={columns}
          data={data?.items || []}
          loading={isLoading}
          emptyMessage="No items found for the selected filters."
          pagination={{
            page,
            total: data?.total || 0,
            perPage: 10,
            onChange: (p) => updateFilter('page', p.toString()),
          }}
          rowClassName={(row) => row.current_stock < row.min_stock ? 'group bg-[#FFF0F0] hover:bg-[#ffeaea]' : 'group hover:bg-slate-50 transition-colors'}
        />
      </div>

      {isItemFormOpen && (
        <ItemFormSlideOver
          open
          item={itemFormItem}
          onClose={() => {
            setIsItemFormOpen(false);
            setItemFormItem(null);
          }}
        />
      )}

      {stockInItem && (
        <StockInSlideOver
          open
          item={stockInItem}
          onClose={() => setStockInItem(null)}
        />
      )}
    </main>
  );
};
