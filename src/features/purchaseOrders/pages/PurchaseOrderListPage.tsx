import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Eye, Filter, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPurchaseOrders } from '@/api/purchaseOrderApi';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

interface PurchaseOrderRow {
  id: string;
  po_number: string;
  supplier_name: string;
  order_date: string;
  status: 'Draft' | 'Ordered' | 'Received' | 'Cancelled';
  total_amount: number;
  ordered_by: string;
  received_by?: string | null;
}

const STATUS_TABS = ['All Orders', 'Draft', 'Ordered', 'Received', 'Cancelled'] as const;

export function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || 'All Orders';
  const supplier = searchParams.get('supplier') || '';
  const dateRange = searchParams.get('dateRange') || '';
  const page = Number(searchParams.get('page') || '1');

  const setFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      if (value && value !== 'All Orders') prev.set(key, value);
      else prev.delete(key);
      if (key !== 'page') prev.set('page', '1');
      return prev;
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', status, { supplier, dateRange, page }],
    queryFn: () => getPurchaseOrders({ status: status === 'All Orders' ? undefined : status, supplier, dateRange, page }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const rows: PurchaseOrderRow[] = useMemo(() => ((data?.items ?? data ?? []) as PurchaseOrderRow[]), [data]);

  const columns: Column<PurchaseOrderRow>[] = [
    { key: 'po_number', label: 'PO NUMBER', render: (value: string) => <span className="font-medium text-primary">{value}</span> },
    { key: 'supplier_name', label: 'SUPPLIER' },
    { key: 'order_date', label: 'ORDER DATE' },
    {
      key: 'status',
      label: 'STATUS',
      render: (value: PurchaseOrderRow['status']) => (
        <Badge
          text={value}
          color={value === 'Draft' ? 'gray' : value === 'Ordered' ? 'blue' : value === 'Received' ? 'green' : 'red'}
        />
      ),
    },
    { key: 'total_amount', label: 'TOTAL AMOUNT', render: (value: number) => <span className="font-medium">{value.toLocaleString()} LKR</span> },
    { key: 'ordered_by', label: 'ORDERED BY' },
    { key: 'received_by', label: 'RECEIVED BY', render: (v: string | null | undefined) => v || '-' },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (_value, row) => (
        <div className="text-center">
          <button onClick={() => navigate(`/purchase-orders/${row.id}/edit`)} className="text-outline hover:text-primary">
            <Eye size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <main className="ml-0 flex-1 p-8 md:ml-0">
      <div className="mx-auto max-w-[1440px] space-y-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-headline-lg text-on-surface">Purchase Orders</h1>
          <button onClick={() => navigate('/purchase-orders/create')} className="flex items-center gap-2 rounded bg-primary px-6 py-2 text-label-md text-on-primary shadow-sm">
            <Plus size={16} />
            New Purchase Order
          </button>
        </div>

        <div className="space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <div className="flex gap-8 border-b border-outline-variant">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter('status', tab)}
                className={`pb-3 text-label-md ${status === tab ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-on-surface-variant hover:text-on-surface'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-4">
            <div className="max-w-xs flex-1">
              <label className="mb-2 block text-label-bold text-on-surface-variant">SUPPLIER</label>
              <input value={supplier} onChange={(e) => setFilter('supplier', e.target.value)} placeholder="All Suppliers" className="w-full rounded border border-outline-variant px-3 py-2 text-body-md" />
            </div>
            <div className="max-w-xs flex-1">
              <label className="mb-2 block text-label-bold text-on-surface-variant">DATE RANGE</label>
              <input value={dateRange} onChange={(e) => setFilter('dateRange', e.target.value)} placeholder="Select dates..." className="w-full rounded border border-outline-variant px-3 py-2 text-body-md" />
            </div>
            <button className="flex items-center gap-2 rounded border border-outline-variant px-4 py-2 text-label-md text-on-surface">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          emptyMessage="No purchase orders found."
          pagination={{
            page,
            total: data?.total ?? rows.length,
            perPage: 10,
            onChange: (p) => setFilter('page', String(p)),
          }}
          rowClassName={() => 'hover:bg-surface-container-low'}
        />
      </div>
    </main>
  );
}
