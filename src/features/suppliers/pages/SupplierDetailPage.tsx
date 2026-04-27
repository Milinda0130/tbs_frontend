import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit2, Plus } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getSupplier, getSupplierPOs } from '@/api/supplierApi';
import { SupplierFormSlideOver } from '@/features/suppliers/components/SupplierFormSlideOver';

interface LinkedItem {
  id: string;
  item_name: string;
  store: string;
  category: string;
  last_purchased: string;
}

interface SupplierPO {
  id: string;
  po_number: string;
  date: string;
  status: string;
  total_amount: number;
  ordered_by: string;
  received_by?: string | null;
}

export function SupplierDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const [editOpen, setEditOpen] = useState(false);

  const { data: supplierData, isLoading: supplierLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplier(id),
    enabled: Boolean(id),
  });

  const { data: supplierPOsData, isLoading: posLoading } = useQuery({
    queryKey: ['supplier-pos', id],
    queryFn: () => getSupplierPOs(id),
    enabled: Boolean(id),
  });

  const supplier = useMemo(() => {
    const fallback = {
      id,
      name: 'TechPro Solutions Inc.',
      contact_person: 'Sarah Jenkins',
      phone: '(555) 123-4567',
      email: 's.jenkins@techpro.com',
      address: '123 Tech Park, Innovation Way, Colombo 00500',
      notes: 'Standard net-30 terms. Preferred vendor for media equipment and computing accessories.',
      linked_items: [] as LinkedItem[],
    };
    return (supplierData?.data ?? supplierData ?? fallback) as typeof fallback;
  }, [supplierData, id]);

  const linkedItems: LinkedItem[] = (supplier as { linked_items?: LinkedItem[] }).linked_items ?? [];
  const poRows: SupplierPO[] = (supplierPOsData?.data ?? supplierPOsData ?? []) as SupplierPO[];

  if (supplierLoading || posLoading) {
    return <main className="p-6 text-body-md text-on-surface-variant">Loading supplier...</main>;
  }

  return (
    <main className="flex-1 overflow-auto p-md md:p-lg">
      <div className="mx-auto max-w-[1440px]">
        <nav className="mb-md flex items-center gap-xs text-body-md text-on-surface-variant">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <span>›</span>
          <Link to="/suppliers" className="transition-colors hover:text-primary">Suppliers</Link>
          <span>›</span>
          <span className="font-semibold text-on-surface">{supplier.name}</span>
        </nav>

        <div className="mb-lg flex flex-col justify-between gap-md md:flex-row md:items-center">
          <h1 className="text-headline-lg text-on-surface">{supplier.name}</h1>
          <div className="flex items-center gap-sm">
            <button onClick={() => setEditOpen(true)} className="flex items-center gap-xs rounded border border-outline bg-transparent px-sm py-xs text-label-md text-on-surface transition-colors hover:bg-surface-variant">
              <Edit2 size={16} /> Edit Supplier
            </button>
            <button onClick={() => navigate(`/purchase-orders/create?supplier=${id}`)} className="flex items-center gap-xs rounded bg-primary px-sm py-xs text-label-md text-on-primary transition-colors hover:bg-primary-container">
              <Plus size={16} /> New Purchase Order
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
            <h2 className="mb-sm border-b border-outline-variant pb-xs text-headline-sm text-on-surface">Contact Information</h2>
            <div className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
              <div><span className="mb-base block text-label-bold text-on-surface-variant">Contact Person</span><span className="text-body-md text-on-surface">{supplier.contact_person || 'N/A'}</span></div>
              <div><span className="mb-base block text-label-bold text-on-surface-variant">Phone</span><span className="text-body-md text-on-surface">{supplier.phone || 'N/A'}</span></div>
              <div><span className="mb-base block text-label-bold text-on-surface-variant">Email</span><span className="text-body-md text-on-surface">{supplier.email || 'N/A'}</span></div>
              <div className="md:col-span-2 lg:col-span-1"><span className="mb-base block text-label-bold text-on-surface-variant">Address</span><span className="text-body-md text-on-surface">{supplier.address || 'N/A'}</span></div>
              <div className="md:col-span-2"><span className="mb-base block text-label-bold text-on-surface-variant">Notes</span><span className="text-body-md text-on-surface">{supplier.notes || 'N/A'}</span></div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
            <div className="border-b border-outline-variant p-md"><h2 className="text-headline-sm text-on-surface">Linked Items</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-md">
                <thead className="bg-surface-container text-on-surface-variant text-label-bold">
                  <tr><th className="px-md py-sm font-normal">Item Name</th><th className="px-md py-sm font-normal">Store</th><th className="px-md py-sm font-normal">Category</th><th className="px-md py-sm font-normal">Last Purchased</th></tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-on-surface">
                  {linkedItems.length === 0 ? (
                    <tr><td className="px-md py-sm text-on-surface-variant" colSpan={4}>No linked items.</td></tr>
                  ) : linkedItems.map((itemRow) => (
                    <tr key={itemRow.id} className="transition-colors hover:bg-surface-variant/50">
                      <td className="px-md py-sm"><Link className="font-semibold text-primary hover:underline" to={`/inventory/${itemRow.id}`}>{itemRow.item_name}</Link></td>
                      <td className="px-md py-sm">{itemRow.store}</td>
                      <td className="px-md py-sm">{itemRow.category}</td>
                      <td className="px-md py-sm text-on-surface-variant">{itemRow.last_purchased}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between border-b border-outline-variant p-md">
              <h2 className="text-headline-sm text-on-surface">Purchase Order History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-md">
                <thead className="bg-surface-container text-on-surface-variant text-label-bold">
                  <tr>
                    <th className="px-md py-sm font-normal">PO Number</th>
                    <th className="px-md py-sm font-normal">Date</th>
                    <th className="px-md py-sm font-normal">Status</th>
                    <th className="px-md py-sm text-right font-normal">Total Amount (LKR)</th>
                    <th className="px-md py-sm font-normal">Ordered By</th>
                    <th className="px-md py-sm font-normal">Received By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-on-surface">
                  {poRows.length === 0 ? (
                    <tr><td className="px-md py-sm text-on-surface-variant" colSpan={6}>No purchase orders for this supplier.</td></tr>
                  ) : poRows.map((po) => (
                    <tr key={po.id} className="transition-colors hover:bg-surface-variant/50">
                      <td className="px-md py-sm"><span className="font-semibold text-primary">{po.po_number}</span></td>
                      <td className="px-md py-sm text-on-surface-variant">{po.date}</td>
                      <td className="px-md py-sm">
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-surface-variant text-on-surface-variant">{po.status}</span>
                      </td>
                      <td className="px-md py-sm text-right font-medium">{Number(po.total_amount ?? 0).toLocaleString()}</td>
                      <td className="px-md py-sm">{po.ordered_by || '-'}</td>
                      <td className="px-md py-sm">{po.received_by || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {editOpen && (
        <SupplierFormSlideOver
          open
          supplier={{
            id: supplier.id,
            name: supplier.name,
            contact_person: supplier.contact_person,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            notes: supplier.notes,
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </main>
  );
}
