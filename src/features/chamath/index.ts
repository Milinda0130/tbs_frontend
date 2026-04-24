/**
 * Feature pages export hub.
 * Maintains backward-compatible imports while implementation is split by module.
 */
export { AuditLogPage } from '@/features/chamath/AuditLogPage'
export { NotificationsPage } from '@/features/chamath/NotificationsPage'
export {
  BorrowingReportPage,
  DepartmentIssuingReportPage, MonthlyStockUsageReportPage, ReportsHubPage, StockMovementReportPage
} from '@/features/chamath/ReportPages'
export {
  UserDetailPage, UserListPage
} from '@/features/chamath/UserPages'

