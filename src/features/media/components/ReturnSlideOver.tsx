import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Badge } from '../../../components/ui';
import axiosInstance from '../../../api/axiosInstance';
import { cn } from '../../../lib/utils';

interface BorrowedItem {
  id: number;
  name: string;
  serial_number: string;
  store: string;
}

interface ReturnSlideOverProps {
  open: boolean;
  onClose: () => void;
  borrowRequestId: string;
  items: BorrowedItem[];
}

interface ItemReturnState {
  item_id: number;
  condition: 'Good' | 'Fair' | 'Damaged' | '';
  damage_notes: string;
}

const ReturnSlideOver: React.FC<ReturnSlideOverProps> = ({ open, onClose, borrowRequestId, items }) => {
  const queryClient = useQueryClient();
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemStates, setItemStates] = useState<Record<number, ItemReturnState>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize item states
  useEffect(() => {
    if (open) {
      const initialStates: Record<number, ItemReturnState> = {};
      items.forEach(item => {
        initialStates[item.id] = {
          item_id: item.id,
          condition: '',
          damage_notes: ''
        };
      });
      setItemStates(initialStates);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [open, items]);

  const handleConditionChange = (itemId: number, condition: 'Good' | 'Fair' | 'Damaged') => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], condition }
    }));
  };

  const handleNotesChange = (itemId: number, notes: string) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], damage_notes: notes }
    }));
  };

  const returnMutation = useMutation({
    mutationFn: async (data: any) => axiosInstance.post(`/api/borrow-requests/${borrowRequestId}/return`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      // In a real app: toast.success('Equipment returned successfully');
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      return_date: returnDate,
      items: Object.values(itemStates)
    };
    returnMutation.mutate(payload);
  };

  const isFormValid = items.every(item => itemStates[item.id]?.condition !== '') && 
                      items.every(item => 
                        itemStates[item.id]?.condition !== 'Damaged' || 
                        (itemStates[item.id]?.condition === 'Damaged' && itemStates[item.id]?.damage_notes.trim() !== '')
                      );

  const hasDamagedItems = Object.values(itemStates).some(state => state.condition === 'Damaged');

  if (!open && !isAnimating) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300 ease-in-out",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
        <div 
          className={cn(
            "w-screen max-w-xl bg-white shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-in-out flex flex-col",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Header */}
          <div className="px-6 py-6 border-b border-outline_variant flex items-center justify-between">
            <h2 className="text-xl font-bold text-on_surface flex items-center gap-2">
              Log Equipment Return — <span className="text-primary">{borrowRequestId}</span>
            </h2>
            <button onClick={onClose} className="p-2 text-outline hover:text-on_surface transition-colors rounded-full hover:bg-surface_container">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {/* Return Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on_surface_variant uppercase tracking-wider flex items-center gap-1.5">
                Return Date <span className="text-error">*</span>
              </label>
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface_container_lowest border border-outline_variant rounded-lg text-sm font-bold focus:outline-none focus:border-primary transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-[0.1em]">Items to Return</h3>
              
              <div className="space-y-4">
                {items.map((item) => {
                  const state = itemStates[item.id];
                  const isDamaged = state?.condition === 'Damaged';

                  return (
                    <div 
                      key={item.id} 
                      className={cn(
                        "p-5 rounded-xl border-2 transition-all duration-300",
                        isDamaged ? "border-error bg-red-50/20" : "border-outline_variant bg-white"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-base font-bold text-on_surface">{item.name}</h4>
                          <p className="text-xs font-medium text-outline">Serial: {item.serial_number}</p>
                        </div>
                        <Badge className="bg-[#e7eeff] text-[#003d9b] border-none text-[9px] py-0.5 px-2 font-bold uppercase tracking-wider">
                          {item.store}
                        </Badge>
                      </div>

                      {/* Condition Segmented Control */}
                      <div className="mt-4 space-y-2">
                        <p className="text-[10px] font-bold text-on_surface_variant uppercase tracking-wider">Condition Status</p>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleConditionChange(item.id, 'Good')}
                            className={cn(
                              "py-2.5 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5",
                              state?.condition === 'Good' 
                                ? "bg-[#e7f5ec] border-[#15803d] text-[#15803d] shadow-sm" 
                                : "bg-white border-outline_variant text-on_surface_variant hover:bg-surface_container_low"
                            )}
                          >
                            {state?.condition === 'Good' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            Good
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConditionChange(item.id, 'Fair')}
                            className={cn(
                              "py-2.5 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center",
                              state?.condition === 'Fair' 
                                ? "bg-[#fff9eb] border-[#b45309] text-[#b45309] shadow-sm" 
                                : "bg-white border-outline_variant text-on_surface_variant hover:bg-surface_container_low"
                            )}
                          >
                            Fair
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConditionChange(item.id, 'Damaged')}
                            className={cn(
                              "py-2.5 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5",
                              state?.condition === 'Damaged' 
                                ? "bg-[#fef2f2] border-[#b91c1c] text-[#b91c1c] shadow-sm" 
                                : "bg-white border-outline_variant text-on_surface_variant hover:bg-surface_container_low"
                            )}
                          >
                            {state?.condition === 'Damaged' && <AlertTriangle className="w-3.5 h-3.5" />}
                            Damaged
                          </button>
                        </div>
                      </div>

                      {/* Damage Notes Transition */}
                      <div className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isDamaged ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
                      )}>
                        <label className="text-[10px] font-bold text-[#b91c1c] uppercase tracking-wider block mb-1.5">
                          Damage Notes <span className="text-error">*</span>
                        </label>
                        <textarea
                          placeholder="Describe the damage in detail."
                          value={state?.damage_notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          className="w-full p-3 bg-white border border-[#b91c1c]/30 rounded-lg text-sm focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c]/20 transition-all placeholder:text-outline/50"
                          rows={3}
                          required={isDamaged}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Damaged Items Notice */}
            {hasDamagedItems && (
              <div className="flex items-start gap-3 p-4 bg-[#f0f7ff] border border-[#003d9b]/20 rounded-xl animate-fade-in">
                <Info className="w-5 h-5 text-[#003d9b] shrink-0 mt-0.5" />
                <p className="text-xs text-[#003d9b] font-medium leading-relaxed">
                  Damaged items will be flagged for repair in the inventory system.
                </p>
              </div>
            )}
          </form>

          {/* Footer Actions */}
          <div className="px-6 py-6 border-t border-outline_variant bg-surface_container_lowest flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-on_surface_variant hover:bg-surface_container_low rounded-lg transition-all border border-outline_variant"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="return-form"
              onClick={handleSubmit}
              disabled={!isFormValid || returnMutation.isPending}
              className={cn(
                "px-8 py-2.5 text-sm font-bold text-white rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-2",
                isFormValid 
                  ? "bg-[#15803d] hover:bg-[#166534] shadow-green-900/10" 
                  : "bg-outline/30 cursor-not-allowed shadow-none"
              )}
            >
              {returnMutation.isPending && <Clock className="w-4 h-4 animate-spin" />}
              Confirm Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnSlideOver;
