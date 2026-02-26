import { useMutation, useQueryClient } from '@tanstack/react-query'
import { petService } from '@/services/petService'
import type { Pet } from '@/types/pet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface PetDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet: Pet
}

export function PetDeleteDialog({ open, onOpenChange, pet }: PetDeleteDialogProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => petService.delete(pet.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al eliminar la mascota')
    },
  })

  const handleDelete = () => {
    setError(null)
    deleteMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Eliminar Mascota</DialogTitle>
              <DialogDescription>Esta acción no se puede deshacer</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <p className="text-sm">{error}</p>
          </Alert>
        )}

        <div className="py-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar a <span className="font-semibold">{pet.name}</span>?
          </p>
          <p className="text-xs text-gray-500 mt-2">Ficha #{pet.ficha}</p>
          {pet.client && (
            <p className="text-xs text-gray-500">Dueño: {pet.client.name}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar Mascota
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
