import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { petService } from '@/services/petService'
import { speciesService } from '@/services/speciesService'
import type { Pet, CreatePetDto, UpdatePetDto } from '@/types/pet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { ClientSearchSelect } from '@/components/ui/client-search-select'
import { BreedSearchSelect } from '@/components/ui/breed-search-select'
import { Loader2 } from 'lucide-react'

interface PetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet?: Pet
  mode: 'create' | 'edit'
  preselectedClientId?: string
}

export function PetFormDialog({ open, onOpenChange, pet, mode, preselectedClientId }: PetFormDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreatePetDto | UpdatePetDto>({
    name: '',
    clientId: preselectedClientId || '',
    speciesTypeId: '',
    breedId: '',
    sex: 'M',
    size: 'M',
    color: '',
    birthDate: '',
    isAlive: true,
    deathDate: '',
    photoUrl: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('')

  // Fetch species
  const { data: species } = useQuery({
    queryKey: ['species'],
    queryFn: () => speciesService.getAll(),
  })

  useEffect(() => {
    if (pet && mode === 'edit') {
      setFormData({
        name: pet.name,
        clientId: pet.clientId,
        speciesTypeId: pet.speciesTypeId,
        breedId: pet.breedId || '',
        sex: pet.sex,
        size: pet.size,
        color: pet.color || '',
        birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString().split('T')[0] : '',
        isAlive: pet.isAlive,
        deathDate: pet.deathDate ? new Date(pet.deathDate).toISOString().split('T')[0] : '',
        photoUrl: pet.photoUrl || '',
      })
      setSelectedSpeciesId(pet.speciesTypeId)
    } else {
      setFormData({
        name: '',
        clientId: preselectedClientId || '',
        speciesTypeId: '',
        breedId: '',
        sex: 'M',
        size: 'M',
        color: '',
        birthDate: '',
        isAlive: true,
        deathDate: '',
        photoUrl: '',
      })
      setSelectedSpeciesId('')
    }
    setError(null)
  }, [pet, mode, open, preselectedClientId])

  const createMutation = useMutation({
    mutationFn: (data: CreatePetDto) => petService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      queryClient.invalidateQueries({ queryKey: ['client-pets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear la mascota')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePetDto) => petService.update(pet!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar la mascota')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!formData.clientId) {
      setError('El cliente es requerido')
      return
    }
    if (!formData.speciesTypeId) {
      setError('La especie es requerida')
      return
    }

    const submitData = {
      ...formData,
      breedId: formData.breedId || undefined,
      color: formData.color || undefined,
      birthDate: formData.birthDate || undefined,
      deathDate: formData.deathDate || undefined,
      photoUrl: formData.photoUrl || undefined,
    }

    if (mode === 'create') {
      createMutation.mutate(submitData as CreatePetDto)
    } else {
      updateMutation.mutate(submitData as UpdatePetDto)
    }
  }

  const handleSpeciesChange = (speciesId: string) => {
    setSelectedSpeciesId(speciesId)
    setFormData({ ...formData, speciesTypeId: speciesId, breedId: '' })
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Registrar Nueva Mascota' : 'Editar Mascota'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Ingresa los datos de la nueva mascota'
              : 'Modifica los datos de la mascota'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Luna"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">
                Dueño <span className="text-red-500">*</span>
              </Label>
              <ClientSearchSelect
                value={formData.clientId}
                onChange={(clientId) => setFormData({ ...formData, clientId })}
                disabled={!!preselectedClientId}
                placeholder="Buscar por nombre, RUT o teléfono..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="speciesTypeId">
                Especie <span className="text-red-500">*</span>
              </Label>
              <Select
                id="speciesTypeId"
                value={formData.speciesTypeId}
                onChange={(e) => handleSpeciesChange(e.target.value)}
                required
              >
                <option value="">Selecciona una especie</option>
                {species?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breedId">Raza</Label>
              <BreedSearchSelect
                value={formData.breedId || ''}
                onChange={(breedId) => setFormData({ ...formData, breedId })}
                speciesTypeId={selectedSpeciesId}
                placeholder="Buscar raza..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">
                Sexo <span className="text-red-500">*</span>
              </Label>
              <Select
                id="sex"
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'M' | 'F' })}
                required
              >
                <option value="M">Macho</option>
                <option value="F">Hembra</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">
                Tamaño <span className="text-red-500">*</span>
              </Label>
              <Select
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value as 'S' | 'M' | 'L' })}
                required
              >
                <option value="S">Pequeño</option>
                <option value="M">Mediano</option>
                <option value="L">Grande</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Dorado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isAlive">Estado</Label>
              <Select
                id="isAlive"
                value={formData.isAlive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isAlive: e.target.value === 'true' })}
              >
                <option value="true">Vivo</option>
                <option value="false">Fallecido</option>
              </Select>
            </div>

            {!formData.isAlive && (
              <div className="space-y-2">
                <Label htmlFor="deathDate">Fecha de Fallecimiento</Label>
                <Input
                  id="deathDate"
                  type="date"
                  value={formData.deathDate}
                  onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="photoUrl">URL de Foto</Label>
              <Input
                id="photoUrl"
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Registrar Mascota' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
