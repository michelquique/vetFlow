import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService } from '@/services/clientService'
import type { Client, CreateClientDto, UpdateClientDto } from '@/types/client'
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
import { Loader2 } from 'lucide-react'

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client
  mode: 'create' | 'edit'
  onSuccess?: (client: Client) => void
}

export function ClientFormDialog({ open, onOpenChange, client, mode, onSuccess }: ClientFormDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreateClientDto | UpdateClientDto>({
    name: '',
    rut: '',
    address: '',
    commune: '',
    phone: '',
    email: '',
    clientType: 'Normal',
    discount: 0,
    city: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (client && mode === 'edit') {
      setFormData({
        name: client.name,
        rut: client.rut || '',
        address: client.address || '',
        commune: client.commune || '',
        phone: client.phone || '',
        email: client.email || '',
        clientType: client.clientType,
        discount: Number(client.discount) || 0,
        city: client.city || '',
      })
    } else {
      setFormData({
        name: '',
        rut: '',
        address: '',
        commune: '',
        phone: '',
        email: '',
        clientType: 'Normal',
        discount: 0,
        city: '',
      })
    }
    setError(null)
  }, [client, mode, open])

  const createMutation = useMutation({
    mutationFn: (data: CreateClientDto) => clientService.create(data),
    onSuccess: (newClient: Client) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients-search'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      if (onSuccess) {
        onSuccess(newClient)
      }
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear el cliente')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateClientDto) => clientService.update(client!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar el cliente')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!(formData.name ?? '').trim()) {
      setError('El nombre es requerido')
      return
    }

    if (mode === 'create') {
      createMutation.mutate(formData as CreateClientDto)
    } else {
      updateMutation.mutate(formData as UpdateClientDto)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Registrar Nuevo Cliente' : 'Editar Cliente'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Ingresa los datos del nuevo cliente'
              : 'Modifica los datos del cliente'}
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
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                value={formData.rut}
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                placeholder="12345678-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+56912345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Av. Providencia 123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commune">Comuna</Label>
              <Input
                id="commune"
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                placeholder="Providencia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Santiago"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientType">Tipo de Cliente</Label>
              <Select
                id="clientType"
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value as 'Normal' | 'VIP' })}
              >
                <option value="Normal">Normal</option>
                <option value="VIP">VIP</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Descuento (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                placeholder="0"
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
              {mode === 'create' ? 'Registrar Cliente' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
