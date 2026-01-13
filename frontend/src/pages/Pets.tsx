import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { petService } from '@/services/petService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, PawPrint, Calendar, Heart, Skull, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function Pets() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: petsData, isLoading } = useQuery({
    queryKey: ['pets', page, searchTerm],
    queryFn: () => petService.getAll({ page, limit: 12, search: searchTerm }),
  })

  const totalPages = petsData ? Math.ceil(petsData.total / 12) : 0

  const getSexIcon = (sex: string) => {
    return sex === 'M' ? '♂' : '♀'
  }

  const getSexColor = (sex: string) => {
    return sex === 'M' ? 'text-blue-600' : 'text-pink-600'
  }

  const getSizeLabel = (size: string) => {
    const sizes: Record<string, string> = {
      S: 'Pequeño',
      M: 'Mediano',
      L: 'Grande',
    }
    return sizes[size] || size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mascotas</h1>
          <p className="text-gray-500 mt-1">
            {petsData?.total || 0} mascotas registradas
          </p>
        </div>
        <Button size="lg" className="gap-2 shadow-lg">
          <PawPrint className="h-5 w-5" />
          Nueva Mascota
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, ficha, dueño..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pets Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : petsData && petsData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {petsData.data.map((pet) => (
              <Card
                key={pet.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Pet Image */}
                <div className="relative h-48 bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-50">
                  {pet.photoUrl ? (
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={`https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80`}
                        alt="Pet placeholder"
                        className="w-full h-full object-cover opacity-60"
                      />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {pet.isAlive ? (
                      <Badge variant="success" className="gap-1 shadow-md">
                        <Heart className="h-3 w-3" />
                        Vivo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 shadow-md">
                        <Skull className="h-3 w-3" />
                        Fallecido
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="shadow-md">Ficha #{pet.ficha}</Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {pet.name}
                      <span className={`text-2xl ${getSexColor(pet.sex)}`}>
                        {getSexIcon(pet.sex)}
                      </span>
                    </CardTitle>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {pet.speciesType?.name || 'Especie'}
                    </Badge>
                    {pet.breed && (
                      <Badge variant="outline" className="text-xs">
                        {pet.breed.name}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dueño:</span>
                    <span className="font-semibold text-gray-900">
                      {pet.client?.name || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tamaño:</span>
                    <Badge variant="secondary" className="text-xs">
                      {getSizeLabel(pet.size)}
                    </Badge>
                  </div>

                  {pet.color && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium text-gray-900">{pet.color}</span>
                    </div>
                  )}

                  {pet.birthDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Nació {formatDate(pet.birthDate)}</span>
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
            <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron mascotas
            </h3>
            <p className="text-gray-500 mb-4">
              Intenta con otro término de búsqueda o registra una nueva mascota
            </p>
            <Button className="gap-2">
              <PawPrint className="h-4 w-4" />
              Registrar Primera Mascota
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
