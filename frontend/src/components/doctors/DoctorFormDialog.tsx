import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { doctorService } from '@/services/doctorService'
import type { Doctor, CreateDoctorDto, UpdateDoctorDto } from '@/types/doctor'

interface DoctorFormState {
  name: string
  specialty: string
  licenseNumber: string
  phone: string
  email: string
  isActive: boolean
}
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

interface DoctorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor?: Doctor
  mode: 'create' | 'edit'
}

export function DoctorFormDialog({ open, onOpenChange, doctor, mode }: DoctorFormDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<DoctorFormState>({
    name: '',
    specialty: '',
    licenseNumber: '',
    phone: '',
    email: '',
    isActive: true,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (doctor && mode === 'edit') {
      setFormData({
        name: doctor.name,
        specialty: doctor.specialty || '',
        licenseNumber: doctor.licenseNumber || '',
        phone: doctor.phone || '',
        email: doctor.email || '',
        isActive: doctor.isActive,
      })
    } else {
      setFormData({
        name: '',
        specialty: '',
        licenseNumber: '',
        phone: '',
        email: '',
        isActive: true,
      })
    }
    setError(null)
  }, [doctor, mode, open])

  const createMutation = useMutation({
    mutationFn: (data: CreateDoctorDto) => doctorService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear el doctor')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDoctorDto) => doctorService.update(doctor!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar el doctor')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }

    const submitData = {
      ...formData,
      specialty: formData.specialty || undefined,
      licenseNumber: formData.licenseNumber || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
    }

    if (mode === 'create') {
      createMutation.mutate(submitData as CreateDoctorDto)
    } else {
      updateMutation.mutate(submitData as UpdateDoctorDto)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Registrar Nuevo Doctor' : 'Editar Doctor'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Ingresa los datos del nuevo doctor'
              : 'Modifica los datos del doctor'}
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
                placeholder="Dr. María González"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Cirugía Veterinaria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Número de Licencia</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="VET-12345"
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
                placeholder="doctor@veterinaria.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Estado</Label>
              <Select
                id="isActive"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </Select>
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
              {mode === 'create' ? 'Registrar Doctor' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
