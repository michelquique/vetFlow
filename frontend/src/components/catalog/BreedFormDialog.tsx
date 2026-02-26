import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { breedService } from '@/services/breedService'
import { speciesService } from '@/services/speciesService'
import type { Breed, CreateBreedDto, UpdateBreedDto } from '@/types/breed'
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
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface BreedFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  breed?: Breed
  mode: 'create' | 'edit'
  preselectedSpeciesId?: string
}

export function BreedFormDialog({ open, onOpenChange, breed, mode, preselectedSpeciesId }: BreedFormDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreateBreedDto | UpdateBreedDto>({
    name: '',
    speciesTypeId: preselectedSpeciesId || '',
    description: '',
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch species
  const { data: species } = useQuery({
    queryKey: ['species'],
    queryFn: () => speciesService.getAll(),
  })

  useEffect(() => {
    if (breed && mode === 'edit') {
      setFormData({
        name: breed.name,
        speciesTypeId: breed.speciesTypeId,
        description: breed.description || '',
      })
    } else {
      setFormData({
        name: '',
        speciesTypeId: preselectedSpeciesId || '',
        description: '',
      })
    }
    setError(null)
  }, [breed, mode, open, preselectedSpeciesId])

  const createMutation = useMutation({
    mutationFn: (data: CreateBreedDto) => breedService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear la raza')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBreedDto) => breedService.update(breed!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar la raza')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!formData.speciesTypeId) {
      setError('La especie es requerida')
      return
    }

    const submitData = {
      ...formData,
      description: formData.description || undefined,
    }

    if (mode === 'create') {
      createMutation.mutate(submitData as CreateBreedDto)
    } else {
      updateMutation.mutate(submitData as UpdateBreedDto)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Registrar Nueva Raza' : 'Editar Raza'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Ingresa los datos de la nueva raza'
              : 'Modifica los datos de la raza'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Golden Retriever"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speciesTypeId">
              Especie <span className="text-red-500">*</span>
            </Label>
            <Select
              id="speciesTypeId"
              value={formData.speciesTypeId}
              onChange={(e) => setFormData({ ...formData, speciesTypeId: e.target.value })}
              required
              disabled={!!preselectedSpeciesId}
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
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Raza mediana, amigable"
              rows={3}
            />
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
              {mode === 'create' ? 'Registrar Raza' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
