import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientService } from '@/services/clientService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, PawPrint, Phone, Mail, MapPin } from 'lucide-react'

export default function Admission() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients-search', searchTerm],
    queryFn: () => clientService.getAll({ search: searchTerm, limit: 5 }),
    enabled: searchTerm.length >= 2,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admisión</h1>
        <p className="text-gray-500 mt-1">Buscar cliente existente o registrar nuevo</p>
      </div>

      {/* Search Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-green-600" />
            Buscar Cliente
          </CardTitle>
          <CardDescription>
            Buscar por nombre, RUT, teléfono o email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button size="lg" className="gap-2 shadow-md">
              <UserPlus className="h-5 w-5" />
              Nuevo Cliente
            </Button>
          </div>

          {/* Search Results */}
          {searchTerm.length >= 2 && (
            <div className="mt-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : clientsData && clientsData.data.length > 0 ? (
                <div className="space-y-2">
                  {clientsData.data.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className="p-4 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{client.name}</p>
                            {client.clientType === 'VIP' && (
                              <Badge variant="warning" className="text-xs">VIP</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            {client.rut && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {client.rut}
                              </span>
                            )}
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </span>
                            )}
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {client.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Seleccionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No se encontraron clientes</p>
                  <Button size="sm" className="mt-3">
                    Registrar nuevo cliente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Client Pets */}
      {selectedClient && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-orange-600" />
              Mascotas de {selectedClient.name}
            </CardTitle>
            <CardDescription>
              Selecciona una mascota o registra una nueva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Este cliente aún no tiene mascotas registradas</p>
              <Button className="gap-2 shadow-md">
                <PawPrint className="h-4 w-4" />
                Registrar Nueva Mascota
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Image */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="relative h-48">
          <img
            src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&q=80"
            alt="Veterinary admission"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-emerald-900/80 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h3 className="text-2xl font-bold mb-2">Proceso de Admisión</h3>
              <p className="text-green-100">Busca al cliente y registra a su mascota para iniciar la consulta</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
