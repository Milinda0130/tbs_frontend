import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Trash2, 
  Plus,
  FileDown,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  FilterX
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import axiosInstance from '../../../api/axiosInstance';
import { cn } from '../../../lib/utils';
import WasteLogSlideOver from '../components/WasteLogSlideOver';

interface WasteEntry {
  id: string;
  item_id: number;
  item_name: string;
  store: string;
  category: string;
  type: 'Expired' | 'Damaged' | 'Practical Waste';
  quantity: number;
  unit: string;
  date: string;
  logged_by: string;
  notes: string;
  estimated_value: number;
}

const WasteHistoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Filters from URL
  const storeFilter = searchParams.get('store') || 'All';
  const typeFilter = searchParams.get('type') || 'All';
  const searchQuery = searchParams.get('q') || '';

  // Mock data for advanced history
  const { data: entries, isLoading } = useQuery<WasteEntry[]>({
    queryKey: ['waste-history', storeFilter, typeFilter, searchQuery],
    queryFn: async () => {
      return [
        {
          id: 'W-2023-001',
          item_id: 101,
          item_name: 'Nitrile Gloves, Medium',
          store: 'Main Campus Store',
          category: 'Safety',
          type: 'Damaged',
          quantity: 2,
          unit: 'Box',
          date: 'Oct 24, 2023',
          logged_by: 'Admin',
          notes: 'Boxes were crushed during delivery of heavy chemical containers. Contents potentially contaminated.',
          estimated_value: 3400.00
        },
        {
          id: 'W-2023-002',
          item_id: 102,
          item_name: 'Chemical Reagent A-4',
          store: 'Chemistry Lab',
          category: 'Chemicals',
          type: 'Expired',
          quantity: 500,
          unit: 'ml',
          date: 'Oct 22, 2023',
          logged_by: 'Lab Assistant',
          notes: 'Batch expired on Oct 15. Disposed of according to hazardous waste protocol.',
          estimated_value: 12500.00
        },
        {
          id: 'W-2023-003',
          item_id: 103,
          item_name: 'Granulated Sugar',
          store: 'Pastry Kitchen',
          category: 'Ingredients',
          type: 'Practical Waste',
          quantity: 1.5,
          unit: 'kg',
          date: 'Oct 20, 2023',
          logged_by: 'Chef Julianne',
          notes: 'Standard wastage during Advanced Pastry Techniques session.',
          estimated_value: 450.00
        }
      ];
    }
  });

  const toggleNote = (id: string) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get('/api/waste-logs/export', {
        params: Object.fromEntries(searchParams),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Waste_History_Report.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Expired': return <Badge className="bg-[#7f1d1d] text-white border-none px-3 font-bold">Expired</Badge>;
      case 'Damaged': return <Badge className="bg-[#ea580c] text-white border-none px-3 font-bold">Damaged</Badge>;
      case 'Practical Waste': return <Badge className="bg-[#6b21a8] text-white border-none px-3 font-bold">Practical Waste</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const totals = useMemo(() => {
    if (!entries) return { qty: 0, value: 0 };
    return entries.reduce((acc, curr) => ({
      qty: acc.qty + curr.quantity,
      value: acc.value + curr.estimated_value
    }), { qty: 0, value: 0 });
  }, [entries]);

  if (isLoading) return <div className="p-8 text-center text-outline">Loading waste history...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-bold text-on_surface tracking-tight">Waste & Damage History</h1>
          <p className="text-sm text-on_surface_variant mt-1 font-medium">Audit trail for all inventory losses and deductions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="border-outline_variant font-bold bg-white">
            <FileDown className="w-4 h-4" />
            Export Report
          </Button>
          <Button size="lg" onClick={() => setIsSlideOverOpen(true)} className="bg-[#b91c1c] text-white px-6 font-bold shadow-lg shadow-red-900/10">
            <Plus className="w-4 h-4" />
            Log New Entry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Entries (Month)" 
          value="42" 
          icon={Trash2} 
          trend="+12%" 
          color="error" 
        />
        <SummaryCard 
          title="Estimated Loss (LKR)" 
          value="LKR 45,850" 
          icon={DollarSign} 
          trend="+5.4%" 
          color="warning" 
        />
        <SummaryCard 
          title="Most Frequent Type" 
          value="Damaged" 
          icon={Trash2}
          subtitle="24 incidents" 
          color="primary" 
        />
        <SummaryCard 
          title="Active Recovery" 
          value="85%" 
          icon={TrendingDown} 
          subtitle="Reduction from last month" 
          color="success" 
        />
      </div>

      {/* Advanced Filter Bar */}
      <Card className="p-4 bg-white border border-outline_variant shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search by Item, Log ID or category..."
              value={searchQuery}
              onChange={(e) => setSearchParams(prev => { prev.set('q', e.target.value); return prev; })}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9ff] border border-outline_variant rounded-lg text-sm font-medium focus:outline-none focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select 
              value={storeFilter}
              onChange={(e) => setSearchParams(prev => { prev.set('store', e.target.value); return prev; })}
              className="px-4 py-2.5 bg-white border border-outline_variant rounded-lg text-sm font-bold text-on_surface focus:outline-none focus:border-primary cursor-pointer appearance-none min-w-[140px]"
            >
              <option value="All">Store: All</option>
              <option value="Main">Main Store</option>
              <option value="Media">Media Store</option>
            </select>

            <select 
              value={typeFilter}
              onChange={(e) => setSearchParams(prev => { prev.set('type', e.target.value); return prev; })}
              className="px-4 py-2.5 bg-white border border-outline_variant rounded-lg text-sm font-bold text-on_surface focus:outline-none focus:border-primary cursor-pointer appearance-none min-w-[160px]"
            >
              <option value="All">Type: All</option>
              <option value="Expired">Expired</option>
              <option value="Damaged">Damaged</option>
              <option value="Practical Waste">Practical Waste</option>
            </select>

            <Button variant="outline" size="icon" onClick={() => setSearchParams({})} className="h-[42px] w-[42px] border-outline_variant">
              <FilterX className="w-4 h-4 text-outline" />
            </Button>
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card className="p-0 border border-outline_variant shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#f0f3ff]/30 border-b border-outline_variant">
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Date</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Item Name</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Store & Category</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Waste Type</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Quantity</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Logged By</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline_variant">
              {entries?.map((entry) => (
                <tr key={entry.id} className="hover:bg-surface_container_low/30 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm font-bold text-on_surface_variant">{entry.date}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <Link to={`/inventory/${entry.item_id}`} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                        {entry.item_name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-[10px] font-bold text-outline uppercase">{entry.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on_surface">{entry.store}</span>
                      <span className="text-[10px] font-bold text-outline uppercase">{entry.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {getTypeBadge(entry.type)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-on_surface">{entry.quantity} {entry.unit}</span>
                      <span className="text-[10px] font-bold text-outline">LKR {entry.estimated_value.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface_dim flex items-center justify-center text-[10px] font-bold border border-outline_variant">
                        {entry.logged_by.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-on_surface_variant">{entry.logged_by}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-xs">
                    <p 
                      onClick={() => toggleNote(entry.id)}
                      className={cn(
                        "text-xs text-on_surface_variant cursor-pointer hover:text-primary transition-colors",
                        expandedNotes[entry.id] ? "" : "truncate"
                      )}
                    >
                      {entry.notes}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface_container_low/30 border-t border-outline_variant font-bold">
                <td colSpan={4} className="px-6 py-5 text-sm uppercase tracking-wider text-on_surface">Filtered Totals</td>
                <td className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-on_surface">{totals.qty.toFixed(1)} Units</span>
                    <span className="text-sm text-error">LKR {totals.value.toLocaleString()}</span>
                  </div>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
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

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  subtitle?: string;
  color: 'primary' | 'success' | 'warning' | 'error';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, trend, subtitle, color }) => {
  const colorStyles = {
    primary: 'bg-[#e7eeff] text-[#003d9b]',
    success: 'bg-[#e7f5ec] text-[#15803d]',
    warning: 'bg-[#fff9eb] text-[#b45309]',
    error: 'bg-[#fef2f2] text-[#b91c1c]',
  };

  return (
    <Card className="p-6 border border-outline_variant shadow-sm bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg border border-outline_variant/30", colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            trend.startsWith('+') ? "bg-red-50 text-error" : "bg-green-50 text-success"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-on_surface">{value}</p>
        {subtitle && <p className="text-[10px] font-medium text-outline mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
};

export default WasteHistoryPage;

