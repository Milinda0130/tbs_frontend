import React, { useState, useEffect } from 'react';
import { X, Search, Calendar, Info, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../api/axiosInstance';
import { cn } from '../../../lib/utils';

interface Store {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  stock_quantity: number;
  unit: string;
}

interface WasteLogSlideOverProps {
  open: boolean;
  onClose: () => void;
}

const WasteLogSlideOver: React.FC<WasteLogSlideOverProps> = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [wasteType, setWasteType] = useState<'Expired' | 'Damaged'>('Expired');
  const [quantity, setQuantity] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Stores
  const { data: stores } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      // Mock stores
      return [
        { id: 1, name: 'Main Campus Store' },
        { id: 2, name: 'Media Equipment Store' },
        { id: 3, name: 'Chemistry Lab' }
      ];
    }
  });

  // Fetch Items based on store
  const { data: items } = useQuery<Item[]>({
    queryKey: ['inventory', selectedStore],
    queryFn: async () => {
      if (!selectedStore) return [];
      // Mock items based on store
      return [
        { id: 101, name: 'Nitrile Gloves, Medium (Box of 100)', stock_quantity: 45, unit: 'units' },
        { id: 102, name: 'Lab Coat (Large)', stock_quantity: 12, unit: 'units' },
        { id: 103, name: 'Safety Goggles', stock_quantity: 24, unit: 'units' }
      ];
    },
    enabled: !!selectedStore
  });

  useEffect(() => {
    setSelectedItem(null);
    setQuantity('');
  }, [selectedStore]);

  const wasteMutation = useMutation({
    mutationFn: async (data: any) => axiosInstance.post('/api/waste-logs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;
    
    wasteMutation.mutate({
      store_id: selectedStore,
      item_id: selectedItem.id,
      type: wasteType,
      quantity: parseFloat(quantity),
      date: incidentDate,
      notes
    });
  };

  const isOverStock = selectedItem ? parseFloat(quantity) > selectedItem.stock_quantity : false;
  const isFormValid = selectedStore && selectedItem && quantity && !isOverStock && notes.trim() !== '';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
        <div className="w-screen max-w-xl bg-white shadow-2xl pointer-events-auto flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-6 border-b border-outline_variant flex items-center justify-between">
            <h2 className="text-xl font-bold text-on_surface flex items-center gap-2">
              Log Waste / Damage
            </h2>
            <button onClick={onClose} className="p-2 text-outline hover:text-on_surface transition-colors rounded-full hover:bg-surface_container">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <form id="waste-log-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            {/* Store Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on_surface_variant uppercase tracking-wider flex items-center gap-1.5">
                Store <span className="text-error">*</span>
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline_variant rounded-lg text-sm font-medium focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">Select a store...</option>
                {stores?.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            {/* Item Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on_surface_variant uppercase tracking-wider flex items-center gap-1.5">
                Item <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={selectedItem ? selectedItem.name : searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSelectedItem(null)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-outline_variant rounded-lg text-sm font-medium focus:outline-none focus:border-primary transition-all"
                  disabled={!selectedStore}
                />
                
                {/* Search Results Dropdown */}
                {searchQuery && !selectedItem && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-outline_variant rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {items?.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                      <div 
                        key={item.id} 
                        className="px-4 py-3 hover:bg-surface_container_low cursor-pointer flex justify-between items-center transition-colors"
                        onClick={() => {
                          setSelectedItem(item);
                          setSearchQuery('');
                        }}
                      >
                        <span className="text-sm font-medium text-on_surface">{item.name}</span>
                        <span className="text-[10px] font-bold text-outline uppercase">{item.stock_quantity} {item.unit} left</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Waste Type Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on_surface_variant uppercase tracking-wider flex items-center gap-1.5">
                Waste Type <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setWasteType('Expired')}
                  className={cn(
                    "py-3 px-4 text-sm font-bold rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    wasteType === 'Expired' 
                      ? "bg-red-50 border-error text-error shadow-sm" 
                      : "bg-white border-outline_variant text-on_surface_variant hover:bg-surface_container_low"
                  )}
                >
                  Expired
                </button>
                <button
                  type="button"
                  onClick={() => setWasteType('Damaged')}
                  className={cn(
                    "py-3 px-4 text-sm font-bold rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    wasteType === 'Damaged' 
                      ? "bg-amber-50 border-warning text-warning shadow-sm" 
                      : "bg-white border-outline_variant text-on_surface_variant hover:bg-surface_container_low"
                  )}
                >
                  Damaged
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on_surface_variant uppercase tracking-wider flex items-center gap-1.5">
                  Quantity <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 bg-white border rounded-lg text-sm font-bold focus:outline-none transition-all",
                    isOverStock ? "border-error focus:border-error" : "border-outline_variant focus:border-primary"
                  )}
                  placeholder="2"
                  required
                />
                {selectedItem && (
                  <div className="flex items-start gap-2 pt-1 animate-fade-in">
                    <Info className="w-3.5 h-3.5 text-[#003d9b] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#003d9b] font-medium leading-tight">
                      Current stock: {selectedItem.stock_quantity} {selectedItem.unit}. This will deduct from stock.
                    </p>
                  </div>
                )}
                {isOverStock && (
                  <p className="text-[11px] text-error font-bold mt-1">
                    Cannot exceed current stock of {selectedItem?.stock_quantity}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on_surface_variant uppercase tracking-wider flex items-center gap-1.5">
                  Date of Incident <span className="text-error">*</span>
                </label>
                <div className="relative group">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-outline_variant rounded-lg text-sm font-bold focus:outline-none focus:border-primary transition-all pr-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on_surface_variant uppercase tracking-wider flex items-center gap-1.5">
                Notes / Reason <span className="text-error">*</span>
              </label>
              <textarea
                placeholder={wasteType === 'Expired' ? 'Enter batch number or expiry reason.' : 'Describe the damage in detail.'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 bg-white border border-outline_variant rounded-lg text-sm font-medium focus:outline-none focus:border-primary transition-all min-h-[120px]"
                required
              />
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-outline_variant bg-surface_container_lowest flex items-center justify-end gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-sm font-bold text-on_surface_variant hover:bg-surface_container_low rounded-lg transition-all border border-outline_variant min-w-[120px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="waste-log-form"
              disabled={!isFormValid || wasteMutation.isPending}
              className={cn(
                "px-10 py-3 text-sm font-bold text-white rounded-lg transition-all shadow-lg active:scale-95 flex items-center gap-2 min-w-[160px] justify-center",
                isFormValid 
                  ? "bg-[#b91c1c] hover:bg-[#991b1b] shadow-red-900/10" 
                  : "bg-outline/30 cursor-not-allowed shadow-none"
              )}
            >
              {wasteMutation.isPending && <Clock className="w-4 h-4 animate-spin" />}
              Log Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteLogSlideOver;
