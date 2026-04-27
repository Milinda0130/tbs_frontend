import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Printer, 
  FileDown, 
  ChevronRight, 
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import axiosInstance from '../../../api/axiosInstance';
import { cn } from '../../../lib/utils';

interface IngredientReport {  
  item_id: number;
  name: string;
  allocated_qty: number;
  actual_used: number;
  wastage_qty: number;
  unit: string;
  unit_cost: number;
  allocated_cost: number;
  actual_cost: number;
  wastage_cost: number;
}

interface SessionReport {
  id: number;
  name: string;
  date: string;
  conducted_by: string;
  students: number;
  status: string;
  total_allocated_cost: number;
  total_actual_cost: number;
  total_wastage_cost: number;
  cost_per_student: number;
  ingredients: IngredientReport[];
  top_wastage: { name: string; qty: number; unit: string; percentage: number }[];
}

const SessionReportPage: React.FC = () => {
  const { id } = useParams();

  // Fetch report data
  const { data: report, isLoading, error } = useQuery<SessionReport>({
    queryKey: ['session-report', id],
    queryFn: async () => {
      // Mock data for demo based on image
      return {
        id: Number(id),
        name: 'Advanced Pastry Techniques',
        date: 'Oct 24, 2023',
        conducted_by: 'Chef Julianne',
        students: 24,
        status: 'Completed',
        total_allocated_cost: 4450.00,
        total_actual_cost: 4365.00,
        total_wastage_cost: 85.00,
        cost_per_student: 181.88,
        ingredients: [
          { item_id: 1, name: 'All-Purpose Flour', allocated_qty: 5.0, actual_used: 4.8, wastage_qty: 0.2, unit: 'kg', unit_cost: 200, allocated_cost: 1000, actual_cost: 960, wastage_cost: 40 },
          { item_id: 2, name: 'Dark Chocolate (70%)', allocated_qty: 2.5, actual_used: 2.5, wastage_qty: 0.0, unit: 'kg', unit_cost: 1200, allocated_cost: 3000, actual_cost: 3000, wastage_cost: 0 },
          { item_id: 3, name: 'Granulated Sugar', allocated_qty: 3.0, actual_used: 2.7, wastage_qty: 0.3, unit: 'kg', unit_cost: 150, allocated_cost: 450, actual_cost: 405, wastage_cost: 45 },
        ],
        top_wastage: [
          { name: 'Granulated Sugar', qty: 0.3, unit: 'kg', percentage: 10 },
          { name: 'All-Purpose Flour', qty: 0.2, unit: 'kg', percentage: 4 },
        ]
      };
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const response = await axiosInstance.get(`/practical-sessions/${id}/report`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Session_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-outline">Generating report...</div>;
  if (error || !report) return <div className="p-8 text-center text-error">Failed to load report data.</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Breadcrumbs & Actions - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <nav className="flex items-center space-x-2 text-on_surface_variant text-[11px] font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-outline" />
          <Link to="/practical-sessions" className="hover:text-primary transition-colors">Practical Sessions</Link>
          <ChevronRight className="w-3 h-3 text-outline" />
          <Link to={`/practical-sessions/${id}`} className="hover:text-primary transition-colors truncate max-w-[150px]">{report.name}</Link>
          <ChevronRight className="w-3 h-3 text-outline" />
          <span className="text-on_surface font-bold">Report</span>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button size="sm" onClick={handleExportPDF} className="bg-[#003d9b] text-white">
            <FileDown className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Header */}
      <div className="print:block">
        <h1 className="text-3xl font-bold text-on_surface tracking-tight mb-8">Practical Session Cost & Wastage Report</h1>
        
        {/* Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-5 border border-outline_variant bg-white">
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-3">Session Details</p>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-outline font-semibold uppercase mb-0.5">Session</p>
                <p className="text-sm font-bold text-on_surface leading-tight">{report.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline font-semibold uppercase mb-0.5">Date</p>
                <p className="text-sm font-bold text-on_surface">{report.date}</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-outline font-semibold uppercase mb-0.5">Students</p>
                  <p className="text-sm font-bold text-on_surface">{report.students}</p>
                </div>
                <Badge variant="primary" className="bg-[#e7eeff] text-[#003d9b] border-none text-[10px] py-0.5 px-2">
                  <span className="w-1 h-1 rounded-full bg-[#003d9b] mr-1.5"></span>
                  {report.status}
                </Badge>
              </div>
            </div>
          </Card>

          <MetricCard 
            label="Total Allocated Cost" 
            value={report.total_allocated_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
            unit="LKR"
          />
          <MetricCard 
            label="Total Actual Cost" 
            value={report.total_actual_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
            unit="LKR"
          />
          <MetricCard 
            label="Total Wastage Cost" 
            value={report.total_wastage_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
            unit="LKR"
            isWarning
          />
          <MetricCard 
            label="Cost per Student" 
            value={report.cost_per_student.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
            unit="LKR"
          />
        </div>

        {/* Main Content: Table and Wastage Summary */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Ingredient Table */}
          <div className="flex-1 min-w-0">
            <Card className="p-0 border border-outline_variant bg-white">
              <div className="p-6 flex items-center justify-between border-b border-outline_variant">
                <h2 className="text-lg font-bold text-on_surface">Ingredient Breakdown</h2>
                <BarChart3 className="w-5 h-5 text-outline" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f0f3ff]/50 border-b border-outline_variant">
                      <th className="px-4 py-4 label-bold text-outline uppercase tracking-wider text-[9px]">Ingredient</th>
                      <th className="px-4 py-4 label-bold text-outline uppercase tracking-wider text-[9px] text-center">Allocated Qty</th>
                      <th className="px-4 py-4 label-bold text-outline uppercase tracking-wider text-[9px] text-center">Actual Used</th>
                      <th className="px-4 py-4 label-bold text-outline uppercase tracking-wider text-[9px] text-center">Wastage Qty</th>
                      <th className="px-4 py-4 label-bold text-outline uppercase tracking-wider text-[9px] text-center">Unit</th>
                      <th className="px-4 py-4 label-bold text-outline uppercase tracking-wider text-[9px] text-center">Unit Cost (LKR)</th>
                      <th className="px-4 py-4 label-bold text-outline uppercase tracking-wider text-[9px] text-center">Allocated Cost</th>
                      <th className="px-4 py-4 label-bold text-outline uppercase tracking-wider text-[9px] text-center">Actual Cost</th>
                      <th className="px-4 py-4 label-bold text-outline uppercase tracking-wider text-[9px] text-right">Wastage Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline_variant">
                    {report.ingredients.map((ing) => (
                      <tr 
                        key={ing.item_id} 
                        className={cn(
                          "transition-colors",
                          ing.wastage_qty > 0 ? "bg-orange-50/50" : "hover:bg-surface_container_low/30"
                        )}
                      >
                        <td className="px-4 py-4 text-xs font-bold text-on_surface">{ing.name}</td>
                        <td className="px-4 py-4 text-center text-xs font-medium text-on_surface_variant">{ing.allocated_qty.toFixed(1)}</td>
                        <td className="px-4 py-4 text-center text-xs font-medium text-on_surface_variant">{ing.actual_used.toFixed(1)}</td>
                        <td className={cn(
                          "px-4 py-4 text-center text-xs font-bold",
                          ing.wastage_qty > 0 ? "text-orange-600" : "text-on_surface_variant"
                        )}>
                          {ing.wastage_qty.toFixed(1)}
                        </td>
                        <td className="px-4 py-4 text-center text-xs font-semibold text-outline uppercase">{ing.unit}</td>
                        <td className="px-4 py-4 text-center text-xs font-medium text-on_surface_variant">{ing.unit_cost}</td>
                        <td className="px-4 py-4 text-center text-xs font-medium text-on_surface_variant">{ing.allocated_cost}</td>
                        <td className="px-4 py-4 text-center text-xs font-medium text-on_surface_variant">{ing.actual_cost}</td>
                        <td className={cn(
                          "px-4 py-4 text-right text-xs font-bold",
                          ing.wastage_cost > 0 ? "text-orange-600" : "text-on_surface_variant"
                        )}>
                          {ing.wastage_cost.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-surface_container_low/30 border-t border-outline_variant font-bold">
                      <td className="px-4 py-4 text-xs uppercase tracking-wider text-on_surface">Totals</td>
                      <td colSpan={5}></td>
                      <td className="px-4 py-4 text-center text-xs text-on_surface">{report.total_allocated_cost.toLocaleString()}</td>
                      <td className="px-4 py-4 text-center text-xs text-on_surface">{report.total_actual_cost.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right text-xs text-orange-600 font-bold">{report.total_wastage_cost.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>

          {/* Wastage Summary Card */}
          <div className="w-full lg:w-80 shrink-0">
            <Card className="p-6 border border-outline_variant bg-white sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-on_surface">Wastage Summary</h3>
              </div>
              
              <div className="space-y-6">
                <p className="text-xs text-on_surface_variant font-medium leading-relaxed">
                  Top wasted ingredients by quantity.
                </p>
                
                {report.top_wastage.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-on_surface">{item.name}</span>
                      <span className="text-xs font-bold text-orange-600">{item.qty} {item.unit}</span>
                    </div>
                    <div className="h-2 w-full bg-surface_container rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.max(5, item.percentage * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

                <div className="pt-6 border-t border-dashed border-outline_variant mt-8">
                  <p className="text-[10px] italic text-outline leading-relaxed">
                    Note: Only ingredients with recorded wastage are displayed.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: auto; margin: 20mm; }
          body { background: white !important; color: black !important; }
          aside, header, nav, .print\\:hidden { display: none !important; }
          main { 
            padding: 0 !important; 
            margin: 0 !important; 
            width: 100% !important; 
            max-width: 100% !important; 
            overflow: visible !important; 
            height: auto !important;
          }
          .flex-1 { overflow: visible !important; }
          .card-container { 
            border: 1px solid #c3c6d6 !important; 
            box-shadow: none !important; 
            break-inside: avoid;
          }
          .bg-surface_container_low\\/30 { background-color: #f0f3ff !important; -webkit-print-color-adjust: exact; }
          .bg-orange-50\\/50 { background-color: #fffaf0 !important; -webkit-print-color-adjust: exact; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #c3c6d6 !important; }
          .text-orange-600 { color: #ea580c !important; -webkit-print-color-adjust: exact; }
          h1 { margin-bottom: 2rem !important; }
        }
      `}</style>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  isWarning?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, isWarning }) => (
  <Card className="p-5 border border-outline_variant bg-white flex flex-col justify-between">
    <p className={cn(
      "text-[10px] font-bold uppercase tracking-wider mb-6",
      isWarning ? "text-orange-600 flex items-center gap-1.5" : "text-outline"
    )}>
      {isWarning && <AlertTriangle className="w-3 h-3" />}
      {label}
    </p>
    <div>
      <p className={cn(
        "text-2xl font-bold leading-none mb-1",
        isWarning ? "text-orange-600" : "text-on_surface"
      )}>
        {value}
      </p>
      <p className="text-[10px] font-bold text-outline tracking-wider uppercase">{unit}</p>
    </div>
  </Card>
);

export default SessionReportPage;

