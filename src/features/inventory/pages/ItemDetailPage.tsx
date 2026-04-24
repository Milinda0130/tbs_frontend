import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getItem, getItemMovements } from '@/api/inventoryApi';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/stores/AuthContext';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  
  // Use dummy id if not provided
  const itemId = id || '1';

  const { data: itemResponse, isLoading: itemLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
  });

  const { data: movementsResponse, isLoading: movementsLoading } = useQuery({
    queryKey: ['item-movements', itemId],
    queryFn: () => getItemMovements(itemId),
  });

  if (itemLoading || movementsLoading) {
    return (
      <main className="flex-1 p-gutter md:p-lg overflow-y-auto mt-16 md:mt-0 w-full">
        <Skeleton lines={10} height="40px" />
      </main>
    );
  }

  // Fallbacks if data empty
  const item = itemResponse?.data || {
    item_name: 'Projector Bulb X200',
    sku: 'EQP-042',
    category: 'Electronics',
    unit: 'Piece',
    item_type: 'Non-Consumable',
    store_name: 'Main Store',
    approval_required: true,
    created_at: 'Jan 12, 2024',
    updated_at: 'Oct 24, 2024',
    added_by: 'Sarah Jenkins',
    supplier_name: 'TechVision Solutions',
    supplier_status: 'Active Vendor',
    contact_name: 'David Chen',
    supplier_phone: '+1 555-0192',
    supplier_email: 'd.chen@techvision.com',
    current_stock: 45,
    min_stock: 10
  };

  const movements = movementsResponse?.data || [
    { id: 1, date: 'Oct 24, 2024', type: 'Issued', qty: -2, reference: 'REQ-882', user: 'J. Smith', notes: 'Room 302 replacement.', is_addition: false },
    { id: 2, date: 'Oct 15, 2024', type: 'Stock In', qty: 10, reference: 'PO-441', user: 'S. Jenkins', notes: 'Bulk restock.', is_addition: true },
    { id: 3, date: 'Sep 20, 2024', type: 'Adjustment', qty: -1, reference: 'ADJ-012', user: 'M. Thorne', notes: 'Damaged during audit.', is_addition: false }
  ];

  const currentStock = item.current_stock ?? 0;
  const minStock = item.min_stock ?? 0;
  
  const stockStatus =
    currentStock <= 0 ? 'empty' :
    currentStock < minStock ? 'low' :
    currentStock < minStock * 1.2 ? 'warning' : 'healthy';

  const colorClass = {
    healthy: 'text-[#15803d]',
    warning: 'text-orange-700',
    low: 'text-error',
    empty: 'text-error'
  }[stockStatus] || 'text-[#15803d]';

  const bgClass = {
    healthy: 'bg-[#dcfce7]',
    warning: 'bg-orange-100',
    low: 'bg-error-container',
    empty: 'bg-error-container'
  }[stockStatus] || 'bg-[#dcfce7]';

  const barColorClass = {
    healthy: 'bg-[#15803d]',
    warning: 'bg-orange-500',
    low: 'bg-error',
    empty: 'bg-error'
  }[stockStatus] || 'bg-[#15803d]';

  const percentage = Math.min(100, (currentStock / (minStock * 2 || 20)) * 100);

  return (
    <main className="flex-1 p-gutter md:p-lg overflow-y-auto mt-16 md:mt-0">
      <div className="max-w-container-max mx-auto space-y-md">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex text-label-md text-secondary">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link className="hover:text-primary transition-colors" to="/">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                <Link className="hover:text-primary transition-colors" to="/inventory">Inventory</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                <span className="text-on-surface font-semibold">{item.item_name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-headline-lg text-on-background mb-2">{item.item_name}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-bold text-xs bg-surface-container-high text-on-surface-variant border border-outline-variant">{item.store_name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-bold text-xs bg-surface-container-high text-on-surface-variant border border-outline-variant">{item.category}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-bold text-xs bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe]">{item.item_type}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {hasRole(['Inventory Manager', 'Super Admin']) && (
              <button className="px-4 py-2 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg font-label-md hover:bg-surface-container-low transition-colors shadow-sm">
                Edit Item
              </button>
            )}
            {hasRole(['Inventory Manager', 'Super Admin']) && (
              <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-container transition-colors shadow-sm">
                Stock In
              </button>
            )}
            {hasRole(['Inventory Manager', 'Super Admin']) && (
              <button className="px-4 py-2 bg-surface-container-lowest text-error border border-error rounded-lg font-label-md hover:bg-error-container transition-colors shadow-sm">
                Deactivate Item
              </button>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column (60%) */}
          <div className="lg:col-span-7 space-y-gutter">
            {/* Item Details Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
              <h2 className="font-headline-sm text-on-background mb-sm border-b border-outline-variant pb-2">Item Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="font-label-md text-secondary mb-1">SKU</p>
                  <p className="font-body-md text-on-surface">{item.sku}</p>
                </div>
                <div>
                  <p className="font-label-md text-secondary mb-1">Category</p>
                  <p className="font-body-md text-on-surface">{item.category}</p>
                </div>
                <div>
                  <p className="font-label-md text-secondary mb-1">Unit</p>
                  <p className="font-body-md text-on-surface">{item.unit}</p>
                </div>
                <div>
                  <p className="font-label-md text-secondary mb-1">Item Type</p>
                  <p className="font-body-md text-on-surface">{item.item_type}</p>
                </div>
                <div>
                  <p className="font-label-md text-secondary mb-1">Store</p>
                  <p className="font-body-md text-on-surface">{item.store_name}</p>
                </div>
                <div>
                  <p className="font-label-md text-secondary mb-1">Approval Required</p>
                  {item.approval_required ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-bold text-[10px] bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">Yes</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-bold text-[10px] bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]">No</span>
                  )}
                </div>
                <div className="sm:col-span-2 pt-4 mt-2 border-t border-surface-container-high grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="font-label-md text-secondary mb-1">Date Added</p>
                    <p className="font-body-md text-on-surface-variant text-sm">{item.created_at}</p>
                  </div>
                  <div>
                    <p className="font-label-md text-secondary mb-1">Last Updated</p>
                    <p className="font-body-md text-on-surface-variant text-sm">{item.updated_at}</p>
                  </div>
                  <div>
                    <p className="font-label-md text-secondary mb-1">Added By</p>
                    <p className="font-body-md text-on-surface-variant text-sm">{item.added_by}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Movement History Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="flex justify-between items-center mb-sm border-b border-outline-variant pb-2">
                <h2 className="font-headline-sm text-on-background">Movement History</h2>
                <button className="text-primary hover:text-primary-container font-label-md flex items-center">
                  View All <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-md text-on-surface">
                  <thead className="bg-surface-container-low text-secondary font-label-bold">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium text-right">Qty</th>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium hidden md:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {movements.map((mov: any) => (
                      <tr key={mov.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">{mov.date}</td>
                        <td className="px-4 py-3">
                          {mov.type === 'Issued' && <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-bold text-[10px] bg-error-container text-on-error-container">Issued</span>}
                          {mov.type === 'Stock In' && <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-bold text-[10px] bg-[#dcfce7] text-[#15803d]">Stock In</span>}
                          {mov.type === 'Adjustment' && <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-bold text-[10px] bg-surface-container-high text-on-surface-variant">Adjustment</span>}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${mov.is_addition ? 'text-[#15803d]' : (mov.type === 'Adjustment' ? 'text-secondary' : 'text-error')}`}>
                          {mov.qty > 0 ? `+${mov.qty}` : mov.qty}
                        </td>
                        <td className="px-4 py-3 text-secondary">{mov.reference}</td>
                        <td className="px-4 py-3">{mov.user}</td>
                        <td className="px-4 py-3 text-secondary text-sm hidden md:table-cell">{mov.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (40%) */}
          <div className="lg:col-span-5 space-y-gutter">
            {/* Stock Level Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0_2px_4px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 ${bgClass} opacity-20 rounded-bl-full -z-10`}></div>
              <h2 className="font-headline-sm text-on-background mb-4">Current Stock</h2>
              <div className="flex items-end mb-6">
                <span className={`font-headline-lg ${colorClass} text-5xl mr-3 leading-none`}>{currentStock}</span>
                <span className="font-body-md text-secondary mb-1">Pieces available</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between font-label-md text-secondary">
                  <span>Capacity</span>
                  <span>Min Stock: {minStock}</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden border border-outline-variant/30">
                  <div className={`${barColorClass} h-3 rounded-full transition-all duration-500 ease-in-out`} style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="flex justify-between font-label-bold text-[10px] text-secondary mt-1">
                  <span>0</span>
                  <span>Optimal Level</span>
                </div>
              </div>
            </div>

            {/* Supplier Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
              <h2 className="font-headline-sm text-on-background mb-sm border-b border-outline-variant pb-2">Supplier Information</h2>
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
                </div>
                <div>
                  <Link className="font-headline-sm text-primary hover:text-primary-container hover:underline text-lg" to="/suppliers">{item.supplier_name}</Link>
                  <p className="font-label-md text-secondary mt-1 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#15803d] mr-2"></span> {item.supplier_status}
                  </p>
                </div>
              </div>
              <div className="space-y-3 bg-surface rounded-lg p-4 border border-outline-variant/50">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-secondary mr-3 text-sm">person</span>
                  <div>
                    <p className="font-label-md text-secondary text-[10px] uppercase tracking-wider">Contact Name</p>
                    <p className="font-body-md text-on-surface font-medium">{item.contact_name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-secondary mr-3 text-sm">call</span>
                  <div>
                    <p className="font-label-md text-secondary text-[10px] uppercase tracking-wider">Phone</p>
                    <p className="font-body-md text-on-surface">{item.supplier_phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-secondary mr-3 text-sm">mail</span>
                  <div>
                    <p className="font-label-md text-secondary text-[10px] uppercase tracking-wider">Email</p>
                    <a className="font-body-md text-primary hover:underline" href={`mailto:${item.supplier_email}`}>{item.supplier_email}</a>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 py-2 bg-surface-container-lowest text-primary border border-outline-variant rounded-lg font-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-sm mr-2">receipt_long</span> View Purchase Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
