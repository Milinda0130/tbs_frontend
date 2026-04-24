import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit2, Mail, Phone, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSuppliers } from '@/api/supplierApi';
import { useDebounce } from '@/hooks/useDebounce';
import { SupplierFormItem, SupplierFormSlideOver } from '@/features/suppliers/components/SupplierFormSlideOver';

interface Supplier extends SupplierFormItem {
  items_count?: number;
  last_purchase_date?: string | null;
}

export function SupplierListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', { search: debouncedSearch }],
    queryFn: () => getSuppliers({ search: debouncedSearch }),
    staleTime: 30_000,
  });

  const suppliers: Supplier[] = useMemo(
    () => ((data?.items ?? data ?? []) as Supplier[]),
    [data],
  );

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col p-6 lg:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-headline-lg text-on-surface">Suppliers</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">Manage vendor relationships and contact information.</p>
        </div>
        <button
          onClick={() => {
            setEditingSupplier(null);
            setOpenForm(true);
          }}
          className="flex items-center gap-2 self-start rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary shadow-sm transition-colors hover:bg-on-primary-fixed-variant md:self-auto"
        >
          <Plus size={16} />
          Add Supplier
        </button>
      </div>

      <div className="mb-8 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
        <div className="relative w-full md:max-w-md">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or contact person..."
            className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 pl-10 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">⌕</span>
        </div>
      </div>

      {isLoading ? (
        <p className="text-body-md text-on-surface-variant">Loading suppliers...</p>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest py-16 text-center">
          <h3 className="mb-2 text-headline-sm text-on-surface">No suppliers found</h3>
          <p className="mb-6 text-body-md text-on-surface-variant">Add your first supplier to start managing inventory sources.</p>
          <button
            onClick={() => {
              setEditingSupplier(null);
              setOpenForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary shadow-sm"
          >
            <Plus size={16} />
            Add Supplier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <article key={supplier.id} className="flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.05)] transition-colors hover:border-primary-fixed-dim">
              <div className="mb-4 flex items-start justify-between">
                <button
                  className="text-left text-headline-sm text-on-surface transition-colors hover:text-primary"
                  onClick={() => navigate(`/suppliers/${supplier.id}`)}
                >
                  {supplier.name}
                </button>
                <button
                  className="rounded-md p-1 text-outline transition-colors hover:bg-surface-container-low hover:text-primary"
                  onClick={() => {
                    setEditingSupplier(supplier);
                    setOpenForm(true);
                  }}
                >
                  <Edit2 size={18} />
                </button>
              </div>

              <div className="mb-6 flex-1 space-y-2 text-body-md text-on-surface-variant">
                <p className="flex items-center gap-2"><User size={15} className="text-outline" />{supplier.contact_person || 'N/A'}</p>
                <p className="flex items-center gap-2"><Phone size={15} className="text-outline" />{supplier.phone || 'N/A'}</p>
                <p className="flex items-center gap-2 break-all"><Mail size={15} className="text-outline" />{supplier.email || 'N/A'}</p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-surface-container-low px-2 py-1 text-[10px] font-label-bold uppercase tracking-wider text-primary-container">
                    {supplier.items_count ?? 0} Items
                  </span>
                  <span className="text-[12px] text-on-surface-variant">Last: {supplier.last_purchase_date || '-'}</span>
                </div>
                <button
                  className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-md text-secondary transition-colors hover:bg-surface-container-low hover:text-on-surface"
                  onClick={() => navigate(`/suppliers/${supplier.id}`)}
                >
                  View
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {openForm && (
        <SupplierFormSlideOver
          open
          supplier={editingSupplier}
          onClose={() => {
            setOpenForm(false);
            setEditingSupplier(null);
          }}
        />
      )}
    </main>
  );
}
