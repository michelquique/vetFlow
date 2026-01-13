import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, PawPrint, Stethoscope, Activity, TrendingUp, Calendar } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  })

  const { data: recentConsultations, isLoading: consultationsLoading } = useQuery({
    queryKey: ['recent-consultations'],
    queryFn: () => dashboardService.getRecentConsultations(),
  })

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats?.totalClients || 0,
      description: 'Clientes registrados',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      title: 'Total Mascotas',
      value: stats?.totalPets || 0,
      description: `${stats?.alivePets || 0} activas`,
      icon: PawPrint,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
    },
    {
      title: 'Consultas Hoy',
      value: stats?.todayConsultations || 0,
      description: `${stats?.totalConsultations || 0} totales`,
      icon: Stethoscope,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    {
      title: 'Doctores Activos',
      value: stats?.totalDoctors || 0,
      description: 'Equipo veterinario',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bienvenido al sistema VetFlow</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">{formatDate(new Date())}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${stat.bgGradient}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <h3 className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Consultations */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Consultas Recientes
            </CardTitle>
            <CardDescription>Últimas atenciones médicas</CardDescription>
          </CardHeader>
          <CardContent>
            {consultationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : recentConsultations && recentConsultations.length > 0 ? (
              <div className="space-y-4">
                {recentConsultations.slice(0, 5).map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-purple-50 hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {consultation.pet?.name}
                        </p>
                        <Badge variant={consultation.type === 'Curativa' ? 'default' : 'success'} className="text-xs">
                          {consultation.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {consultation.client?.name} • Dr. {consultation.doctor?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(consultation.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(Number(consultation.amount))}
                      </p>
                      {Number(consultation.balance) > 0 && (
                        <Badge variant="warning" className="text-xs mt-1">
                          Pendiente: {formatCurrency(Number(consultation.balance))}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay consultas recientes</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Atajos frecuentes del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admission"
              className="flex items-center gap-4 p-4 rounded-lg bg-white hover:shadow-lg transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Nueva Admisión</p>
                <p className="text-sm text-gray-500">Registrar cliente y mascota</p>
              </div>
            </a>

            <a
              href="/consultations"
              className="flex items-center gap-4 p-4 rounded-lg bg-white hover:shadow-lg transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Nueva Consulta</p>
                <p className="text-sm text-gray-500">Registrar atención médica</p>
              </div>
            </a>

            <a
              href="/pets"
              className="flex items-center gap-4 p-4 rounded-lg bg-white hover:shadow-lg transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ver Mascotas</p>
                <p className="text-sm text-gray-500">Buscar fichas y historial</p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Image */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="relative h-64">
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80"
            alt="Veterinary team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-2">Bienvenido a VetFlow</h2>
              <p className="text-lg text-blue-100">Sistema integral de gestión veterinaria</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
