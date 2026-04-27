import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  History, 
  Camera, 
  Mic2, 
  Lightbulb, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Package,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import axiosInstance from '../../../api/axiosInstance';
import { cn } from '../../../lib/utils';

interface MediaItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  serial_number: string;
  condition: 'Good' | 'Fair' | 'Damaged';
  status: 'Available' | 'Borrowed' | 'Under Repair';
  last_borrowed: string;
  icon: 'Camera' | 'Mic' | 'Light' | 'Other';
}

const MediaInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    condition: 'All',
    status: 'All'
  });

  // Mock data for demo based on image
  const { data: items, isLoading } = useQuery<MediaItem[]>({
    queryKey: ['media-inventory', filters],
    queryFn: async () => {
      return [
        {
          id: 1,
          name: 'Sony Alpha A7 III',
          sku: 'CAM-SON-001',
          category: 'Camera',
          serial_number: 'SN-8823901',
          condition: 'Good',
          status: 'Available',
          last_borrowed: 'Oct 12, 2023',
          icon: 'Camera'
        },
        {
          id: 2,
          name: 'Rode NT1 Condenser Mic',
          sku: 'AUD-RDD-012',
          category: 'Audio',
          serial_number: 'SN-4491220',
          condition: 'Good',
          status: 'Borrowed',
          last_borrowed: 'Oct 24, 2023',
          icon: 'Mic'
        },
        {
          id: 3,
          name: 'Aputure 120d II Kit',
          sku: 'LGT-APU-004',
          category: 'Lighting',
          serial_number: 'SN-1189923',
          condition: 'Fair',
          status: 'Under Repair',
          last_borrowed: 'Sep 15, 2023',
          icon: 'Light'
        },
        {
          id: 4,
          name: 'Canon EF 24-70mm f/2.8L',
          sku: 'LNS-CAN-008',
          category: 'Camera',
          serial_number: 'SN-9982110',
          condition: 'Damaged',
          status: 'Available',
          last_borrowed: 'Oct 01, 2023',
          icon: 'Camera'
        },
        {
          id: 5,
          name: 'Manfrotto Befree Advanced Tripod',
          sku: 'ACC-MAN-022',
          category: 'Accessories',
          serial_number: 'SN-N/A',
          condition: 'Good',
          status: 'Available',
          last_borrowed: 'Oct 18, 2023',
          icon: 'Other'
        }
      ];
    }
  });

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Good': return <Badge variant="success" className="bg-[#e7f5ec] text-[#15803d] border-none px-3">Good</Badge>;
      case 'Fair': return <Badge variant="warning" className="bg-[#fff9eb] text-[#b45309] border-none px-3">Fair</Badge>;
      case 'Damaged': return <Badge variant="error" className="bg-[#fef2f2] text-[#b91c1c] border-none px-3">Damaged</Badge>;
      default: return <Badge>{condition}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available': return <Badge variant="success" className="bg-[#e7f5ec] text-[#15803d] border-none px-3">Available</Badge>;
      case 'Borrowed': return <Badge variant="primary" className="bg-[#f0f3ff] text-[#003d9b] border-none px-3">Borrowed</Badge>;
      case 'Under Repair': return <Badge variant="error" className="bg-[#fef2f2] text-[#b91c1c] border-none px-3">Under Repair</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'Mic': return <Mic2 className="w-5 h-5" />;
      case 'Light': return <Lightbulb className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  if (isLoading) return <div className="p-8 text-center text-outline">Loading media inventory...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-bold text-on_surface tracking-tight">Media Equipment Store</h1>
          <p className="text-sm text-on_surface_variant mt-1 font-medium italic">Non-consumable high-value assets</p>
        </div>
        <Button size="lg" className="bg-[#003d9b] text-white px-6 font-bold">
          <Plus className="w-4 h-4" />
          Add Equipment
        </Button>
      </div>

      {/* Filter Section */}
      <Card className="p-4 bg-white border border-outline_variant shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search by name, SKU, or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9ff] border border-outline_variant rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <select className="px-4 py-2.5 bg-white border border-outline_variant rounded-lg text-sm font-bold text-on_surface focus:outline-none focus:border-primary cursor-pointer appearance-none min-w-[140px]">
                <option>Category: All</option>
                <option>Camera</option>
                <option>Audio</option>
                <option>Lighting</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <select className="px-4 py-2.5 bg-white border border-outline_variant rounded-lg text-sm font-bold text-on_surface focus:outline-none focus:border-primary cursor-pointer appearance-none min-w-[140px]">
                <option>Condition: All</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Damaged</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select className="px-4 py-2.5 bg-white border border-outline_variant rounded-lg text-sm font-bold text-on_surface focus:outline-none focus:border-primary cursor-pointer appearance-none min-w-[140px]">
                <option>Status: All</option>
                <option>Available</option>
                <option>Borrowed</option>
                <option>Under Repair</option>
              </select>
            </div>

            <Button variant="outline" size="icon" className="h-[42px] w-[42px] border-outline_variant">
              <Filter className="w-4 h-4 text-outline" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="p-0 border border-outline_variant shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f0f3ff]/30 border-b border-outline_variant">
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Item Name</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">SKU</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Category</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Serial Number</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Condition</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Status</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Last Borrowed</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline_variant">
              {items?.map((item) => (
                <tr 
                  key={item.id} 
                  className={cn(
                    "hover:bg-surface_container_low/30 transition-colors",
                    item.status === 'Under Repair' && "bg-[#fef2f2]/50",
                    item.condition === 'Damaged' && "bg-[#fff9eb]/50"
                  )}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#f0f3ff] flex items-center justify-center text-[#003d9b] border border-outline_variant/50">
                        {getIcon(item.icon)}
                      </div>
                      <span className="text-sm font-bold text-[#003d9b] hover:underline cursor-pointer">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[10px] font-bold text-outline uppercase leading-tight">{item.sku}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-on_surface">{item.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-medium text-on_surface_variant font-mono">{item.serial_number}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {getConditionBadge(item.condition)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-on_surface_variant">
                    {item.last_borrowed}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-outline hover:text-primary hover:bg-surface_container rounded-md transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-outline hover:text-secondary hover:bg-surface_container rounded-md transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigate(`/borrow-requests?item=${item.id}`)}
                        className="p-2 text-outline hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
                        title="Borrow History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-6 py-5 bg-white border-t border-outline_variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-on_surface_variant font-medium">
            Showing <span className="font-bold">1</span> to <span className="font-bold">5</span> of <span className="font-bold">42</span> results
          </p>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="border-outline_variant disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 flex items-center justify-center rounded-md bg-[#f0f3ff] text-[#003d9b] font-bold text-sm border border-primary/20">1</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-md text-on_surface_variant hover:bg-surface_container font-medium text-sm transition-all">2</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-md text-on_surface_variant hover:bg-surface_container font-medium text-sm transition-all">3</button>
              <span className="px-1">...</span>
              <button className="w-9 h-9 flex items-center justify-center rounded-md text-on_surface_variant hover:bg-surface_container font-medium text-sm transition-all">9</button>
            </div>
            <Button variant="outline" size="icon" className="border-outline_variant">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MediaInventoryPage;
