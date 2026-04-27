import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Plus,
  Calendar,
  History
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import { cn } from '../../../lib/utils';
import WasteLogSlideOver from '../components/WasteLogSlideOver';

interface WasteLog {
  id: string;
  item_name: string;
  store: string;
  type: 'Expired' | 'Damaged';
  quantity: number;
  unit: string;
  date: string;
  logged_by: string;
}

const WasteLogsPage: React.FC = () => {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  // Mock data for demo
  const { data: logs, isLoading } = useQuery<WasteLog[]>({
    queryKey: ['waste-logs'],
    queryFn: async () => {
      return [
        {
          id: 'WLOG-1001',
          item_name: 'Nitrile Gloves, Medium (Box of 100)',
          store: 'Main Campus Store',
          type: 'Damaged',
          quantity: 2,
          unit: 'Box',
          date: 'Oct 24, 2023',
          logged_by: 'Admin'
        },
        {
          id: 'WLOG-1002',
          item_name: 'Chemical Reagent A',
          store: 'Chemistry Lab',
          type: 'Expired',
          quantity: 500,
          unit: 'ml',
          date: 'Oct 22, 2023',
          logged_by: 'Lab Assistant'
        }
      ];
    }
  });

  if (isLoading) return <div className="p-8 text-center text-outline">Loading waste logs...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-bold text-on_surface tracking-tight">Waste & Damage Logs</h1>
          <p className="text-sm text-on_surface_variant mt-1 font-medium">Track and manage inventory losses</p>
        </div>
        <Button size="lg" onClick={() => setIsSlideOverOpen(true)} className="bg-[#b91c1c] text-white px-6 font-bold shadow-lg shadow-red-900/10">
          <Plus className="w-4 h-4" />
          Log Waste / Damage
        </Button>
      </div>

      {/* Filter Section */}
      <Card className="p-4 bg-white border border-outline_variant shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search by Item or Log ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9ff] border border-outline_variant rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
             <select className="px-4 py-2.5 bg-white border border-outline_variant rounded-lg text-sm font-bold text-on_surface focus:outline-none focus:border-primary cursor-pointer appearance-none min-w-[140px]">
                <option>Type: All</option>
                <option>Expired</option>
                <option>Damaged</option>
              </select>
            <Button variant="outline" size="icon" className="h-[42px] w-[42px] border-outline_variant">
              <Filter className="w-4 h-4 text-outline" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-0 border border-outline_variant shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f0f3ff]/30 border-b border-outline_variant">
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Log ID</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Item Name</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Store</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Type</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Quantity</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Date</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline_variant">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-surface_container_low/30 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-primary">{log.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-on_surface">{log.item_name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-on_surface_variant">{log.store}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Badge 
                      variant={log.type === 'Expired' ? 'error' : 'warning'} 
                      className={cn(
                        "px-3 border-none",
                        log.type === 'Expired' ? "bg-red-50 text-error" : "bg-amber-50 text-warning"
                      )}
                    >
                      {log.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-on_surface">{log.quantity} {log.unit}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-on_surface_variant">
                      <Calendar className="w-3.5 h-3.5 text-outline" />
                      {log.date}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-outline hover:text-primary hover:bg-surface_container rounded-md transition-all">
                      <History className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slide-Over Component */}
      <WasteLogSlideOver
        open={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
      />
    </div>
  );
};

export default WasteLogsPage;

