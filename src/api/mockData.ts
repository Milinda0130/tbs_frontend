import type { AuditLogEntry } from './auditApi'
import type { NotificationDto } from './notificationsApi'
import type { ReportKey } from './reportsApi'
import type { UserDto } from './usersApi'

/**
 * Mock dataset used as frontend fallback for feature demos.
 * This keeps pages functional when backend APIs are unavailable.
 */
export const mockUsers: UserDto[] = [
  { id: 1, name: 'Marcus Thorne', email: 'marcus@tbs.edu', role: 'Admin', department: 'Administration', status: 'active', created_at: '2026-02-10', last_login_at: '2026-04-24 08:30:00' },
  { id: 2, name: 'Nimali Perera', email: 'nimali@tbs.edu', role: 'Main Coordinator', department: 'Operations', status: 'active', created_at: '2026-01-12', last_login_at: '2026-04-24 09:12:00' },
  { id: 3, name: 'Ruwan Silva', email: 'ruwan@tbs.edu', role: 'Audit Officer', department: 'Compliance', status: 'active', created_at: '2026-03-18', last_login_at: '2026-04-23 17:20:00' },
  { id: 4, name: 'Ishani Fernando', email: 'ishani@tbs.edu', role: 'Dept Admin', department: 'Hospitality', status: 'inactive', created_at: '2026-02-28', last_login_at: '2026-04-20 14:45:00' },
]

export const mockAuditLogs: AuditLogEntry[] = [
  { id: 101, created_at: '2026-04-24 09:41:14', user_name: 'Marcus Thorne', user_role: 'Admin', action: 'Updated', module: 'Users', record: 'users#4', ip_address: '10.0.0.14', before_values: { status: 'inactive' }, after_values: { status: 'active' } },
  { id: 102, created_at: '2026-04-24 09:35:02', user_name: 'Nimali Perera', user_role: 'Main Coordinator', action: 'Approved', module: 'Borrowing', record: 'borrow_requests#89', ip_address: '10.0.0.18', before_values: { status: 'pending_approval' }, after_values: { status: 'approved' } },
  { id: 103, created_at: '2026-04-24 09:10:44', user_name: 'Ruwan Silva', user_role: 'Audit Officer', action: 'Login Success', module: 'Auth', record: 'users#3', ip_address: '10.0.0.22', before_values: null, after_values: null },
]

export const mockNotifications: NotificationDto[] = [
  { id: 501, title: 'Low Stock Alert', description: 'Projector Bulb X200 stock dropped below minimum threshold.', type: 'low_stock', link: '/inventory?store=media', is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 502, title: 'Approval Pending', description: 'Borrow request BR-00219 is waiting for coordinator approval.', type: 'approval', link: '/borrow-requests/219', is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 503, title: 'Request Rejected', description: 'Borrow request BR-00207 has been rejected with a reason note.', type: 'decision', link: '/borrow-requests/207', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: 504, title: 'Overdue Return', description: 'Media item MH-889 has passed expected return date by 2 days.', type: 'overdue', link: '/borrow-requests?status=issued', is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 505, title: 'System Notice', description: 'Scheduled maintenance is planned for Saturday at 11:30 PM.', type: 'system', link: '/notifications', is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
]

export const mockReports: Record<ReportKey, Record<string, unknown>[]> = {
  'monthly-stock-usage': [
    { item: 'Projector Bulb X200', category: 'Media', store: 'Media Store', opening_stock: 34, stock_in: 15, qty_issued: 8, qty_borrowed: 5, qty_wasted: 1, closing_stock: 35 },
    { item: 'Nitrile Gloves', category: 'Consumables', store: 'Nursing Stock', opening_stock: 260, stock_in: 120, qty_issued: 95, qty_borrowed: 0, qty_wasted: 6, closing_stock: 279 },
  ],
  'stock-movements': [
    { date: '2026-04-24', item: 'Projector Bulb X200', store: 'Media Store', type: 'stock_in', qty: 10, reference: 'PO-1008', user: 'Stock Keeper', notes: 'Supplier delivery batch A' },
    { date: '2026-04-23', item: 'Nitrile Gloves', store: 'Nursing Stock', type: 'issue', qty: 24, reference: 'DI-443', user: 'Dept Admin', notes: 'Issued for practical session' },
  ],
  borrowing: [
    { request_id: 'BR-00219', department: 'Hospitality', requested_by: 'S. Jayasekara', items: 3, status: 'pending_approval', required_date: '2026-04-25', expected_return: '2026-04-27', actual_return: '-', overdue: 'No' },
    { request_id: 'BR-00207', department: 'Nursing', requested_by: 'N. Fernando', items: 1, status: 'rejected', required_date: '2026-04-20', expected_return: '2026-04-21', actual_return: '-', overdue: 'No' },
  ],
  'department-issuing': [
    { date: '2026-04-24', department: 'Hospitality', item: 'Chef Knife Set', category: 'Non-Consumable', qty: 5, unit: 'set', recipient: 'Lab Instructor', issued_by: 'Stock Keeper', notes: 'For practical exam prep' },
    { date: '2026-04-22', department: 'Nursing', item: 'Syringes', category: 'Consumable', qty: 80, unit: 'pcs', recipient: 'Skills Lab', issued_by: 'Stock Keeper', notes: 'Weekly requirement' },
  ],
}

