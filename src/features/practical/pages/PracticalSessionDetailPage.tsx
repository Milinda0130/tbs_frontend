import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Play, 
  FileText, 
  Search,
  Package,
  TrendingDown,
  DollarSign,
  ChevronRight,
  Download
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import axiosInstance from '../../../api/axiosInstance';
import { cn } from '../../../lib/utils';

type SessionStatus = 'planned' | 'in_progress' | 'completed';

interface Ingredient {
  item_id: number;
  name: string;
  allocated_qty: number;
  actual_qty?: number;
  unit: string;
  cost_per_unit: number;
  icon?: string;
}

interface PracticalSession {
  id: number;
  name: string;
  description: string;
  date: string;
  student_count: number;
  status: SessionStatus;
  ingredients: Ingredient[];
}

const PracticalSessionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actualQtys, setActualQtys] = useState<Record<number, number>>({});

  // Fetch session data
  const { data: session, isLoading, error } = useQuery<PracticalSession>({
    queryKey: ['practical-session', id],
    queryFn: async () => {
      return {
        id: Number(id),
        name: 'Advanced Pastry Techniques',
        description: 'Advanced pastry techniques focusing on tempering chocolate, making macarons, and decorative sugar work.',
        date: 'Oct 24, 2023',
        student_count: 24,
        status: 'in_progress',
        ingredients: [
          { item_id: 1, name: 'All-Purpose Flour', allocated_qty: 5.0, actual_qty: 4.8, unit: 'kg', cost_per_unit: 180, icon: 'Package' },
          { item_id: 2, name: 'Dark Chocolate (70%)', allocated_qty: 2.5, actual_qty: 2.5, unit: 'kg', cost_per_unit: 4500, icon: 'Package' },
          { item_id: 3, name: 'Granulated Sugar', allocated_qty: 3.0, actual_qty: 2.7, unit: 'kg', cost_per_unit: 220, icon: 'Package' },
        ]
      };
    }
  });

  useEffect(() => {
    if (session?.ingredients) {
      const initialQtys: Record<number, number> = {};
      session.ingredients.forEach(ing => {
        if (ing.actual_qty !== undefined) {
          initialQtys[ing.item_id] = ing.actual_qty;
        }
      });
      setActualQtys(initialQtys);
    }
  }, [session]);

  const startSessionMutation = useMutation({
    mutationFn: async () => axiosInstance.patch(`/practical-sessions/${id}/start`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['practical-session', id] })
  });

  const recordConsumptionMutation = useMutation({
    mutationFn: async (data: { items: { item_id: number, actual_qty: number }[] }) => 
      axiosInstance.patch(`/practical-sessions/${id}/consumption`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['practical-session', id] })
  });

  const handleQtyChange = (itemId: number, value: string) => {
    const qty = parseFloat(value) || 0;
    setActualQtys(prev => ({ ...prev, [itemId]: qty }));
  };

  const handleComplete = () => {
    const items = session?.ingredients.map(ing => ({
      item_id: ing.item_id,
      actual_qty: actualQtys[ing.item_id] || 0
    })) || [];
    recordConsumptionMutation.mutate({ items });
  };

  if (isLoading) return <div className="p-8 text-center text-outline">Loading session details...</div>;
  if (error || !session) return <div className="p-8 text-center text-error">Failed to load session.</div>;

  const getStatusBadge = (status: SessionStatus) => {
    switch (status.toLowerCase()) {
      case 'planned': return <Badge variant="primary">Planned</Badge>;
      case 'in_progress': return <Badge variant="warning" dot className="bg-amber-50 border-amber-200 text-amber-700">In Progress</Badge>;
      case 'completed': return <Badge variant="success">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const calculateMetrics = () => {
    if (!session) return null;
    let totalIngredientCost = 0;
    let totalWastageQty = 0;
    let totalWastageCost = 0;
    session.ingredients.forEach(ing => {
      const actual = actualQtys[ing.item_id] ?? ing.actual_qty ?? 0;
      const wastage = Math.max(0, ing.allocated_qty - actual);
      totalIngredientCost += actual * ing.cost_per_unit;
      totalWastageQty += wastage;
      totalWastageCost += wastage * ing.cost_per_unit;
    });
    return { totalIngredientCost, costPerStudent: totalIngredientCost / session.student_count, totalWastageQty, totalWastageCost };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-on_surface_variant text-[11px] font-medium px-1">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-outline" />
        <Link to="/practical-sessions" className="hover:text-primary transition-colors">Practical Sessions</Link>
        <ChevronRight className="w-3 h-3 text-outline" />
        <span className="text-on_surface font-bold">{session.name}</span>
      </nav>

      {/* Main Header Card */}
      <Card className="overflow-hidden border border-outline_variant shadow-sm bg-white p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-on_surface tracking-tight">{session.name}</h1>
              {getStatusBadge(session.status)}
            </div>
            
            <p className="text-sm text-on_surface_variant max-w-2xl leading-relaxed font-medium">
              {session.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-3 text-on_surface_variant">
                <div className="p-2 bg-surface_container_low rounded-lg border border-outline_variant">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-bold text-on_surface">{session.date}</span>
              </div>
              <div className="flex items-center gap-3 text-on_surface_variant">
                <div className="p-2 bg-surface_container_low rounded-lg border border-outline_variant">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-bold text-on_surface">{session.student_count} Students</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            {session.status.toLowerCase() === 'planned' && (
              <Button size="lg" onClick={() => startSessionMutation.mutate()} className="bg-[#003d9b] text-white px-8 font-bold">
                <Play className="w-4 h-4" />
                Start Session
              </Button>
            )}
            {session.status.toLowerCase() === 'in_progress' && (
              <Button size="lg" onClick={handleComplete} className="bg-[#15803d] text-white hover:bg-[#166534] px-8 shadow-lg shadow-green-900/10 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Record Consumption & Complete
              </Button>
            )}
            {session.status.toLowerCase() === 'completed' && (
              <Button variant="outline" size="lg" onClick={() => navigate(`/practical-sessions/${id}/report`)} className="border-[#003d9b] text-[#003d9b] px-8 font-bold">
                <Download className="w-4 h-4" />
                Download Session Report
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Ingredients Section */}
      <Card className="p-0 border border-outline_variant shadow-sm bg-white">
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-outline_variant bg-surface_container_low/20">
          <div className="flex items-center gap-3">
            <div className="bg-[#e7eeff] p-2 rounded-lg border border-[#003d9b]/10">
              <FileText className="w-5 h-5 text-[#003d9b]" />
            </div>
            <h2 className="text-lg font-bold text-on_surface">Ingredient Consumption</h2>
          </div>
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Search ingredients..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline_variant rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-outline_variant">
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px]">Ingredient</th>
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Allocated Qty</th>
                {session.status.toLowerCase() !== 'planned' && (
                  <>
                    <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Actual Qty Consumed</th>
                    <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Wastage / Variance</th>
                  </>
                )}
                <th className="px-6 py-4 label-bold text-outline uppercase tracking-wider text-[10px] text-center">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline_variant bg-white">
              {session.ingredients.map((ing) => {
                const actual = actualQtys[ing.item_id] ?? ing.actual_qty ?? 0;
                const wastage = ing.allocated_qty - actual;
                const isWastage = wastage > 0;

                return (
                  <tr key={ing.item_id} className="hover:bg-surface_container_low/10 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#f0f3ff] flex items-center justify-center text-[#003d9b] border border-outline_variant">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-on_surface">{ing.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-on_surface_variant">
                      {ing.allocated_qty.toFixed(1)}
                    </td>
                    
                    {session.status.toLowerCase() === 'in_progress' && (
                      <>
                        <td className="px-6 py-5 text-center">
                          <input
                            type="number"
                            min="0"
                            max={ing.allocated_qty}
                            step="0.1"
                            value={actual}
                            onChange={(e) => handleQtyChange(ing.item_id, e.target.value)}
                            className="w-20 px-2 py-2 bg-white border border-outline_variant rounded-lg text-center text-sm font-bold focus:border-primary outline-none shadow-inner"
                          />
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={cn(
                            "text-sm font-bold flex items-center justify-center gap-1.5",
                            isWastage ? "text-amber-600" : "text-on_surface_variant"
                          )}>
                            {isWastage && <TrendingDown className="w-3.5 h-3.5" />}
                            {isWastage ? `+${wastage.toFixed(1)}` : '0.0'}
                          </span>
                        </td>
                      </>
                    )}

                    <td className="px-6 py-5 text-center">
                      <span className="text-[10px] font-bold text-outline uppercase bg-[#f0f3ff] px-2 py-1 rounded border border-outline_variant leading-none inline-block">
                        {ing.unit}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {session.status.toLowerCase() === 'in_progress' && (
          <div className="p-8 border-t border-outline_variant bg-white flex justify-center">
            <Button 
              size="lg" 
              onClick={handleComplete} 
              className="bg-[#15803d] text-white hover:bg-[#166534] min-w-[320px] shadow-lg shadow-green-900/10 font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Record Consumption & Complete
            </Button>
          </div>
        )}
      </Card>

      {session.status.toLowerCase() === 'completed' && metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Ingredient Cost" value={`LKR ${metrics.totalIngredientCost.toLocaleString()}`} icon={DollarSign} color="primary" />
          <MetricCard title="Cost per Student" value={`LKR ${metrics.costPerStudent.toLocaleString()}`} icon={Users} color="info" />
          <MetricCard title="Total Wastage Qty" value={`${metrics.totalWastageQty.toFixed(1)} kg`} icon={TrendingDown} color="warning" />
          <MetricCard title="Total Wastage Cost" value={`LKR ${metrics.totalWastageCost.toLocaleString()}`} icon={DollarSign} color="error" />
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'primary' | 'info' | 'warning' | 'error';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorStyles = {
    primary: 'bg-[#e7eeff] text-[#003d9b]',
    info: 'bg-blue-50 text-blue-600',
    warning: 'bg-amber-50 text-amber-600',
    error: 'bg-red-50 text-red-600',
  };
  return (
    <Card className="flex flex-col gap-3 p-6 border border-outline_variant shadow-sm bg-white">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorStyles[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">{title}</p>
        <p className="text-xl font-bold text-on_surface">{value}</p>
      </div>
    </Card>
  );
};

export default PracticalSessionDetailPage;

