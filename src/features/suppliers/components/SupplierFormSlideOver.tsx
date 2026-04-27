import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { createSupplier, updateSupplier } from '@/api/supplierApi';
import { parseApiErrors } from '@/utils/parseApiErrors';

export interface SupplierFormItem {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

interface SupplierFormSlideOverProps {
  open: boolean;
  onClose: () => void;
  supplier?: SupplierFormItem | null;
}

interface SupplierFormState {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const EMPTY_FORM: SupplierFormState = {
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

export function SupplierFormSlideOver({ open, onClose, supplier }: SupplierFormSlideOverProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(supplier?.id);
  const initialForm = useMemo<SupplierFormState>(() => {
    if (!supplier) return EMPTY_FORM;
    return {
      name: supplier.name ?? '',
      contact_person: supplier.contact_person ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? '',
    };
  }, [supplier]);

  const [form, setForm] = useState<SupplierFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      if (isEditMode && supplier?.id) return updateSupplier(supplier.id, payload);
      return createSupplier(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      if (supplier?.id) queryClient.invalidateQueries({ queryKey: ['supplier', supplier.id] });
      onClose();
    },
    onError: (error: unknown) => {
      setFieldErrors(parseApiErrors(error));
    },
  });

  if (!open) return null;

  const setValue = <K extends keyof SupplierFormState>(key: K, value: SupplierFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate({
      name: form.name,
      contact_person: form.contact_person,
      phone: form.phone,
      email: form.email || undefined,
      address: form.address || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[560px] overflow-y-auto border-l border-outline-variant bg-surface-container-lowest shadow-2xl">
        <form className="flex h-full flex-col" onSubmit={onSubmit}>
          <header className="flex items-center justify-between border-b border-outline-variant px-gutter py-sm">
            <h2 className="text-headline-sm text-on-surface">{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</h2>
            <button type="button" onClick={onClose} className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high">
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 space-y-md overflow-y-auto px-gutter py-md">
            <div className="space-y-xs">
              <label className="block text-label-bold text-on-surface">Supplier Name <span className="text-error">*</span></label>
              <input value={form.name} onChange={(e) => setValue('name', e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
              {fieldErrors.name && <p className="text-label-md text-error">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-xs">
              <label className="block text-label-bold text-on-surface">Contact Person <span className="text-error">*</span></label>
              <input value={form.contact_person} onChange={(e) => setValue('contact_person', e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
              {fieldErrors.contact_person && <p className="text-label-md text-error">{fieldErrors.contact_person}</p>}
            </div>

            <div className="space-y-xs">
              <label className="block text-label-bold text-on-surface">Phone <span className="text-error">*</span></label>
              <input value={form.phone} onChange={(e) => setValue('phone', e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
              {fieldErrors.phone && <p className="text-label-md text-error">{fieldErrors.phone}</p>}
            </div>

            <div className="space-y-xs">
              <label className="block text-label-bold text-on-surface">Email</label>
              <input type="email" value={form.email} onChange={(e) => setValue('email', e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            <div className="space-y-xs">
              <label className="block text-label-bold text-on-surface">Address</label>
              <textarea rows={3} value={form.address} onChange={(e) => setValue('address', e.target.value)} className="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            <div className="space-y-xs">
              <label className="block text-label-bold text-on-surface">Notes</label>
              <textarea rows={4} value={form.notes} onChange={(e) => setValue('notes', e.target.value)} className="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <footer className="flex items-center justify-end gap-sm border-t border-outline-variant px-gutter py-sm">
            <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-sm py-xs text-label-bold text-on-surface-variant hover:bg-surface-container-low">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-primary px-sm py-xs text-label-bold text-on-primary hover:bg-primary-container disabled:opacity-60">
              {mutation.isPending ? 'Saving...' : 'Save Supplier'}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
