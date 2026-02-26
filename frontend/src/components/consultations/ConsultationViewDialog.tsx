import type { Consultation } from '@/types/consultation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Calendar,
  User,
  PawPrint,
  Stethoscope,
  FileText,
  Pill,
  TestTube,
  DollarSign,
  CalendarCheck,
} from 'lucide-react'

interface ConsultationViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consultation: Consultation
}

export function ConsultationViewDialog({ open, onOpenChange, consultation }: ConsultationViewDialogProps) {
  const balance = Number(consultation.balance)
  const hasBalance = balance > 0

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { variant: any; label: string }> = {
      Active: { variant: 'default', label: 'Activa' },
      Completed: { variant: 'success', label: 'Completada' },
      Cancelled: { variant: 'destructive', label: 'Cancelada' },
    }
    return statuses[status] || statuses.Active
  }

  const statusInfo = getStatusBadge(consultation.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Consulta #{consultation.consultationNumber}
              </DialogTitle>
              <DialogDescription>Detalles completos de la consulta médica</DialogDescription>
            </div>
            <Badge variant={statusInfo.variant} className="text-sm">
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <PawPrint className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mascota</p>
                    <p className="font-semibold">{consultation.pet?.name || 'N/A'}</p>
                    {consultation.pet && (
                      <p className="text-xs text-gray-500">Ficha #{consultation.pet.ficha}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cliente</p>
                    <p className="font-semibold">{consultation.client?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Doctor</p>
                    <p className="font-semibold">{consultation.doctor?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha</p>
                    <p className="font-semibold">{formatDate(consultation.date)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <Badge variant={consultation.type === 'Curativa' ? 'default' : 'success'}>
                  {consultation.type}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Medical Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detalles Médicos
            </h3>

            {consultation.reason && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 mb-1">Motivo de Consulta</p>
                <p className="text-sm text-gray-800">{consultation.reason}</p>
              </div>
            )}

            {consultation.symptoms && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 mb-1">Síntomas</p>
                <p className="text-sm text-gray-800">{consultation.symptoms}</p>
              </div>
            )}

            {consultation.diagnosis && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Diagnóstico
                </p>
                <p className="text-sm text-blue-900">{consultation.diagnosis}</p>
              </div>
            )}

            {consultation.treatment && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-green-900 mb-1 flex items-center gap-2">
                  <Pill className="h-3 w-3" />
                  Tratamiento
                </p>
                <p className="text-sm text-green-900">{consultation.treatment}</p>
              </div>
            )}

            {consultation.exams && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-purple-900 mb-1 flex items-center gap-2">
                  <TestTube className="h-3 w-3" />
                  Exámenes
                </p>
                <p className="text-sm text-purple-900">{consultation.exams}</p>
              </div>
            )}
          </div>

          {/* Next Visit */}
          {consultation.nextVisitDate && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" />
                Próxima Visita
              </h3>

              <Card className="border-0 shadow-md bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Fecha Programada</p>
                      <p className="font-semibold">{formatDate(consultation.nextVisitDate)}</p>
                    </div>
                    {consultation.nextVisitType && (
                      <div>
                        <p className="text-xs text-gray-500">Tipo de Visita</p>
                        <Badge variant={consultation.nextVisitType === 'Curativa' ? 'default' : 'success'}>
                          {consultation.nextVisitType}
                        </Badge>
                      </div>
                    )}
                    {consultation.nextTreatment && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Tratamiento Programado</p>
                        <p className="text-sm text-gray-800">{consultation.nextTreatment}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Información de Pago
            </h3>

            <Card className={`border-0 shadow-md ${hasBalance ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Monto Total</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(Number(consultation.amount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pagado</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(Number(consultation.paid))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Saldo</p>
                    <p className={`text-xl font-bold ${hasBalance ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
