import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth, type UserRole } from '@/stores/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

/* ─── Lazy-loaded pages ───────────────────────────────────────────────────── */
import { lazy, Suspense } from 'react'

// Auth pages (no shell)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Milinda — Dashboard & Profile
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const MyProfilePage = lazy(() => import('@/pages/MyProfilePage'))

// Thumula — Inventory
import { ItemListPage } from '@/features/inventory/pages/ItemListPage'
import { ItemDetailPage } from '@/features/inventory/pages/ItemDetailPage'
import { LowStockPage } from '@/features/inventory/pages/LowStockPage'
import { SupplierListPage } from '@/features/suppliers/pages/SupplierListPage'
import { SupplierDetailPage } from '@/features/suppliers/pages/SupplierDetailPage'
import { PurchaseOrderListPage } from '@/features/purchaseOrders/pages/PurchaseOrderListPage'
import { PurchaseOrderFormPage } from '@/features/purchaseOrders/pages/PurchaseOrderFormPage'

// Piyara — Borrowing & Issuing
import BorrowRequestListPage from '@/features/borrowing/pages/BorrowRequestListPage'
import CreateBorrowRequestPage from '@/features/borrowing/pages/CreateBorrowRequestPage'
import BorrowRequestDetailPage from '@/features/borrowing/pages/BorrowRequestDetailPage'
import ApprovalQueuePage from '@/features/borrowing/pages/ApprovalQueuePage'
import BorrowDocumentPage from '@/features/borrowing/pages/BorrowDocumentPage'
import IssueItemsPage from '@/features/issuing/pages/IssueItemsPage'
import IssuingHistoryPage from '@/features/issuing/pages/IssuingHistoryPage'

/* ─── Loading fallback ────────────────────────────────────────────────────── */

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined animate-spin text-[var(--primary)] text-[32px]">
          progress_activity
        </span>
        <span className="text-sm text-slate-400">Loading...</span>
      </div>
    </div>
  )
}

/* ─── Role-default route mapping ──────────────────────────────────────────── */

function getDefaultRoute(role?: UserRole): string {
  const byRole: Record<UserRole, string> = {
    Admin: '/dashboard',
    'Main Coordinator': '/purchase-orders',
    'Stock Keeper': '/inventory',
    'Audit Officer': '/reports',
    Faculty: '/borrow-requests',
    'Dept Admin': '/borrow-requests',
  }
  return role ? byRole[role] : '/login'
}

/* ─── Route guards ────────────────────────────────────────────────────────── */

function RootRedirect() {
  const { isLoading, isAuthenticated, user } = useAuth()
  if (isLoading) return <PageLoader />
  return <Navigate to={isAuthenticated ? getDefaultRoute(user?.role) : '/login'} replace />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }
  return <>{children}</>
}

/* ─── App Routes ──────────────────────────────────────────────────────────── */

export default function AppRoutes() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ─── Public routes (no shell) ──────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* ─── Authenticated routes (inside AppShell) ────────────── */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>

          {/* Milinda — Dashboard & Profile */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<MyProfilePage />} />

          {/* Thumula — Inventory */}
          <Route path="/inventory" element={<ItemListPage />} />
          <Route path="/inventory/low-stock" element={<LowStockPage />} />
          <Route path="/inventory/:id" element={<ItemDetailPage />} />

          {/* Thumula — Suppliers */}
          <Route path="/suppliers" element={<SupplierListPage />} />
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />

          {/* Thumula — Purchase Orders */}
          <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
          <Route path="/purchase-orders/create" element={<PurchaseOrderFormPage />} />
          <Route path="/purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />

          {/* Piyara — Borrowing */}
          <Route path="/borrow-requests" element={<BorrowRequestListPage />} />
          <Route path="/borrow-requests/create" element={<CreateBorrowRequestPage />} />
          <Route path="/borrow-requests/:id/document" element={<BorrowDocumentPage />} />
          <Route path="/borrow-requests/:id" element={<BorrowRequestDetailPage />} />

          {/* Piyara — Approval Queue (role-restricted) */}
          <Route
            path="/approval-queue"
            element={<RoleRoute roles={['Admin', 'Dept Admin']}><ApprovalQueuePage /></RoleRoute>}
          />

          {/* Piyara — Issuing */}
          <Route path="/issue-items" element={<IssueItemsPage />} />
          <Route path="/issuing-history" element={<IssuingHistoryPage />} />
        </Route>

        {/* ─── Fallbacks ─────────────────────────────────────────── */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  )
}
