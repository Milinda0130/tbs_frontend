import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Eye, Edit2, Plus, Download } from 'lucide-react';
import { getItems } from '@/api/inventoryApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/stores/AuthContext';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

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
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    queryKey: ['inventory', store, { search: debouncedSearch, category, itemType, page }],
    queryFn: () => getItems({ store, search: debouncedSearch, category, itemType, page }),
    staleTime: 30_000,
  });

  const columns: Column<InventoryItem>[] = [
    {
      key: 'index',
      label: '#',
      render: (_, __, idx: number) => ((page - 1) * 10) + (idx !== undefined ? idx + 1 : 0),
    },
    { key: 'item_name', label: 'Item Name', sortable: true },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'current_stock', label: 'Current Stock' },
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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/inventory/${row.id}`)}
            className="text-on-surface-variant hover:text-primary transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          
          {!hasRole(['Audit Officer']) && (
            <>
              <button 
                onClick={() => {/* Open ItemFormSlideOver */}}
                className="text-on-surface-variant hover:text-primary transition-colors"
                title="Edit Item"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => {/* Open StockInSlideOver */}}
                className="text-on-surface-variant hover:text-primary transition-colors"
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
            {hasRole(['Admin', 'Stock Keeper', 'Inventory Manager', 'Super Admin']) && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary-container text-white px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Item
              </button>
            )}
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
          rowClassName={(row) => row.current_stock < row.min_stock ? 'bg-[#FFF0F0] hover:bg-[#ffeaea]' : 'hover:bg-slate-50 transition-colors'}
        />
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <p className="text-slate-600 mb-6">Form implementation goes here...</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-primary-container text-white rounded hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
