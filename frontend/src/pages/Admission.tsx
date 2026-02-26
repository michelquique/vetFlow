import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientService } from '@/services/clientService'
import { petService } from '@/services/petService'
import { doctorService } from '@/services/doctorService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { 
  Search, 
  UserPlus, 
  PawPrint, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Stethoscope,
  CheckCircle,
  User
} from 'lucide-react'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { PetFormDialog } from '@/components/pets/PetFormDialog'
import { ConsultationFormDialog } from '@/components/consultations/ConsultationFormDialog'
import { formatDate } from '@/lib/utils'
import type { Client } from '@/types/client'
import type { Pet } from '@/types/pet'

export default function Admission() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [clientFormOpen, setClientFormOpen] = useState(false)
  const [petFormOpen, setPetFormOpen] = useState(false)
  const [consultationFormOpen, setConsultationFormOpen] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Query clientes
  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients-search', debouncedSearch],
    queryFn: () => clientService.getAll({ search: debouncedSearch, limit: 10 }),
    enabled: debouncedSearch.length >= 2,
  })

  // Query mascotas del cliente seleccionado - ahora filtra correctamente por clientId
  const { data: clientPetsData, isLoading: petsLoading } = useQuery({
    queryKey: ['client-pets', selectedClient?.id],
    queryFn: () => petService.getAll({ clientId: selectedClient!.id, limit: 100 }),
    enabled: !!selectedClient?.id,
  })

  // Query doctores activos
  const { data: doctors } = useQuery({
    queryKey: ['doctors-active'],
    queryFn: () => doctorService.getActive(),
  })

  const clientPets = clientPetsData?.data || []

  // Reset pet selection when client changes
  useEffect(() => {
    setSelectedPet(null)
    setSelectedDoctorId('')
  }, [selectedClient?.id])

  const handleCreateClient = () => {
    setClientFormOpen(true)
  }

  const handleCreatePet = () => {
    setPetFormOpen(true)
  }

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(selectedPet?.id === pet.id ? null : pet)
  }

  const handleStartConsultation = () => {
    if (selectedPet && selectedClient && selectedDoctorId) {
      setConsultationFormOpen(true)
    }
  }

  const handleClientCreated = (client: Client) => {
    setSelectedClient(client)
    setSearchTerm('')
    setDebouncedSearch('')
  }

  const canStartConsultation = selectedClient && selectedPet && selectedDoctorId

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
            <Button size="lg" className="gap-2 shadow-md" onClick={handleCreateClient}>
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
                  <Button size="sm" className="mt-3" onClick={handleCreateClient}>
                    Registrar nuevo cliente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Client Info */}
      {selectedClient && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cliente Seleccionado</CardTitle>
                <CardDescription>Información del cliente actual</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedClient(null)}
              >
                Cambiar Cliente
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-semibold text-gray-900">{selectedClient.name}</p>
              </div>
              {selectedClient.rut && (
                <div>
                  <p className="text-sm text-gray-500">RUT</p>
                  <p className="font-semibold text-gray-900">{selectedClient.rut}</p>
                </div>
              )}
              {selectedClient.phone && (
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-semibold text-gray-900">{selectedClient.phone}</p>
                </div>
              )}
              {selectedClient.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{selectedClient.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Client Pets */}
      {selectedClient && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-orange-600" />
                  Mascotas de {selectedClient.name}
                </CardTitle>
                <CardDescription>
                  Selecciona una mascota para iniciar la consulta
                </CardDescription>
              </div>
              <Button className="gap-2 shadow-md" onClick={handleCreatePet}>
                <PawPrint className="h-4 w-4" />
                Nueva Mascota
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {petsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : clientPets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientPets.map((pet) => {
                  const isSelected = selectedPet?.id === pet.id
                  return (
                    <Card
                      key={pet.id}
                      onClick={() => handleSelectPet(pet)}
                      className={`border-2 hover:shadow-md transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                              isSelected 
                                ? 'bg-primary' 
                                : 'bg-gradient-to-br from-orange-400 to-red-500'
                            }`}>
                              {isSelected ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                pet.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{pet.name}</p>
                              <p className="text-xs text-gray-500">Ficha #{pet.ficha}</p>
                            </div>
                          </div>
                          <Badge variant={pet.isAlive ? 'success' : 'secondary'} className="text-xs">
                            {pet.isAlive ? 'Vivo' : 'Fallecido'}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Especie:</span>
                            <span className="font-medium">{pet.speciesType?.name || 'N/A'}</span>
                          </div>
                          {pet.breed && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Raza:</span>
                              <span className="font-medium">{pet.breed.name}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Sexo:</span>
                            <span className="font-medium">{pet.sex === 'M' ? 'Macho' : 'Hembra'}</span>
                          </div>
                          {pet.birthDate && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                Nació {formatDate(pet.birthDate)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Este cliente aún no tiene mascotas registradas</p>
                <Button className="gap-2 shadow-md" onClick={handleCreatePet}>
                  <PawPrint className="h-4 w-4" />
                  Registrar Primera Mascota
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Doctor Selection and Start Consultation */}
      {selectedClient && selectedPet && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              Iniciar Consulta
            </CardTitle>
            <CardDescription>
              Selecciona el veterinario para iniciar la consulta de {selectedPet.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Veterinario <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="h-12"
                >
                  <option value="">Selecciona un veterinario</option>
                  {doctors?.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div className="flex-1 p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                    {selectedPet.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedPet.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedPet.speciesType?.name} • {selectedPet.breed?.name || 'Sin raza'}
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="gap-2 shadow-lg h-12 px-8"
                onClick={handleStartConsultation}
                disabled={!canStartConsultation}
              >
                <Stethoscope className="h-5 w-5" />
                Iniciar Consulta
              </Button>
            </div>

            {!selectedDoctorId && (
              <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Selecciona un veterinario para continuar
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Image - only show when no client selected */}
      {!selectedClient && (
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
                <p className="text-green-100">Busca al cliente y selecciona su mascota para iniciar la consulta</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <ClientFormDialog
        open={clientFormOpen}
        onOpenChange={setClientFormOpen}
        mode="create"
        onSuccess={handleClientCreated}
      />

      {selectedClient && (
        <PetFormDialog
          open={petFormOpen}
          onOpenChange={setPetFormOpen}
          mode="create"
          preselectedClientId={selectedClient.id}
        />
      )}

      {selectedClient && selectedPet && selectedDoctorId && (
        <ConsultationFormDialog
          open={consultationFormOpen}
          onOpenChange={setConsultationFormOpen}
          mode="create"
          preselectedPetId={selectedPet.id}
          preselectedClientId={selectedClient.id}
          preselectedDoctorId={selectedDoctorId}
        />
      )}
    </div>
  )
}
