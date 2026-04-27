import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Download, FilePlus2 } from 'lucide-react';
import { getLowStock } from '@/api/inventoryApi';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StockInItem, StockInSlideOver } from '@/features/inventory/components/StockInSlideOver';

interface LowStockItem extends StockInItem {
  sku: string;
  store_name: string;
  category: string;
  min_stock: number;
}

const STORE_FILTERS = [
  { value: 'all', label: 'All Stores' },
  { value: 'main', label: 'Main Store' },
  { value: 'nursing', label: 'Nursing Stock' },
  { value: 'hospitality', label: 'Hospitality Stock' },
  { value: 'media', label: 'Media Equipment' },
];

export function LowStockPage() {
  const navigate = useNavigate();
  const [store, setStore] = useState('all');
  const [category, setCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['low-stock', { store }],
    queryFn: () => getLowStock(store === 'all' ? {} : { store }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const rows: LowStockItem[] = useMemo(() => {
    const list = (data?.items ?? data ?? []) as LowStockItem[];
    return [...list].sort(
      (a, b) => b.min_stock - b.current_stock - (a.min_stock - a.current_stock),
    );
  }, [data]);

  const categoryOptions = useMemo(() => {
    const unique = new Set(
      rows
        .map((row) => row.category)
        .filter((value): value is string => Boolean(value?.trim())),
    );
    return ['all', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (category === 'all') return rows;
    return rows.filter((row) => row.category === category);
  }, [rows, category]);

  const columns: Column<LowStockItem>[] = [
    { key: 'item_name', label: 'Item Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'store_name', label: 'Store' },
    { key: 'category', label: 'Category' },
    {
      key: 'current_stock',
      label: 'Current Stock',
      render: (value) => <span className="font-semibold text-red-600">{value}</span>,
    },
    { key: 'min_stock', label: 'Min Stock' },
    {
      key: 'shortage',
      label: 'Shortage',
      render: (_value, row) => (
        <span className="font-semibold text-red-600">
          Need {Math.max(row.min_stock - row.current_stock, 0)} more
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (_value, row) => (
        <button
          onClick={() => setSelectedItem(row)}
          className="rounded bg-primary px-3 py-1.5 text-label-md text-on-primary"
        >
          Stock In
        </button>
      ),
    },
  ];

  const handleExportList = () => {
    const header = [
      'Item Name',
      'SKU',
      'Store',
      'Category',
      'Current Stock',
      'Min Stock',
      'Shortage',
    ];
    const body = filteredRows.map((row) => [
      row.item_name,
      row.sku,
      row.store_name,
      row.category,
      String(row.current_stock),
      String(row.min_stock),
      String(Math.max(row.min_stock - row.current_stock, 0)),
    ]);

    const csv = [header, ...body]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `low-stock-${store}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto flex w-full max-w-container-max flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-headline-lg text-on-surface">Low Stock Alerts</h1>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#FFF0F0] px-2 text-label-md text-red-600">
            {filteredRows.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportList}
            className="inline-flex items-center gap-2 rounded border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-md text-on-surface hover:bg-slate-50"
          >
            <Download size={16} />
            Export List
          </button>
          <button
            type="button"
            onClick={() => navigate('/purchase-orders/create')}
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-body-md text-on-primary hover:bg-primary-container"
          >
            <FilePlus2 size={16} />
            Generate Order
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E4E8] pb-3">
        <div className="flex flex-wrap gap-2">
          {STORE_FILTERS.map((tab) => {
            const active = tab.value === store;
            return (
              <button
                key={tab.value}
                onClick={() => setStore(tab.value)}
                className={`rounded px-3 py-2 text-body-md ${
                  active
                    ? 'border-b-2 border-[#0052CC] text-[#0052CC]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="low-stock-category" className="text-body-md text-on-surface-variant">
            Category:
          </label>
          <select
            id="low-stock-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded border border-[#E1E4E8] bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Categories' : option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        loading={isLoading}
        emptyMessage="All stock levels are healthy."
        rowClassName={() => 'bg-[#FFF0F0]'}
      />

      {!isLoading && filteredRows.length === 0 && (
        <div className="rounded-lg border border-[#E1E4E8] bg-white p-8 text-center">
          <div className="mx-auto mb-3 w-fit rounded-full bg-green-100 p-2 text-green-700">
            <AlertTriangle size={18} />
          </div>
          <p className="text-body-lg text-on-surface">All stock levels are healthy.</p>
        </div>
      )}

      {selectedItem && (
        <StockInSlideOver
          open
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </main>
  );
}
