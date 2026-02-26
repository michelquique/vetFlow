import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { consultationService } from '@/services/consultationService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Stethoscope,
  Calendar,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit2,
  Trash2,
  ClipboardList,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ConsultationFormDialog } from '@/components/consultations/ConsultationFormDialog'
import { ConsultationViewDialog } from '@/components/consultations/ConsultationViewDialog'
import { ConsultationDeleteDialog } from '@/components/consultations/ConsultationDeleteDialog'
import type { Consultation } from '@/types/consultation'

export default function Consultations() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | undefined>()
  const [mode, setMode] = useState<'create' | 'edit'>('create')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to page 1 on new search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: consultationsData, isLoading } = useQuery({
    queryKey: ['consultations', page, debouncedSearch],
    queryFn: () => consultationService.getAll({ page, limit: 10, search: debouncedSearch }),
  })

  // Get consultation count (total and today)
  const { data: countData } = useQuery({
    queryKey: ['consultations-count'],
    queryFn: () => consultationService.getCount(),
  })

  const totalPages = consultationsData ? Math.ceil(consultationsData.total / 10) : 0

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { variant: any; label: string; icon: any }> = {
      Active: { variant: 'default', label: 'Activa', icon: AlertCircle },
      Completed: { variant: 'success', label: 'Completada', icon: CheckCircle },
      Cancelled: { variant: 'destructive', label: 'Cancelada', icon: AlertCircle },
    }
    return statuses[status] || statuses.Active
  }

  const handleCreate = () => {
    setSelectedConsultation(undefined)
    setMode('create')
    setFormDialogOpen(true)
  }

  const handleView = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setViewDialogOpen(true)
  }

  const handleEdit = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setMode('edit')
    setFormDialogOpen(true)
  }

  const handleDelete = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas Médicas</h1>
          <p className="text-gray-500 mt-1">
            Gestión de consultas veterinarias
          </p>
        </div>
        <Button size="lg" className="gap-2 shadow-lg" onClick={handleCreate}>
          <Stethoscope className="h-5 w-5" />
          Nueva Consulta
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por mascota, cliente, doctor, motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas Hoy</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {countData?.today || 0}
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Consultas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {countData?.total || 0}
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                <ClipboardList className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultations List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : consultationsData && consultationsData.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {consultationsData.data.map((consultation) => {
              const statusInfo = getStatusBadge(consultation.status)
              const StatusIcon = statusInfo.icon
              const hasBalance = Number(consultation.balance) > 0

              return (
                <Card
                  key={consultation.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                            #{consultation.consultationNumber}
                          </div>
                          <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                              {consultation.pet?.name}
                              <Badge
                                variant={consultation.type === 'Curativa' ? 'default' : 'success'}
                                className="text-xs"
                              >
                                {consultation.type}
                              </Badge>
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span>{consultation.client?.name}</span>
                              <span>•</span>
                              <span>Dr. {consultation.doctor?.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Badge variant={statusInfo.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Date */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Fecha</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(consultation.date)}
                          </p>
                        </div>
                      </div>

                      {/* Reason */}
                      {consultation.reason && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">Motivo</p>
                            <p className="font-semibold text-gray-900 line-clamp-1">
                              {consultation.reason}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Amount */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(Number(consultation.amount))}
                          </p>
                        </div>
                      </div>

                      {/* Balance */}
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          hasBalance ? 'bg-red-50' : 'bg-green-50'
                        }`}
                      >
                        <DollarSign className={`h-5 w-5 ${hasBalance ? 'text-red-600' : 'text-green-600'}`} />
                        <div>
                          <p className="text-xs text-gray-500">Saldo</p>
                          <p className={`font-semibold ${hasBalance ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Number(consultation.balance))}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    {(consultation.diagnosis || consultation.treatment) && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                        {consultation.diagnosis && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Diagnóstico:</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{consultation.diagnosis}</p>
                          </div>
                        )}
                        {consultation.treatment && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Tratamiento:</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{consultation.treatment}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleView(consultation)}
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleEdit(consultation)}
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleDelete(consultation)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron consultas
            </h3>
            <p className="text-gray-500 mb-4">
              Intenta con otro término de búsqueda o registra una nueva consulta
            </p>
            <Button className="gap-2" onClick={handleCreate}>
              <Stethoscope className="h-4 w-4" />
              Registrar Primera Consulta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ConsultationFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        consultation={selectedConsultation}
        mode={mode}
      />

      {selectedConsultation && (
        <>
          <ConsultationViewDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            consultation={selectedConsultation}
          />
          <ConsultationDeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            consultation={selectedConsultation}
          />
        </>
      )}
    </div>
  )
}
