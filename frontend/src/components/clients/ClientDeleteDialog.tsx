import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService } from '@/services/clientService'
import type { Client } from '@/types/client'
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

interface ClientDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client
}

export function ClientDeleteDialog({ open, onOpenChange, client }: ClientDeleteDialogProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => clientService.delete(client.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al eliminar el cliente')
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
              <DialogTitle>Eliminar Cliente</DialogTitle>
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
            ¿Estás seguro de que deseas eliminar al cliente <span className="font-semibold">{client.name}</span>?
          </p>
          {client.rut && (
            <p className="text-xs text-gray-500 mt-2">RUT: {client.rut}</p>
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
            Eliminar Cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
