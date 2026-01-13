import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Stethoscope,
  UserPlus,
  Calendar,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
  { name: 'Admisión', href: '/admission', icon: UserPlus, color: 'text-green-600' },
  { name: 'Clientes', href: '/clients', icon: Users, color: 'text-purple-600' },
  { name: 'Mascotas', href: '/pets', icon: PawPrint, color: 'text-orange-600' },
  { name: 'Consultas', href: '/consultations', icon: Stethoscope, color: 'text-red-600' },
  { name: 'Agenda', href: '/schedule', icon: Calendar, color: 'text-cyan-600' },
  { name: 'Recordatorios', href: '/reminders', icon: Bell, color: 'text-yellow-600' },
  { name: 'Reportes', href: '/reports', icon: FileText, color: 'text-gray-600' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 shadow-lg',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900">VetFlow</span>
              <span className="text-xs text-gray-500">Sistema Veterinario</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md mx-auto">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-gray-200 bg-white shadow-md hover:shadow-lg transition-all"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                collapsed && 'justify-center'
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? item.color : 'text-gray-400')} />
              {!collapsed && <span>{item.name}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
            A
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@vetflow.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
