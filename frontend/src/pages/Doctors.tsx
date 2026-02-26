import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { doctorService } from '@/services/doctorService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, Phone, Mail, Award, Edit2, Trash2 } from 'lucide-react'
import { DoctorFormDialog } from '@/components/doctors/DoctorFormDialog'
import { DoctorDeleteDialog } from '@/components/doctors/DoctorDeleteDialog'
import type { Doctor } from '@/types/doctor'

export default function Doctors() {
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>()
  const [mode, setMode] = useState<'create' | 'edit'>('create')

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorService.getAll(),
  })

  const handleCreate = () => {
    setSelectedDoctor(undefined)
    setMode('create')
    setFormDialogOpen(true)
  }

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setMode('edit')
    setFormDialogOpen(true)
  }

  const handleDelete = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctores</h1>
          <p className="text-gray-500 mt-1">
            {doctors?.length || 0} doctores registrados
          </p>
        </div>
        <Button size="lg" className="gap-2 shadow-lg" onClick={handleCreate}>
          <Stethoscope className="h-5 w-5" />
          Nuevo Doctor
        </Button>
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : doctors && doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {doctor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{doctor.name}</CardTitle>
                      {doctor.specialty && (
                        <p className="text-sm text-gray-600 mt-1">{doctor.specialty}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={doctor.isActive ? 'success' : 'secondary'} className="text-xs">
                    {doctor.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {doctor.licenseNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Lic. {doctor.licenseNumber}</span>
                  </div>
                )}

                {doctor.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{doctor.phone}</span>
                  </div>
                )}

                {doctor.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleEdit(doctor)}
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleDelete(doctor)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay doctores registrados
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza registrando el primer doctor del equipo
            </p>
            <Button className="gap-2" onClick={handleCreate}>
              <Stethoscope className="h-4 w-4" />
              Registrar Primer Doctor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <DoctorFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        doctor={selectedDoctor}
        mode={mode}
      />

      {selectedDoctor && (
        <DoctorDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          doctor={selectedDoctor}
        />
      )}
    </div>
  )
}
