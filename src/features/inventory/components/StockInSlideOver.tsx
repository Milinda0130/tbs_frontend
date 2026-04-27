import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { stockIn } from '@/api/inventoryApi';

export interface StockInItem {
  id: string;
  item_name: string;
  current_stock: number;
  unit: string;
  supplier_id?: string | null;
}

interface StockInSlideOverProps {
  open: boolean;
  onClose: () => void;
  item: StockInItem | null;
}

export function StockInSlideOver({ open, onClose, item }: StockInSlideOverProps) {
  const queryClient = useQueryClient();
  const [qty, setQty] = useState('');
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().slice(0, 10));
  const [supplier, setSupplier] = useState(item?.supplier_id ?? '');
  const [unitCost, setUnitCost] = useState('');
  const [purchaseOrderRef, setPurchaseOrderRef] = useState('');
  const [notes, setNotes] = useState('');

  const newStockLevel = useMemo(
    () => (item?.current_stock ?? 0) + (Number.parseInt(qty, 10) || 0),
    [item, qty],
  );

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      if (!item) throw new Error('Missing item');
      return stockIn(item.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      if (item) {
        queryClient.invalidateQueries({ queryKey: ['item', item.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      onClose();
    },
  });

  if (!open || !item) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedQty = Number.parseInt(qty, 10);
    if (!parsedQty || parsedQty <= 0) return;

    mutation.mutate({
      quantity_received: parsedQty,
      date_received: dateReceived,
      supplier_id: supplier || undefined,
      unit_cost: unitCost ? Number.parseFloat(unitCost) : undefined,
      purchase_order_reference: purchaseOrderRef || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[680px] overflow-y-auto bg-surface-container-lowest shadow-2xl">
        <form className="flex h-full flex-col" onSubmit={handleSubmit}>
          <header className="flex items-center justify-between border-b border-[#E1E4E8] px-6 py-4">
            <h2 className="text-headline-sm text-on-surface">Stock In Item</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-on-surface-variant hover:bg-slate-100"
              aria-label="Close stock in panel"
            >
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 space-y-6 px-6 py-5">
            <section className="rounded-lg border border-[#E1E4E8] bg-surface-container-low p-4">
              <p className="text-label-md text-on-surface-variant">Inventory Status</p>
              <h3 className="mt-1 text-headline-md text-on-surface">{item.item_name}</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Current stock:{' '}
                <span className="font-semibold text-on-surface">
                  {item.current_stock} {item.unit}
                </span>
              </p>
            </section>

            <section className="space-y-4">
              <div>
                <label className="mb-1 block text-body-md text-on-surface">Quantity Received *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={qty}
                  onChange={(event) => setQty(event.target.value)}
                  className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary"
                />
                <p className="mt-1 text-body-md text-on-surface-variant">
                  New stock level will be:{' '}
                  <span className="font-semibold text-on-surface">
                    {newStockLevel} {item.unit}
                  </span>
                </p>
              </div>

              <div>
                <label className="mb-1 block text-body-md text-on-surface">Date Received *</label>
                <input
                  type="date"
                  required
                  value={dateReceived}
                  onChange={(event) => setDateReceived(event.target.value)}
                  className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-body-md text-on-surface">Supplier</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(event) => setSupplier(event.target.value)}
                  className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary"
                  placeholder="Supplier ID"
                />
              </div>

              <div>
                <label className="mb-1 block text-body-md text-on-surface">Unit Cost</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={unitCost}
                  onChange={(event) => setUnitCost(event.target.value)}
                  className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-1 block text-body-md text-on-surface">Purchase Order Reference</label>
                <input
                  type="text"
                  value={purchaseOrderRef}
                  onChange={(event) => setPurchaseOrderRef(event.target.value)}
                  className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-body-md text-on-surface">Notes</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary"
                />
              </div>
            </section>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-[#E1E4E8] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-outline-variant px-4 py-2 text-body-md text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded bg-primary px-4 py-2 text-body-md text-on-primary disabled:opacity-60"
            >
              {mutation.isPending ? 'Saving...' : 'Save Stock In'}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
