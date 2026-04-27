import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  RotateCcw,
  Clock,
  User,
  Filter
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import ReturnSlideOver from '../components/ReturnSlideOver';

interface BorrowRequest {
  id: string;
  borrower: string;
  items_count: number;
  request_date: string;
  due_date: string;
  status: 'active' | 'overdue' | 'returned';
  items: { id: number; name: string; serial_number: string; store: string }[];
}

const EquipmentReturnsPage: React.FC = () => {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);

  // Mock data for demo
  const { data: requests, isLoading } = useQuery<BorrowRequest[]>({
    queryKey: ['active-borrows'],
    queryFn: async () => {
      return [
        {
          id: 'BR-2026-0042',
          borrower: 'Chef Julianne',
          items_count: 3,
          request_date: 'Oct 20, 2023',
          due_date: 'Oct 24, 2023',
          status: 'active',
          items: [
            { id: 1, name: 'Sony Alpha A7 III', serial_number: 'SN-8823901', store: 'MEDIA EQUIPMENT STORE' },
            { id: 2, name: 'Rode NT1 Condenser Mic', serial_number: 'SN-4491220', store: 'MEDIA EQUIPMENT STORE' },
            { id: 3, name: 'Aputure 120d II Kit', serial_number: 'SN-1109923', store: 'MEDIA EQUIPMENT STORE' },
          ]
        },
        {
          id: 'BR-2026-0038',
          borrower: 'Prof. Marcus',
          items_count: 1,
          request_date: 'Oct 18, 2023',
          due_date: 'Oct 21, 2023',
          status: 'overdue',
          items: [
            { id: 4, name: 'Canon EF 24-70mm f/2.8L', serial_number: 'SN-9982110', store: 'MEDIA EQUIPMENT STORE' },
          ]
        }
      ];
    }
  });

  const handleLogReturn = (request: BorrowRequest) => {
    setSelectedRequest(request);
    setIsSlideOverOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-outline">Loading active borrows...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="px-1">
        <h1 className="text-3xl font-bold text-on_surface tracking-tight">Equipment Returns</h1>
        <p className="text-sm text-on_surface_variant mt-1 font-medium">Log returns and assess equipment condition</p>
      </div>

      {/* Filter Section */}
      <Card className="p-4 bg-white border border-outline_variant shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search by Request ID or Borrower..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9ff] border border-outline_variant rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" size="icon" className="h-[42px] w-[42px] border-outline_variant">
            <Filter className="w-4 h-4 text-outline" />
          </Button>
        </div>
      </Card>

      {/* Returns Table */}
      <Card className="p-0 border border-outline_variant shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f3ff]/30 border-b border-outline_variant">
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Request ID</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Borrower</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Items</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Due Date</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Status</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline_variant">
              {requests?.map((req) => (
                <tr key={req.id} className="hover:bg-surface_container_low/30 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-primary">{req.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface_dim flex items-center justify-center border border-outline_variant">
                        <User className="w-4 h-4 text-on_surface_variant" />
                      </div>
                      <span className="text-sm font-bold text-on_surface">{req.borrower}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-on_surface_variant">{req.items_count} items</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-on_surface_variant">
                      <Clock className="w-3.5 h-3.5 text-outline" />
                      {req.due_date}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Badge variant={req.status === 'overdue' ? 'error' : 'primary'} className="px-3">
                      {req.status === 'overdue' ? 'Overdue' : 'Active'}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button 
                      size="sm" 
                      onClick={() => handleLogReturn(req)}
                      className="bg-[#15803d] text-white hover:bg-[#166534] font-bold"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Log Return
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slide-Over Component */}
      {selectedRequest && (
        <ReturnSlideOver
          open={isSlideOverOpen}
          onClose={() => setIsSlideOverOpen(false)}
          borrowRequestId={selectedRequest.id}
          items={selectedRequest.items}
        />
      )}
    </div>
  );
};

export default EquipmentReturnsPage;

