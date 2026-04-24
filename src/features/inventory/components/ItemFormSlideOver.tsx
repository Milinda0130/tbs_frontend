import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { createItem, updateItem } from '@/api/inventoryApi';
import { parseApiErrors } from '@/utils/parseApiErrors';

type ItemType = 'Consumable' | 'Non-Consumable';

const STORE_OPTIONS = [
  { value: 'main', label: 'Main Store' },
  { value: 'nursing', label: 'Nursing Stock' },
  { value: 'hospitality', label: 'Hospitality Stock' },
  { value: 'media', label: 'Media Equipment Store' },
];

const CATEGORY_OPTIONS = ['Electronics', 'Furniture', 'Stationery', 'Medical'];
const UNIT_OPTIONS = ['Piece', 'Box', 'Ream', 'Unit'];
const SUPPLIER_OPTIONS = [
  { value: '1', label: 'TechVision Solutions' },
  { value: '2', label: 'Campus Supplies Lanka' },
  { value: '3', label: 'Medline Traders' },
];

interface FormState {
  item_name: string;
  sku: string;
  category: string;
  unit: string;
  store: string;
  item_type: ItemType;
  initial_stock: string;
  min_stock: string;
  supplier_id: string;
  serial_number: string;
  approval_required: boolean;
  notes: string;
}

export interface ItemFormItem {
  id: string;
  item_name: string;
  sku: string;
  category: string;
  unit: string;
  store?: string;
  store_name?: string;
  item_type: ItemType;
  min_stock: number;
  supplier_id?: string | null;
  serial_number?: string | null;
  approval_required: boolean;
  notes?: string | null;
}

interface ItemFormSlideOverProps {
  open: boolean;
  onClose: () => void;
  item?: ItemFormItem | null;
}

const EMPTY_FORM: FormState = {
  item_name: '',
  sku: '',
  category: '',
  unit: '',
  store: 'main',
  item_type: 'Consumable',
  initial_stock: '',
  min_stock: '',
  supplier_id: '',
  serial_number: '',
  approval_required: false,
  notes: '',
};

function mapStoreNameToValue(storeName?: string) {
  const normalized = storeName?.toLowerCase() ?? '';
  if (normalized.includes('nursing')) return 'nursing';
  if (normalized.includes('hospitality')) return 'hospitality';
  if (normalized.includes('media')) return 'media';
  return 'main';
}

export function ItemFormSlideOver({ open, onClose, item }: ItemFormSlideOverProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(item?.id);
  const initialForm = useMemo<FormState>(() => {
    if (!item) return EMPTY_FORM;
    return {
      item_name: item.item_name ?? '',
      sku: item.sku ?? '',
      category: item.category ?? '',
      unit: item.unit ?? '',
      store: item.store ?? mapStoreNameToValue(item.store_name),
      item_type: item.item_type ?? 'Consumable',
      initial_stock: '',
      min_stock: String(item.min_stock ?? ''),
      supplier_id: item.supplier_id ?? '',
      serial_number: item.serial_number ?? '',
      approval_required: Boolean(item.approval_required),
      notes: item.notes ?? '',
    };
  }, [item]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const selectedStore = useMemo(() => form.store, [form.store]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      if (isEditMode && item?.id) {
        return updateItem(item.id, payload);
      }
      return createItem(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      onClose();
    },
    onError: (error: unknown) => {
      setFieldErrors(parseApiErrors(error));
    },
  });

  if (!open) return null;

  const setValue = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    mutation.mutate({
      item_name: form.item_name,
      sku: form.sku,
      category: form.category,
      unit: form.unit,
      store: form.store,
      item_type: form.item_type,
      ...(isEditMode ? {} : { initial_stock: Number(form.initial_stock || 0) }),
      min_stock: Number(form.min_stock || 0),
      supplier_id: form.supplier_id || undefined,
      serial_number: selectedStore === 'media' ? form.serial_number || undefined : undefined,
      approval_required: form.approval_required,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[680px] overflow-y-auto bg-surface-container-lowest shadow-2xl">
        <form className="flex h-full flex-col" onSubmit={handleSubmit}>
          <header className="flex items-center justify-between border-b border-[#E1E4E8] px-6 py-4">
            <h2 className="text-headline-sm text-on-surface">{isEditMode ? 'Edit Item' : 'Add New Item'}</h2>
            <button type="button" onClick={onClose} className="rounded p-1 text-on-surface-variant hover:bg-slate-100">
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 space-y-6 px-6 py-5">
            <section className="space-y-4">
              <h3 className="text-label-bold text-on-surface-variant">BASIC INFO</h3>
              <div>
                <label className="mb-1 block text-body-md text-on-surface">Item Name *</label>
                <input value={form.item_name} onChange={(e) => setValue('item_name', e.target.value)} className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary" />
                {fieldErrors.item_name && <p className="mt-1 text-label-md text-error">{fieldErrors.item_name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-body-md text-on-surface">SKU/Item Code *</label>
                <input value={form.sku} onChange={(e) => setValue('sku', e.target.value)} className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary" />
                {fieldErrors.sku && <p className="mt-1 text-label-md text-error">{fieldErrors.sku}</p>}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-label-bold text-on-surface-variant">CLASSIFICATION</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-body-md text-on-surface">Category</label>
                  <select value={form.category} onChange={(e) => setValue('category', e.target.value)} className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary">
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-body-md text-on-surface">Unit of Measure</label>
                  <select value={form.unit} onChange={(e) => setValue('unit', e.target.value)} className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary">
                    <option value="">Select unit</option>
                    {UNIT_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-body-md text-on-surface">Store Assignment</label>
                  <select
                    value={form.store}
                    onChange={(e) => {
                      const storeValue = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        store: storeValue,
                        serial_number: storeValue === 'media' ? prev.serial_number : '',
                      }));
                    }}
                    className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary"
                  >
                    {STORE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-body-md text-on-surface">Item Type</label>
                  <div className="flex rounded-md bg-slate-100 p-1">
                    {(['Consumable', 'Non-Consumable'] as ItemType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue('item_type', type)}
                        className={`flex-1 rounded px-3 py-1.5 text-body-md ${form.item_type === type ? 'bg-white shadow-sm' : 'text-on-surface-variant'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-label-bold text-on-surface-variant">STOCK SETTINGS</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {!isEditMode && (
                  <div>
                    <label className="mb-1 block text-body-md text-on-surface">Initial Stock Quantity</label>
                    <input type="number" min={0} value={form.initial_stock} onChange={(e) => setValue('initial_stock', e.target.value)} className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary" />
                    {fieldErrors.initial_stock && <p className="mt-1 text-label-md text-error">{fieldErrors.initial_stock}</p>}
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-body-md text-on-surface">Minimum Stock Level</label>
                  <input type="number" min={0} value={form.min_stock} onChange={(e) => setValue('min_stock', e.target.value)} className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary" />
                  {fieldErrors.min_stock && <p className="mt-1 text-label-md text-error">{fieldErrors.min_stock}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-body-md text-on-surface">Supplier</label>
                  <select value={form.supplier_id} onChange={(e) => setValue('supplier_id', e.target.value)} className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary">
                    <option value="">Select supplier</option>
                    {SUPPLIER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>

              {selectedStore === 'media' && (
                <div className="overflow-hidden transition-all duration-200">
                  <label className="mb-1 block text-body-md text-on-surface">Serial Number</label>
                  <input value={form.serial_number} onChange={(e) => setValue('serial_number', e.target.value)} className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary" />
                  {fieldErrors.serial_number && <p className="mt-1 text-label-md text-error">{fieldErrors.serial_number}</p>}
                </div>
              )}

              <label className="flex items-center gap-3 text-body-md text-on-surface">
                <input
                  type="checkbox"
                  checked={form.approval_required}
                  onChange={(e) => setValue('approval_required', e.target.checked)}
                  className="peer h-5 w-9 appearance-none rounded-full bg-slate-300 p-0.5 transition after:block after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-primary peer-checked:after:translate-x-4"
                />
                Approval Required
              </label>

              <div>
                <label className="mb-1 block text-body-md text-on-surface">Notes</label>
                <textarea rows={4} value={form.notes} onChange={(e) => setValue('notes', e.target.value)} className="w-full rounded border border-[#E1E4E8] px-3 py-2 text-body-md outline-none focus:border-primary" />
              </div>
            </section>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-[#E1E4E8] px-6 py-4">
            <button type="button" onClick={onClose} className="rounded border border-outline-variant px-4 py-2 text-body-md text-on-surface">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="rounded bg-primary px-4 py-2 text-body-md text-on-primary disabled:opacity-60">
              {mutation.isPending ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
