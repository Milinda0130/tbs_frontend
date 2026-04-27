import { Link } from 'react-router-dom'
import { FileSpreadsheet, FileText, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '@/stores/AuthContext'

export function ReportsHubPage() {
  const { user } = useAuth()
  const cards = [
    { to: '/reports/monthly-stock-usage', title: 'Monthly Stock Usage', icon: FileSpreadsheet, roles: ['Admin', 'Main Coordinator', 'Audit Officer', 'Dept Admin'] },
    { to: '/reports/stock-movements', title: 'Stock Movement', icon: FileText, roles: ['Admin', 'Main Coordinator', 'Audit Officer'] },
    { to: '/reports/borrowing', title: 'Borrowing', icon: ShieldCheck, roles: ['Admin', 'Main Coordinator', 'Audit Officer', 'Dept Admin'] },
    { to: '/reports/department-issuing', title: 'Department Issuing', icon: Users, roles: ['Admin', 'Main Coordinator', 'Audit Officer', 'Dept Admin'] },
  ]
  const visibleCards = cards.filter(card => {
    if (!user) return true
    return card.roles.includes(user.role)
  })

  return <div className="grid gap-4 md:grid-cols-2">{visibleCards.map(card => <div key={card.to} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><card.icon className="mb-3 text-blue-600 dark:text-blue-400" /><h3 className="font-semibold">{card.title}</h3><Link className="mt-3 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400" to={card.to}>Generate report</Link></div>)}</div>
}
