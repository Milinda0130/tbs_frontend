import axiosInstance from './axiosInstance'

/**
 * dashboardApi — API wrapper + demo mock data for the Inventory Dashboard (Page 6).
 * Endpoints: summary, low-stock, pending approvals, recent movements.
 */

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

/* ─── Types ───────────────────────────────────────────────────────────────── */

export interface DashboardSummary {
  totalItems: number
  lowStockItems: number
  totalStores: number
  pendingApprovals: number
}

export interface StoreOverview {
  id: number
  name: string
  department: string
  itemCount: number
  lowStockCount: number
}

export interface LowStockItem {
  id: number
  name: string
  store: string
  currentQty: number
  minQty: number
}

export interface PendingApproval {
  id: number
  department: string
  itemCount: number
  timeAgo: string
}

export interface StockMovement {
  id: number
  item: string
  store: string
  type: 'stock_in' | 'stock_out' | 'transfer' | 'issue' | 'return'
  qty: number
  user: string
  timestamp: string
}

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const mockSummary: DashboardSummary = {
  totalItems: 12450,
  lowStockItems: 84,
  totalStores: 14,
  pendingApprovals: 27,
}

const mockStores: StoreOverview[] = [
  { id: 1, name: 'Main Store',        department: 'Central Logistics',   itemCount: 8200, lowStockCount: 42 },
  { id: 2, name: 'Nursing Stock',     department: 'Health Sciences Dept', itemCount: 1450, lowStockCount: 18 },
  { id: 3, name: 'Hospitality Stock', department: 'Culinary Arts Dept',  itemCount: 2100, lowStockCount: 15 },
  { id: 4, name: 'Media Equipment',   department: 'Communications Dept', itemCount: 700,  lowStockCount: 9 },
]

const mockLowStock: LowStockItem[] = [
  { id: 101, name: 'Exam Booklets (A4)',   store: 'Main Store',     currentQty: 500, minQty: 1000 },
  { id: 102, name: 'Latex Gloves (M)',     store: 'Nursing Stock',  currentQty: 2,   minQty: 10 },
  { id: 103, name: 'DSLR Cameras (Nikon)', store: 'Media Equip',    currentQty: 1,   minQty: 3 },
  { id: 104, name: 'Projector Bulb X200',  store: 'Media Equip',    currentQty: 3,   minQty: 8 },
  { id: 105, name: 'Syringes (10ml)',      store: 'Nursing Stock',  currentQty: 15,  minQty: 50 },
]

const mockPendingApprovals: PendingApproval[] = [
  { id: 219, department: 'Science Dept', itemCount: 15, timeAgo: '2 hours ago' },
  { id: 220, department: 'IT Services',  itemCount: 3,  timeAgo: '4 hours ago' },
  { id: 221, department: 'Library',      itemCount: 50, timeAgo: '1 day ago' },
  { id: 222, department: 'Hospitality',  itemCount: 8,  timeAgo: '2 days ago' },
]

const mockMovements: StockMovement[] = [
  { id: 1, item: 'Printer Paper A4',   store: 'Main Store',       type: 'stock_in',  qty: 200,  user: 'J. Smith',  timestamp: '10:45 AM, Today' },
  { id: 2, item: 'Microscopes',        store: 'Science Lab',      type: 'transfer',  qty: 5,    user: 'A. Davis',  timestamp: '09:15 AM, Today' },
  { id: 3, item: 'Chef Uniforms (M)',  store: 'Hospitality Stock', type: 'stock_out', qty: -12,  user: 'M. Lee',    timestamp: 'Yesterday' },
  { id: 4, item: 'Nitrile Gloves',     store: 'Nursing Stock',    type: 'issue',     qty: -24,  user: 'R. Perera', timestamp: 'Yesterday' },
  { id: 5, item: 'Tripod Stands',      store: 'Media Equip',      type: 'return',    qty: 3,    user: 'K. Fernando', timestamp: '2 days ago' },
]

/* ─── API Functions ───────────────────────────────────────────────────────── */

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    if (DEMO_MODE) return mockSummary
    try {
      const { data } = await axiosInstance.get<DashboardSummary>('/dashboard/summary')
      return data
    } catch {
      return mockSummary
    }
  },

  getStores: async (): Promise<StoreOverview[]> => {
    if (DEMO_MODE) return mockStores
    try {
      const { data } = await axiosInstance.get<StoreOverview[]>('/dashboard/stores')
      return data
    } catch {
      return mockStores
    }
  },

  getLowStock: async (): Promise<LowStockItem[]> => {
    if (DEMO_MODE) return mockLowStock
    try {
      const { data } = await axiosInstance.get<LowStockItem[]>('/inventory/low-stock', { params: { limit: 5 } })
      return data
    } catch {
      return mockLowStock
    }
  },

  getPendingApprovals: async (): Promise<PendingApproval[]> => {
    if (DEMO_MODE) return mockPendingApprovals
    try {
      const { data } = await axiosInstance.get<PendingApproval[]>('/borrow-requests', {
        params: { status: 'pending_approval', limit: 5 },
      })
      return data
    } catch {
      return mockPendingApprovals
    }
  },

  getRecentMovements: async (): Promise<StockMovement[]> => {
    if (DEMO_MODE) return mockMovements
    try {
      const { data } = await axiosInstance.get<StockMovement[]>('/stock-movements', { params: { limit: 20 } })
      return data
    } catch {
      return mockMovements
    }
  },
}
