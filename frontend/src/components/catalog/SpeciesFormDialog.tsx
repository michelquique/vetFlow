import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { speciesService } from '@/services/speciesService'
import type { SpeciesType, CreateSpeciesDto, UpdateSpeciesDto } from '@/types/species'
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
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface SpeciesFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  species?: SpeciesType
  mode: 'create' | 'edit'
}

export function SpeciesFormDialog({ open, onOpenChange, species, mode }: SpeciesFormDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreateSpeciesDto | UpdateSpeciesDto>({
    name: '',
    description: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (species && mode === 'edit') {
      setFormData({
        name: species.name,
        description: species.description || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
      })
    }
    setError(null)
  }, [species, mode, open])

  const createMutation = useMutation({
    mutationFn: (data: CreateSpeciesDto) => speciesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear la especie')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSpeciesDto) => speciesService.update(species!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar la especie')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!(formData.name ?? '').trim()) {
      setError('El nombre es requerido')
      return
    }

    const submitData = {
      ...formData,
      description: formData.description || undefined,
    }

    if (mode === 'create') {
      createMutation.mutate(submitData as CreateSpeciesDto)
    } else {
      updateMutation.mutate(submitData as UpdateSpeciesDto)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Registrar Nueva Especie' : 'Editar Especie'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Ingresa los datos de la nueva especie'
              : 'Modifica los datos de la especie'}
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
              placeholder="Perro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Canis lupus familiaris"
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
              {mode === 'create' ? 'Registrar Especie' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
