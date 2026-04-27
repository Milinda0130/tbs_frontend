import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/stores/AuthContext'
import {
  AuditLogPage,
  BorrowingReportPage,
  DepartmentIssuingReportPage,
  MonthlyStockUsageReportPage,
  NotificationsPage,
  ReportsHubPage,
  StockMovementReportPage,
  UserDetailPage,
  UserListPage,
} from '@/features'

/**
 * App route composition focused on Chamath module ownership scope.
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth()
  if (isLoading) {
    return <div className="p-6 text-sm text-slate-400">Checking session...</div>
  }
  return <>{children}</>
}

function RoleRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles: string[]
}) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) {
    return <div className="p-6 text-sm text-red-300">403 - You do not have access to this page.</div>
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route path="/reports" element={<ReportsHubPage />} />
        <Route path="/reports/monthly-stock-usage" element={<MonthlyStockUsageReportPage />} />
        <Route path="/reports/stock-movements" element={<StockMovementReportPage />} />
        <Route path="/reports/borrowing" element={<BorrowingReportPage />} />
        <Route path="/reports/department-issuing" element={<DepartmentIssuingReportPage />} />
        <Route path="/audit-logs" element={<RoleRoute roles={['Admin', 'Main Coordinator', 'Audit Officer']}><AuditLogPage /></RoleRoute>} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/reports" replace />} />
    </Routes>
  )
}

export default App
