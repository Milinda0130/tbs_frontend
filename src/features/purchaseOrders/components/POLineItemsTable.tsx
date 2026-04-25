import { Plus, Search, X } from 'lucide-react';

export interface LineItemOption {
  id: string;
  item_name: string;
}

export interface POLineItemRow {
  id: string;
  item_id: string;
  item_name: string;
  qty: number;
  unitCost: number;
  qtyReceived?: number;
  dateReceived?: string;
}

interface POLineItemsTableProps {
  lineItems: POLineItemRow[];
  itemOptions: LineItemOption[];
  onAddLine: (item: LineItemOption) => void;
  onUpdateLine: (rowId: string, patch: Partial<POLineItemRow>) => void;
  onRemoveLine: (rowId: string) => void;
}

export function POLineItemsTable({
  lineItems,
  itemOptions,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
}: POLineItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-bright p-sm lg:p-md">
        <h3 className="text-headline-sm text-on-surface">Line Items</h3>
        <div className="flex items-center gap-2">
          <select
            className="rounded border border-outline-variant px-2 py-1 text-body-md"
            onChange={(e) => {
              const item = itemOptions.find((opt) => opt.id === e.target.value);
              if (item) onAddLine(item);
              e.currentTarget.value = '';
            }}
            defaultValue=""
          >
            <option value="">Select item...</option>
            {itemOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.item_name}
              </option>
            ))}
          </select>
          <button className="flex items-center rounded border border-outline-variant px-sm py-xs text-label-bold text-primary-container">
            <Plus size={16} className="mr-base" />
            Add Item
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container-low">
            <tr>
              <th className="w-2/5 p-xs text-label-bold uppercase tracking-wider text-on-surface-variant">Item Name</th>
              <th className="w-1/5 p-xs text-label-bold uppercase tracking-wider text-on-surface-variant">Qty Ordered</th>
              <th className="w-1/5 p-xs text-label-bold uppercase tracking-wider text-on-surface-variant">Unit Cost (LKR)</th>
              <th className="w-1/5 p-xs text-right text-label-bold uppercase tracking-wider text-on-surface-variant">Line Total</th>
              <th className="w-10 p-xs" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {lineItems.map((row) => (
              <tr key={row.id} className="group transition-colors hover:bg-surface-bright">
                <td className="p-xs align-top">
                  <div className="relative">
                    <Search size={16} className="pointer-events-none absolute left-xs top-1/2 -translate-y-1/2 text-outline" />
                    <input
                      value={row.item_name}
                      onChange={(e) => onUpdateLine(row.id, { item_name: e.target.value })}
                      className="w-full rounded border border-outline-variant bg-surface-container-lowest py-xs pl-lg pr-xs text-body-md"
                    />
                  </div>
                </td>
                <td className="p-xs align-top">
                  <input
                    type="number"
                    min={0}
                    value={row.qty}
                    onChange={(e) => onUpdateLine(row.id, { qty: Number(e.target.value || 0) })}
                    className="w-full rounded border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md"
                  />
                </td>
                <td className="p-xs align-top">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.unitCost}
                    onChange={(e) => onUpdateLine(row.id, { unitCost: Number(e.target.value || 0) })}
                    className="w-full rounded border border-outline-variant bg-surface-container-lowest px-sm py-xs text-right text-body-md"
                  />
                </td>
                <td className="p-xs align-top text-right">
                  <div className="rounded border border-transparent bg-surface-bright px-xs py-xs text-body-md text-on-surface">
                    {((row.qty || 0) * (row.unitCost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="p-xs text-center align-top">
                  <button
                    onClick={() => onRemoveLine(row.id)}
                    className="rounded-full p-xs text-outline opacity-0 transition-colors group-hover:opacity-100 hover:bg-error-container hover:text-error"
                  >
                    <X size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {lineItems.length === 0 && (
              <tr>
                <td colSpan={5} className="p-xs text-center text-sm italic text-outline">
                  Click 'Add Item' to insert a row
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
