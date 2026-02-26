import { useMutation, useQueryClient } from '@tanstack/react-query'
import { consultationService } from '@/services/consultationService'
import type { Consultation } from '@/types/consultation'
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
import { formatDate } from '@/lib/utils'

interface ConsultationDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consultation: Consultation
}

export function ConsultationDeleteDialog({ open, onOpenChange, consultation }: ConsultationDeleteDialogProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: () => consultationService.delete(consultation.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      queryClient.invalidateQueries({ queryKey: ['consultations-count'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-consultations'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al eliminar la consulta')
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
              <DialogTitle>Eliminar Consulta</DialogTitle>
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
          <p className="text-sm text-gray-600 mb-3">
            ¿Estás seguro de que deseas eliminar esta consulta?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg space-y-1">
            <p className="text-sm">
              <span className="text-gray-500">Consulta:</span>{' '}
              <span className="font-semibold">#{consultation.consultationNumber}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Mascota:</span>{' '}
              <span className="font-semibold">{consultation.pet?.name || 'N/A'}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Cliente:</span>{' '}
              <span className="font-semibold">{consultation.client?.name || 'N/A'}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Fecha:</span>{' '}
              <span className="font-semibold">{formatDate(consultation.date)}</span>
            </p>
          </div>
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
            Eliminar Consulta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
