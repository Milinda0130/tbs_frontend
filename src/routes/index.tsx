import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';
import { ItemListPage } from '@/features/inventory/pages/ItemListPage';
import { ItemDetailPage } from '@/features/inventory/pages/ItemDetailPage';
import { LowStockPage } from '@/features/inventory/pages/LowStockPage';
import { SupplierListPage } from '@/features/suppliers/pages/SupplierListPage';
import { SupplierDetailPage } from '@/features/suppliers/pages/SupplierDetailPage';
import { PurchaseOrderListPage } from '@/features/purchaseOrders/pages/PurchaseOrderListPage';
import { PurchaseOrderFormPage } from '@/features/purchaseOrders/pages/PurchaseOrderFormPage';
import { AuthProvider } from '@/stores/AuthContext';

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/inventory" replace />,
      },
      {
        path: '/inventory',
        element: <ItemListPage />,
      },
      {
        path: '/inventory/:id',
        element: <ItemDetailPage />,
      },
      {
        path: '/inventory/low-stock',
        element: <LowStockPage />,
      },
      {
        path: '/suppliers',
        element: <SupplierListPage />,
      },
      {
        path: '/suppliers/:id',
        element: <SupplierDetailPage />,
      },
      {
        path: '/purchase-orders',
        element: <PurchaseOrderListPage />,
      },
      {
        path: '/purchase-orders/create',
        element: <PurchaseOrderFormPage />,
      },
      {
        path: '/purchase-orders/:id/edit',
        element: <PurchaseOrderFormPage />,
      },
    ]
  }
]);
