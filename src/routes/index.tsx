import { createBrowserRouter, Outlet } from 'react-router-dom';
import { ItemListPage } from '@/features/inventory/pages/ItemListPage';
import { ItemDetailPage } from '@/features/inventory/pages/ItemDetailPage';
import { AuthProvider } from '@/stores/AuthContext';

const AppLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <ItemListPage />,
      },
      {
        path: '/inventory',
        element: <ItemListPage />,
      },
      {
        path: '/inventory/:id',
        element: <ItemDetailPage />,
      },
    ]
  }
]);
