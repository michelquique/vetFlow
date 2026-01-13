import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientService } from '@/services/clientService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, Phone, Mail, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatRUT } from '@/lib/utils'

export default function Clients() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', page, searchTerm],
    queryFn: () => clientService.getAll({ page, limit: 10, search: searchTerm }),
  })

  const totalPages = clientsData ? Math.ceil(clientsData.total / 10) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">
            {clientsData?.total || 0} clientes registrados
          </p>
        </div>
        <Button size="lg" className="gap-2 shadow-lg">
          <UserPlus className="h-5 w-5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, RUT, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : clientsData && clientsData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientsData.data.map((client) => (
              <Card
                key={client.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-purple-50"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        {client.rut && (
                          <p className="text-sm text-gray-500">{formatRUT(client.rut)}</p>
                        )}
                      </div>
                    </div>
                    {client.clientType === 'VIP' && (
                      <Badge variant="warning" className="gap-1">
                        <Star className="h-3 w-3" />
                        VIP
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{client.city}</span>
                    </div>
                  )}
                  {Number(client.discount) > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <Badge variant="success" className="text-xs">
                        {client.discount}% descuento
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-gray-500 mb-4">
              Intenta con otro término de búsqueda o registra un nuevo cliente
            </p>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Registrar Primer Cliente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
