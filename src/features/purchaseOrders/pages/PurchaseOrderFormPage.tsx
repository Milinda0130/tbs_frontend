import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createPurchaseOrder, getPurchaseOrder, receivePurchaseOrder, updatePurchaseOrder } from '@/api/purchaseOrderApi';
import { getItems } from '@/api/inventoryApi';
import { getSuppliers } from '@/api/supplierApi';
import { LineItemOption, POLineItemRow, POLineItemsTable } from '@/features/purchaseOrders/components/POLineItemsTable';

type POStatus = 'Draft' | 'Ordered' | 'Received' | 'Cancelled';

interface SupplierOption {
  id: string;
  name: string;
}

interface InitialPOState {
  supplierId: string;
  orderDate: string;
  status: POStatus;
  notes: string;
  lineItems: POLineItemRow[];
}

function PurchaseOrderFormContent({
  editing,
  id,
  initialState,
}: {
  editing: boolean;
  id?: string;
  initialState: InitialPOState;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [supplierId, setSupplierId] = useState(initialState.supplierId);
  const [orderDate, setOrderDate] = useState(initialState.orderDate);
  const [status, setStatus] = useState<POStatus>(initialState.status);
  const [notes, setNotes] = useState(initialState.notes);
  const [lineItems, setLineItems] = useState<POLineItemRow[]>(initialState.lineItems);

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => getSuppliers({ perPage: 200 }),
  });

  const { data: itemsData } = useQuery({
    queryKey: ['inventory', 'po-item-options'],
    queryFn: () => getItems({ perPage: 500 }),
  });

  const supplierOptions: SupplierOption[] = ((suppliersData?.items ?? suppliersData ?? []) as SupplierOption[]);
  const inventoryOptions = ((itemsData?.items ?? itemsData ?? []) as Array<{ id: string; item_name: string }>);

  const availableItemOptions: LineItemOption[] = inventoryOptions
    .filter((item) => !lineItems.some((line) => line.item_id === item.id))
    .map((item) => ({ id: item.id, item_name: item.item_name }));

  const grandTotal = useMemo(
    () => lineItems.reduce((sum, line) => sum + ((line.qty || 0) * (line.unitCost || 0)), 0),
    [lineItems],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing && id ? updatePurchaseOrder(id, payload) : createPurchaseOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      if (editing && id) queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      navigate('/purchase-orders');
    },
  });

  const receiveMutation = useMutation({
    mutationFn: () =>
      receivePurchaseOrder(id as string, {
        items: lineItems.map((line) => ({
          item_id: line.item_id,
          qty_received: line.qtyReceived ?? 0,
          date_received: line.dateReceived || new Date().toISOString().slice(0, 10),
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      navigate('/purchase-orders');
    },
  });

  const handleSave = (nextStatus: POStatus) => {
    saveMutation.mutate({
      supplier_id: supplierId,
      order_date: orderDate,
      status: nextStatus,
      notes: notes || undefined,
      line_items: lineItems.map((line) => ({
        item_id: line.item_id,
        qty_ordered: line.qty,
        unit_cost: line.unitCost,
      })),
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleSave(status);
  };

  return (
    <main className="w-full max-w-[1440px] flex-1 overflow-y-auto p-gutter lg:p-lg">
      <div className="mb-lg">
        <nav className="mb-xs flex text-label-md text-on-surface-variant">
          <ol className="inline-flex items-center space-x-2">
            <li><Link to="/" className="hover:text-primary-container">Home</Link></li>
            <li>›</li>
            <li><Link to="/purchase-orders" className="hover:text-primary-container">Purchase Orders</Link></li>
            <li>›</li>
            <li className="text-on-surface">{editing ? 'Edit PO' : 'New PO'}</li>
          </ol>
        </nav>
        <h2 className="text-headline-lg text-on-surface">{editing ? 'Edit Purchase Order' : 'Create New Purchase Order'}</h2>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-gutter xl:grid-cols-3">
        <div className="space-y-gutter xl:col-span-1">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-sm lg:p-md shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
            <h3 className="mb-md text-headline-sm text-on-surface">Order Details</h3>
            <div className="space-y-sm">
              <div>
                <label className="mb-base block text-label-bold text-on-surface">Supplier *</label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full rounded border border-outline-variant px-sm py-xs text-body-md">
                  <option value="">Select supplier</option>
                  {supplierOptions.map((sup) => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-base block text-label-bold text-on-surface">Order Date</label>
                <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="w-full rounded border border-outline-variant px-sm py-xs text-body-md" />
              </div>
              <div>
                <label className="mb-base block text-label-bold text-on-surface">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as POStatus)} className="w-full rounded border border-outline-variant px-sm py-xs text-body-md">
                  <option value="Draft">Draft</option>
                  <option value="Ordered">Ordered</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="mb-base block text-label-bold text-on-surface">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full resize-none rounded border border-outline-variant px-sm py-xs text-body-md" />
              </div>
            </div>
          </section>

          {editing && status === 'Received' && (
            <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-sm lg:p-md shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
              <h3 className="mb-sm text-headline-sm text-on-surface">Record Receipt</h3>
              <div className="space-y-sm">
                {lineItems.map((line) => (
                  <div key={`receive-${line.id}`} className="grid grid-cols-1 gap-xs rounded border border-outline-variant bg-surface-bright p-xs sm:grid-cols-3">
                    <div>
                      <label className="mb-base block text-[10px] font-label-bold uppercase text-on-surface-variant">Item</label>
                      <div className="truncate text-body-md text-on-surface">{line.item_name}</div>
                    </div>
                    <div>
                      <label className="mb-base block text-[10px] font-label-bold uppercase text-on-surface-variant">Qty Received</label>
                      <input
                        type="number"
                        min={0}
                        value={line.qtyReceived ?? 0}
                        onChange={(e) => setLineItems((prev) => prev.map((it) => (it.id === line.id ? { ...it, qtyReceived: Number(e.target.value || 0) } : it)))}
                        className="w-full rounded border border-outline-variant px-xs py-xs text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-base block text-[10px] font-label-bold uppercase text-on-surface-variant">Date Received</label>
                      <input
                        type="date"
                        value={line.dateReceived || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setLineItems((prev) => prev.map((it) => (it.id === line.id ? { ...it, dateReceived: e.target.value } : it)))}
                        className="w-full rounded border border-outline-variant px-xs py-xs text-sm"
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => receiveMutation.mutate()} className="mt-sm w-full rounded bg-primary-container px-sm py-xs text-label-bold text-on-primary">
                  Confirm Receipt
                </button>
              </div>
            </section>
          )}
        </div>

        <div className="xl:col-span-2">
          <POLineItemsTable
            lineItems={lineItems}
            itemOptions={availableItemOptions}
            onAddLine={(item) => {
              setLineItems((prev) => [...prev, { id: `${Date.now()}-${item.id}`, item_id: item.id, item_name: item.item_name, qty: 1, unitCost: 0 }]);
            }}
            onUpdateLine={(rowId, patch) => {
              setLineItems((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
            }}
            onRemoveLine={(rowId) => {
              setLineItems((prev) => prev.filter((row) => row.id !== rowId));
            }}
          />
          <div className="mt-0 flex justify-end border border-t-0 border-outline-variant bg-surface-container-low p-sm lg:p-md">
            <div className="flex items-center gap-md">
              <span className="text-label-bold uppercase text-on-surface-variant">Grand Total (LKR)</span>
              <span className="text-headline-md text-primary-container">{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="col-span-full mt-lg flex flex-col items-center justify-between gap-sm border-t border-outline-variant pt-sm sm:flex-row">
          <button type="button" onClick={() => navigate('/purchase-orders')} className="w-full rounded border border-outline-variant px-md py-xs text-label-bold text-on-surface-variant hover:bg-surface-container-low sm:w-auto">
            Cancel
          </button>
          <div className="flex w-full flex-col gap-sm sm:w-auto sm:flex-row">
            <button type="button" onClick={() => handleSave('Draft')} className="w-full rounded bg-surface-variant px-md py-xs text-label-bold text-on-surface hover:bg-surface-dim sm:w-auto">
              Save as Draft
            </button>
            <button type="submit" className="w-full rounded bg-primary-container px-md py-xs text-label-bold text-on-primary hover:opacity-90 sm:w-auto">
              Save as Ordered
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

export function PurchaseOrderFormPage() {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const editing = Boolean(id);
  const presetSupplier = searchParams.get('supplier') || '';

  const { data: poData, isLoading } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => getPurchaseOrder(id as string),
    enabled: editing,
  });

  if (editing && isLoading) {
    return <main className="p-6 text-body-md text-on-surface-variant">Loading purchase order...</main>;
  }

  const po = (poData?.data ?? poData ?? null) as
    | {
        supplier_id?: string;
        order_date?: string;
        status?: POStatus;
        notes?: string;
        line_items?: Array<{ id: string; item_id: string; item_name: string; qty_ordered: number; unit_cost: number }>;
      }
    | null;

  const initialState: InitialPOState = editing && po
    ? {
        supplierId: po.supplier_id ?? '',
        orderDate: po.order_date ?? new Date().toISOString().slice(0, 10),
        status: po.status ?? 'Draft',
        notes: po.notes ?? '',
        lineItems: (po.line_items ?? []).map((line) => ({
          id: line.id,
          item_id: line.item_id,
          item_name: line.item_name,
          qty: line.qty_ordered,
          unitCost: line.unit_cost,
          qtyReceived: 0,
          dateReceived: new Date().toISOString().slice(0, 10),
        })),
      }
    : {
        supplierId: presetSupplier,
        orderDate: new Date().toISOString().slice(0, 10),
        status: 'Draft',
        notes: '',
        lineItems: [],
      };

  return <PurchaseOrderFormContent key={id || 'create'} editing={editing} id={id} initialState={initialState} />;
}
