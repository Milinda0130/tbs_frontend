import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Users, 
  Eye, 
  Edit3, 
  Play, 
  CheckCircle2, 
  Filter, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, Chip } from '../../../components/ui';
import axiosInstance from '../../../api/axiosInstance';
import { cn, formatDate } from '../../../lib/utils';

type SessionStatus = 'all' | 'planned' | 'in_progress' | 'completed';

const PracticalSessionListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Fetch sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['practical-sessions', status, dateRange.from, dateRange.to],
    queryFn: async () => {
      // Mocked data for now based on the image provided
      // In production, this would be: 
      // const res = await axiosInstance.get('/practical-sessions', { params: { status, ...dateRange } });
      // return res.data;
      return [
        {
          id: 1,
          name: 'Advanced Pastry Techniques',
          date: 'Oct 24, 2023 • 09:00 AM',
          student_count: 24,
          status: 'in_progress',
          allocated_items: 156,
          total_cost: 45000.00,
        },
        {
          id: 2,
          name: 'Culinary Fundamentals 101',
          date: 'Oct 25, 2023 • 13:30 PM',
          student_count: 30,
          status: 'planned',
          allocated_items: 210,
          total_cost: 32500.00,
        },
        {
          id: 3,
          name: 'Mixology Masterclass',
          date: 'Oct 22, 2023 • 15:00 PM',
          student_count: 18,
          status: 'completed',
          allocated_items: 85,
          total_cost: 28000.00,
        },
        {
          id: 4,
          name: 'Baking Artistry',
          date: 'Oct 28, 2023 • 08:30 AM',
          student_count: 20,
          status: 'planned',
          allocated_items: 120,
          total_cost: 15000.00,
        }
      ];
    }
  });

  // Start session mutation
  const startSession = useMutation({
    mutationFn: (id: number) => axiosInstance.post(`/practical-sessions/${id}/start`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['practical-sessions'] }),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planned':
        return <Badge variant="primary">Planned</Badge>;
      case 'in_progress':
        return (
          <Badge variant="warning" dot className="bg-amber-50 border-amber-200 text-amber-700">
            In Progress
          </Badge>
        );
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      <PageHeader
        title="Practical Sessions (Hotel School)"
        subtitle="Manage and track culinary and hospitality lab sessions."
        actions={
          <Button onClick={() => navigate('/practical-sessions/create')}>
            <Plus className="w-4 h-4" />
            New Session
          </Button>
        }
      />

      <Card className="p-0">
        <div className="p-sm flex flex-col sm:flex-row items-center justify-between gap-sm border-b border-outline_variant bg-surface_container_low">
          <div className="flex bg-surface_container p-1 rounded-lg">
            {(['all', 'planned', 'in_progress', 'completed'] as SessionStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-md transition-all capitalize',
                  status === s 
                    ? 'bg-surface_container_lowest text-primary shadow-sm' 
                    : 'text-on_surface_variant hover:text-on_surface'
                )}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-sm">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Oct 1, 2023 - Oct 31, 2023"
                className="pl-10 pr-4 py-2 bg-surface_container_lowest border border-outline_variant rounded-md text-xs focus:outline-none"
              />
            </div>
            <Button variant="outline" size="sm" className="bg-surface_container_lowest">
              <Filter className="w-4 h-4 text-outline" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface_container_lowest border-b border-outline_variant">
                <th className="px-sm py-4 label-bold text-outline uppercase tracking-wider">Session Name</th>
                <th className="px-sm py-4 label-bold text-outline uppercase tracking-wider text-center">Date</th>
                <th className="hidden lg:table-cell px-sm py-4 label-bold text-outline uppercase tracking-wider text-center">Student Count</th>
                <th className="px-sm py-4 label-bold text-outline uppercase tracking-wider text-center">Status</th>
                <th className="hidden sm:table-cell px-sm py-4 label-bold text-outline uppercase tracking-wider text-center">Allocated Items</th>
                <th className="hidden md:table-cell px-sm py-4 label-bold text-outline uppercase tracking-wider text-right">Total Est. Cost (LKR)</th>
                <th className="px-sm py-4 label-bold text-outline uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline_variant">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-sm py-xl text-center text-outline">Loading sessions...</td>
                </tr>
              ) : sessions?.map((session) => (
                <tr key={session.id} className="hover:bg-surface_container_low transition-colors">
                  <td className="px-sm py-4">
                    <Link to={`/practical-sessions/${session.id}`} className="text-sm font-bold text-primary hover:underline">
                      {session.name}
                    </Link>
                  </td>
                  <td className="px-sm py-4 text-center">
                    <div className="text-xs text-on_surface font-medium">{session.date.split('•')[0]}</div>
                    <div className="text-[10px] text-outline font-semibold uppercase">{session.date.split('•')[1]}</div>
                  </td>
                  <td className="hidden lg:table-cell px-sm py-4 text-center text-sm font-semibold text-on_surface_variant">
                    {session.student_count}
                  </td>
                  <td className="px-sm py-4 text-center">
                    {getStatusBadge(session.status)}
                  </td>
                  <td className="hidden sm:table-cell px-sm py-4 text-center">
                    <Badge variant="info">{session.allocated_items}</Badge>
                  </td>
                  <td className="hidden md:table-cell px-sm py-4 text-right text-sm font-bold text-on_surface">
                    {session.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-sm py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/practical-sessions/${session.id}`)}
                        className="p-2.5 text-outline hover:text-primary hover:bg-surface_container rounded-md transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {session.status === 'completed' && (
                        <button 
                          onClick={() => navigate(`/practical-sessions/${session.id}/report`)}
                          className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-md transition-all"
                          title="View Report"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {session.status === 'planned' && (
                        <>
                          <button 
                            onClick={() => navigate(`/practical-sessions/${session.id}/edit`)}
                            className="p-2.5 text-outline hover:text-secondary hover:bg-surface_container rounded-md transition-all"
                            title="Edit Session"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <Button 
                            size="sm" 
                            className="h-8 px-3"
                            onClick={() => startSession.mutate(session.id)}
                          >
                            Start
                          </Button>
                        </>
                      )}

                      {session.status === 'in_progress' && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 px-3 bg-surface_container_low border-primary/20 text-primary"
                          onClick={() => navigate(`/practical-sessions/${session.id}`)}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-sm flex items-center justify-between border-t border-outline_variant bg-surface_container_lowest">
          <p className="text-xs text-on_surface_variant">
            Showing <span className="font-bold">1 to {sessions?.length}</span> of <span className="font-bold">12</span> sessions
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-outline_variant rounded-md text-outline hover:bg-surface_container">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-on_primary rounded-md text-xs font-bold shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-surface_container rounded-md text-xs font-semibold text-on_surface_variant">2</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-surface_container rounded-md text-xs font-semibold text-on_surface_variant">3</button>
            <button className="p-1.5 border border-outline_variant rounded-md text-outline hover:bg-surface_container">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PracticalSessionListPage;
