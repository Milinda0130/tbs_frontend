import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Package,
  Info
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, Input } from '../../../components/ui';
import axiosInstance from '../../../api/axiosInstance';
import { cn } from '../../../lib/utils';

interface Ingredient {
  item_id: number;
  name: string;
  unit: string;
  available_stock: number;
  qty_needed: number;
}

const PracticalSessionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    session_name: '',
    date: '',
    student_count: 1,
    menu: '',
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Search ingredients
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length > 1) {
        try {
          const res = await axiosInstance.get(`/inventory?store=hospitality&sub=practical&search=${searchTerm}`);
          setSearchResults(res.data || []);
        } catch (error) {
          console.error('Search failed:', error);
          // Mock data for demo if API fails
          setSearchResults([
            { id: 101, name: 'Cake Flour', unit: 'kg', available_stock: 50 },
            { id: 102, name: 'Unsalted Butter', unit: 'kg', available_stock: 20 },
            { id: 103, name: 'Granulated Sugar', unit: 'kg', available_stock: 5 },
            { id: 104, name: 'Vanilla Extract', unit: 'liters', available_stock: 2 },
          ].filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())));
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const addIngredient = (item: any) => {
    if (ingredients.some(i => i.item_id === item.id)) return;
    
    setIngredients([...ingredients, {
      item_id: item.id,
      name: item.name,
      unit: item.unit,
      available_stock: item.available_stock,
      qty_needed: 1
    }]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQty = (id: number, qty: number) => {
    setIngredients(ingredients.map(i => 
      i.item_id === id ? { ...i, qty_needed: Math.max(0, qty) } : i
    ));
  };

  const removeIngredient = (id: number) => {
    setIngredients(ingredients.filter(i => i.item_id !== id));
  };

  const hasInsufficientStock = ingredients.some(i => i.qty_needed > i.available_stock);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        ingredients: ingredients.map(({ item_id, qty_needed }) => ({ item_id, qty_needed }))
      };
      
      const res = await axiosInstance.post('/practical-sessions', payload);
      navigate(`/practical-sessions/${res.data.id || 1}`);
    } catch (error) {
      console.error('Submission failed:', error);
      // For demo:
      navigate('/practical-sessions/1');
    }
  };

  return (
    <div className="space-y-lg animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/practical-sessions')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Button>
      </div>

      <PageHeader
        title={isEdit ? 'Edit Practical Session' : 'Create New Practical Session'}
        subtitle="Schedule a laboratory session and allocate necessary ingredients from inventory."
        actions={
          <div className="flex gap-sm">
            <Button variant="outline" onClick={() => navigate('/practical-sessions')}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={ingredients.length === 0}>
              <CheckCircle2 className="w-4 h-4" />
              {isEdit ? 'Save Changes' : 'Create Session'}
            </Button>
          </div>
        }
      />

      {hasInsufficientStock && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-4 animate-slide-in">
          <div className="bg-amber-100 p-2 rounded-full">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-800">Stock Warning</h4>
            <p className="text-xs text-amber-700 font-medium">Some ingredients are below required quantity. Low-stock alerts will be triggered on approval.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-lg">
        {/* Left Column: Session Details */}
        <div className="lg:col-span-4 space-y-lg">
          <Card title="Session Details">
            <form className="space-y-md">
              <Input
                label="Session Name"
                placeholder="e.g. Advanced Pastry Techniques"
                required
                value={formData.session_name}
                onChange={(e) => setFormData({ ...formData, session_name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-md">
                <Input
                  label="Session Date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <Input
                  label="Student Count"
                  type="number"
                  min="1"
                  required
                  value={formData.student_count}
                  onChange={(e) => setFormData({ ...formData, student_count: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="label-bold text-on_surface_variant mb-1.5 block">Menu / Dishes Description</label>
                <textarea
                  className="w-full px-4 py-2 bg-surface_container_low border border-outline_variant rounded-md text-sm transition-all focus:outline-none focus:border-primary min-h-[120px]"
                  placeholder="Describe the dishes to be prepared..."
                  value={formData.menu}
                  onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                />
              </div>
            </form>
          </Card>

          <Card title="Summary" className="bg-surface_container_low border-dashed">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on_surface_variant font-medium">Allocated Ingredients</span>
                <span className="font-bold">{ingredients.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on_surface_variant font-medium">Estimated Cost</span>
                <span className="font-bold text-primary">LKR 0.00</span>
              </div>
              <div className="p-3 bg-surface_container_highest rounded-md flex gap-2">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[10px] text-on_surface_variant font-medium leading-relaxed">
                  Final costs will be calculated based on actual consumption recorded after the session.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Ingredient Allocation */}
        <div className="lg:col-span-6">
          <Card title="Ingredient Allocation" className="h-full flex flex-col">
            <div className="mb-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Search ingredients in Hospitality Store..."
                className="w-full pl-10 pr-4 py-3 bg-surface_container_low border border-outline_variant rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface_container_lowest border border-outline_variant rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addIngredient(item)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface_container_low transition-colors border-b last:border-0 border-outline_variant"
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-on_surface">{item.name}</p>
                        <p className="text-[10px] text-outline font-semibold uppercase">{item.unit}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.available_stock > 5 ? 'success' : 'warning'}>
                          Stock: {item.available_stock} {item.unit}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline_variant">
                    <th className="py-3 px-2 label-bold text-outline text-[10px]">Ingredient</th>
                    <th className="py-3 px-2 label-bold text-outline text-[10px] text-center">Qty Needed</th>
                    <th className="hidden sm:table-cell py-3 px-2 label-bold text-outline text-[10px] text-center">Unit</th>
                    <th className="hidden md:table-cell py-3 px-2 label-bold text-outline text-[10px] text-center">Available</th>
                    <th className="hidden sm:table-cell py-3 px-2 label-bold text-outline text-[10px] text-center">Status</th>
                    <th className="py-3 px-2 label-bold text-outline text-[10px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline_variant">
                  {ingredients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <Package className="w-12 h-12 text-outline/20 mx-auto mb-3" />
                        <p className="text-sm font-medium text-outline">No ingredients allocated yet.</p>
                        <p className="text-xs text-outline/60 mt-1">Search above to add items to this session.</p>
                      </td>
                    </tr>
                  ) : ingredients.map((ing) => (
                    <tr 
                      key={ing.item_id} 
                      className={cn(
                        "transition-colors",
                        ing.qty_needed > ing.available_stock ? "bg-red-50/50" : "hover:bg-surface_container_low"
                      )}
                    >
                      <td className="py-4 px-2">
                        <p className="text-sm font-bold text-on_surface">{ing.name}</p>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <input
                          type="number"
                          className="w-20 px-2 py-1 bg-surface_container_lowest border border-outline_variant rounded text-center text-sm font-bold"
                          value={ing.qty_needed}
                          onChange={(e) => updateQty(ing.item_id, parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="hidden sm:table-cell py-4 px-2 text-center">
                        <span className="text-xs font-semibold text-outline uppercase">{ing.unit}</span>
                      </td>
                      <td className="hidden md:table-cell py-4 px-2 text-center">
                        <span className="text-sm font-bold text-on_surface_variant">{ing.available_stock}</span>
                      </td>
                      <td className="hidden sm:table-cell py-4 px-2 text-center">
                        {ing.qty_needed > ing.available_stock ? (
                          <Badge variant="error">Insufficient</Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button 
                          onClick={() => removeIngredient(ing.item_id)}
                          className="p-2 text-outline hover:text-error hover:bg-red-50 rounded-md transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PracticalSessionFormPage;

