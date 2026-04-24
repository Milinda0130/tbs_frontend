import { Navigate, Route, Routes } from 'react-router-dom'
import BorrowRequestListPage from '@/features/borrowing/pages/BorrowRequestListPage'
import CreateBorrowRequestPage from '@/features/borrowing/pages/CreateBorrowRequestPage'
import BorrowRequestDetailPage from '@/features/borrowing/pages/BorrowRequestDetailPage'
import ApprovalQueuePage from '@/features/borrowing/pages/ApprovalQueuePage'
import BorrowDocumentPage from '@/features/borrowing/pages/BorrowDocumentPage'
import IssueItemsPage from '@/features/issuing/pages/IssueItemsPage'
import IssuingHistoryPage from '@/features/issuing/pages/IssuingHistoryPage'
import MockLoginPage from '@/pages/MockLoginPage'
import { useAuth, type UserRole } from '@/stores/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function RoleRoute({
  children,
  roles,
}: {
  children: React.ReactNode
  roles: UserRole[]
}) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/borrow-requests" replace />
  }

  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<MockLoginPage />} />

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

      <Route path="*" element={<Navigate to="/borrow-requests" replace />} />
    </Routes>
  )
}
