import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { consultationService } from '@/services/consultationService'
import { petService } from '@/services/petService'
import { clientService } from '@/services/clientService'
import { doctorService } from '@/services/doctorService'
import type { Consultation, ConsultationType, ConsultationStatus, CreateConsultationDto, UpdateConsultationDto } from '@/types/consultation'

interface ConsultationFormState {
  petId: string
  clientId: string
  doctorId: string
  date: string
  type: ConsultationType
  reason: string
  symptoms: string
  diagnosis: string
  treatment: string
  exams: string
  nextVisitDate: string
  nextVisitType: string
  nextTreatment: string
  amount: number
  paid: number
  status: ConsultationStatus
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
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface ConsultationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consultation?: Consultation
  mode: 'create' | 'edit'
  preselectedPetId?: string
  preselectedClientId?: string
  preselectedDoctorId?: string
}

export function ConsultationFormDialog({
  open,
  onOpenChange,
  consultation,
  mode,
  preselectedPetId,
  preselectedClientId,
  preselectedDoctorId,
}: ConsultationFormDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<ConsultationFormState>({
    petId: preselectedPetId || '',
    clientId: preselectedClientId || '',
    doctorId: preselectedDoctorId || '',
    date: new Date().toISOString().slice(0, 16),
    type: 'Curativa',
    reason: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    exams: '',
    nextVisitDate: '',
    nextVisitType: '',
    nextTreatment: '',
    amount: 0,
    paid: 0,
    status: 'Active',
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch pets
  const { data: petsData } = useQuery({
    queryKey: ['pets-all'],
    queryFn: () => petService.getAll({ limit: 1000 }),
  })

  // Fetch clients
  const { data: clientsData } = useQuery({
    queryKey: ['clients-all'],
    queryFn: () => clientService.getAll({ limit: 1000 }),
  })

  // Fetch doctors
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorService.getAll(),
  })

  useEffect(() => {
    if (consultation && mode === 'edit') {
      setFormData({
        petId: consultation.petId,
        clientId: consultation.clientId,
        doctorId: consultation.doctorId,
        date: new Date(consultation.date).toISOString().slice(0, 16),
        type: consultation.type,
        reason: consultation.reason || '',
        symptoms: consultation.symptoms || '',
        diagnosis: consultation.diagnosis || '',
        treatment: consultation.treatment || '',
        exams: consultation.exams || '',
        nextVisitDate: consultation.nextVisitDate
          ? new Date(consultation.nextVisitDate).toISOString().split('T')[0]
          : '',
        nextVisitType: consultation.nextVisitType ?? '',
        nextTreatment: consultation.nextTreatment || '',
        amount: Number(consultation.amount) || 0,
        paid: Number(consultation.paid) || 0,
        status: consultation.status,
      })
    } else {
      setFormData({
        petId: preselectedPetId || '',
        clientId: preselectedClientId || '',
        doctorId: preselectedDoctorId || '',
        date: new Date().toISOString().slice(0, 16),
        type: 'Curativa',
        reason: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        exams: '',
        nextVisitDate: '',
        nextVisitType: '',
        nextTreatment: '',
        amount: 0,
        paid: 0,
        status: 'Active',
      })
    }
    setError(null)
  }, [consultation, mode, open, preselectedPetId, preselectedClientId, preselectedDoctorId])

  const createMutation = useMutation({
    mutationFn: (data: CreateConsultationDto) => consultationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      queryClient.invalidateQueries({ queryKey: ['consultations-count'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-consultations'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear la consulta')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateConsultationDto) => consultationService.update(consultation!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      queryClient.invalidateQueries({ queryKey: ['consultations-count'] })
      queryClient.invalidateQueries({ queryKey: ['recent-consultations'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar la consulta')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.petId) {
      setError('La mascota es requerida')
      return
    }
    if (!formData.clientId) {
      setError('El cliente es requerido')
      return
    }
    if (!formData.doctorId) {
      setError('El doctor es requerido')
      return
    }

    const submitData = {
      ...formData,
      date: new Date(formData.date),
      nextVisitDate: formData.nextVisitDate ? new Date(formData.nextVisitDate) : undefined,
      reason: formData.reason || undefined,
      symptoms: formData.symptoms || undefined,
      diagnosis: formData.diagnosis || undefined,
      treatment: formData.treatment || undefined,
      exams: formData.exams || undefined,
      nextVisitType: formData.nextVisitType || undefined,
      nextTreatment: formData.nextTreatment || undefined,
    }

    if (mode === 'create') {
      createMutation.mutate(submitData as CreateConsultationDto)
    } else {
      updateMutation.mutate(submitData as UpdateConsultationDto)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Registrar Nueva Consulta' : 'Editar Consulta'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Ingresa los datos de la consulta médica'
              : 'Modifica los datos de la consulta'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petId">
                  Mascota <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="petId"
                  value={formData.petId}
                  onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                  required
                  disabled={!!preselectedPetId}
                >
                  <option value="">Selecciona una mascota</option>
                  {petsData?.data.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} (#{pet.ficha})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">
                  Cliente <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  disabled={!!preselectedClientId}
                >
                  <option value="">Selecciona un cliente</option>
                  {clientsData?.data.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorId">
                  Doctor <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="doctorId"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  required
                  disabled={!!preselectedDoctorId}
                >
                  <option value="">Selecciona un doctor</option>
                  {doctors?.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Fecha y Hora <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Curativa' | 'Profilactica' })}
                  required
                >
                  <option value="Curativa">Curativa</option>
                  <option value="Profilactica">Profiláctica</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Completed' | 'Cancelled' })}
                >
                  <option value="Active">Activa</option>
                  <option value="Completed">Completada</option>
                  <option value="Cancelled">Cancelada</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Medical Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
              Detalles Médicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo de Consulta</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe el motivo de la consulta"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Síntomas</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Describe los síntomas observados"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnóstico</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Diagnóstico médico"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">Tratamiento</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Tratamiento prescrito"
                  rows={3}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="exams">Exámenes</Label>
                <Textarea
                  id="exams"
                  value={formData.exams}
                  onChange={(e) => setFormData({ ...formData, exams: e.target.value })}
                  placeholder="Exámenes solicitados"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Next Visit */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
              Próxima Visita
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nextVisitDate">Fecha Próxima Visita</Label>
                <Input
                  id="nextVisitDate"
                  type="date"
                  value={formData.nextVisitDate}
                  onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextVisitType">Tipo Próxima Visita</Label>
                <Select
                  id="nextVisitType"
                  value={formData.nextVisitType}
                  onChange={(e) => setFormData({ ...formData, nextVisitType: e.target.value })}
                >
                  <option value="">No especificado</option>
                  <option value="Curativa">Curativa</option>
                  <option value="Profilactica">Profiláctica</option>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="nextTreatment">Tratamiento Próxima Visita</Label>
                <Input
                  id="nextTreatment"
                  value={formData.nextTreatment}
                  onChange={(e) => setFormData({ ...formData, nextTreatment: e.target.value })}
                  placeholder="Tratamiento para próxima visita"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
              Información de Pago
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto Total</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paid">Monto Pagado</Label>
                <Input
                  id="paid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.paid}
                  onChange={(e) => setFormData({ ...formData, paid: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Saldo</Label>
                <Input
                  type="text"
                  value={`$${(formData.amount - formData.paid).toLocaleString('es-CL')}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
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
              {mode === 'create' ? 'Registrar Consulta' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
