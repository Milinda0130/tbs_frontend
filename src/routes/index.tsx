import { Navigate, Route, Routes } from 'react-router-dom';
import { ItemListPage } from '@/features/inventory/pages/ItemListPage';
import { ItemDetailPage } from '@/features/inventory/pages/ItemDetailPage';
import { LowStockPage } from '@/features/inventory/pages/LowStockPage';
import { SupplierListPage } from '@/features/suppliers/pages/SupplierListPage';
import { SupplierDetailPage } from '@/features/suppliers/pages/SupplierDetailPage';
import { PurchaseOrderListPage } from '@/features/purchaseOrders/pages/PurchaseOrderListPage';
import { PurchaseOrderFormPage } from '@/features/purchaseOrders/pages/PurchaseOrderFormPage';
import BorrowRequestListPage from '@/features/borrowing/pages/BorrowRequestListPage';
import CreateBorrowRequestPage from '@/features/borrowing/pages/CreateBorrowRequestPage';
import BorrowRequestDetailPage from '@/features/borrowing/pages/BorrowRequestDetailPage';
import ApprovalQueuePage from '@/features/borrowing/pages/ApprovalQueuePage';
import BorrowDocumentPage from '@/features/borrowing/pages/BorrowDocumentPage';
import IssueItemsPage from '@/features/issuing/pages/IssueItemsPage';
import IssuingHistoryPage from '@/features/issuing/pages/IssuingHistoryPage';
import { useAuth, type UserRole } from '@/stores/AuthContext';

function getDefaultRoute(role?: UserRole): string {
  const byRole: Record<UserRole, string> = {
    Admin: '/inventory',
    'Main Coordinator': '/purchase-orders',
    'Stock Keeper': '/inventory',
    'Audit Officer': '/issuing-history',
    Faculty: '/borrow-requests',
    'Dept Admin': '/borrow-requests',
  };

  return role ? byRole[role] : '/login';
}

function RootRedirect() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? getDefaultRoute(user?.role) : '/login'} replace />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: UserRole[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/borrow-requests" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Login page coming from Milinda</div>}
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <ItemListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/low-stock"
        element={
          <ProtectedRoute>
            <LowStockPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/:id"
        element={
          <ProtectedRoute>
            <ItemDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <SupplierListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers/:id"
        element={
          <ProtectedRoute>
            <SupplierDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-orders"
        element={
          <ProtectedRoute>
            <PurchaseOrderListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase-orders/create"
        element={
          <ProtectedRoute>
            <PurchaseOrderFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase-orders/:id/edit"
        element={
          <ProtectedRoute>
            <PurchaseOrderFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/borrow-requests"
        element={
          <ProtectedRoute>
            <BorrowRequestListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/borrow-requests/create"
        element={
          <ProtectedRoute>
            <CreateBorrowRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/borrow-requests/:id/document"
        element={
          <ProtectedRoute>
            <BorrowDocumentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/borrow-requests/:id"
        element={
          <ProtectedRoute>
            <BorrowRequestDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/approval-queue"
        element={
          <RoleRoute roles={['Admin', 'Dept Admin']}>
            <ApprovalQueuePage />
          </RoleRoute>
        }
      />
      <Route
        path="/issue-items"
        element={
          <ProtectedRoute>
            <IssueItemsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issuing-history"
        element={
          <ProtectedRoute>
            <IssuingHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
