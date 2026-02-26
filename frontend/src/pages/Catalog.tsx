import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { speciesService } from '@/services/speciesService'
import { breedService } from '@/services/breedService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PawPrint, Plus, Edit2, Trash2, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react'
import { SpeciesFormDialog } from '@/components/catalog/SpeciesFormDialog'
import { BreedFormDialog } from '@/components/catalog/BreedFormDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Alert } from '@/components/ui/alert'
import type { SpeciesType } from '@/types/species'
import type { Breed } from '@/types/breed'

export default function Catalog() {
  const queryClient = useQueryClient()
  const [speciesFormOpen, setSpeciesFormOpen] = useState(false)
  const [breedFormOpen, setBreedFormOpen] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesType | undefined>()
  const [selectedBreed, setSelectedBreed] = useState<Breed | undefined>()
  const [speciesMode, setSpeciesMode] = useState<'create' | 'edit'>('create')
  const [breedMode, setBreedMode] = useState<'create' | 'edit'>('create')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'species' | 'breed'>('species')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [expandedSpecies, setExpandedSpecies] = useState<string | null>(null)

  const { data: species, isLoading: speciesLoading } = useQuery({
    queryKey: ['species'],
    queryFn: () => speciesService.getAll(),
  })

  const { data: allBreeds } = useQuery({
    queryKey: ['breeds'],
    queryFn: () => breedService.getAll(),
  })

  const deleteSpeciesMutation = useMutation({
    mutationFn: (id: string) => speciesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] })
      setDeleteDialogOpen(false)
      setDeleteError(null)
    },
    onError: (error: any) => {
      setDeleteError(error.response?.data?.message || 'Error al eliminar la especie')
    },
  })

  const deleteBreedMutation = useMutation({
    mutationFn: (id: string) => breedService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds'] })
      setDeleteDialogOpen(false)
      setDeleteError(null)
    },
    onError: (error: any) => {
      setDeleteError(error.response?.data?.message || 'Error al eliminar la raza')
    },
  })

  const handleCreateSpecies = () => {
    setSelectedSpecies(undefined)
    setSpeciesMode('create')
    setSpeciesFormOpen(true)
  }

  const handleEditSpecies = (species: SpeciesType) => {
    setSelectedSpecies(species)
    setSpeciesMode('edit')
    setSpeciesFormOpen(true)
  }

  const handleDeleteSpecies = (species: SpeciesType) => {
    setSelectedSpecies(species)
    setDeleteType('species')
    setDeleteError(null)
    setDeleteDialogOpen(true)
  }

  const handleCreateBreed = (speciesId?: string) => {
    setSelectedBreed(undefined)
    setSelectedSpecies(species?.find((s) => s.id === speciesId))
    setBreedMode('create')
    setBreedFormOpen(true)
  }

  const handleEditBreed = (breed: Breed) => {
    setSelectedBreed(breed)
    setBreedMode('edit')
    setBreedFormOpen(true)
  }

  const handleDeleteBreed = (breed: Breed) => {
    setSelectedBreed(breed)
    setDeleteType('breed')
    setDeleteError(null)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (deleteType === 'species' && selectedSpecies) {
      deleteSpeciesMutation.mutate(selectedSpecies.id)
    } else if (deleteType === 'breed' && selectedBreed) {
      deleteBreedMutation.mutate(selectedBreed.id)
    }
  }

  const getBreedsForSpecies = (speciesId: string) => {
    return allBreeds?.filter((breed) => breed.speciesTypeId === speciesId) || []
  }

  const isDeleteLoading = deleteSpeciesMutation.isPending || deleteBreedMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de Especies y Razas</h1>
        <p className="text-gray-500 mt-1">
          Gestiona las especies y razas disponibles en el sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Especies</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{species?.length || 0}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                <PawPrint className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Razas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{allBreeds?.length || 0}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <PawPrint className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Species List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Especies y Razas</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleCreateBreed()}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Raza
            </Button>
            <Button size="sm" onClick={handleCreateSpecies}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Especie
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {speciesLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : species && species.length > 0 ? (
            <div className="space-y-3">
              {species.map((sp) => {
                const breeds = getBreedsForSpecies(sp.id)
                const isExpanded = expandedSpecies === sp.id

                return (
                  <div key={sp.id} className="border rounded-lg overflow-hidden">
                    {/* Species Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setExpandedSpecies(isExpanded ? null : sp.id)}
                          >
                            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </Button>
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                            {sp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{sp.name}</h3>
                            {sp.description && (
                              <p className="text-sm text-gray-600">{sp.description}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {breeds.length} {breeds.length === 1 ? 'raza' : 'razas'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateBreed(sp.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Raza
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSpecies(sp)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSpecies(sp)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Breeds List */}
                    {isExpanded && breeds.length > 0 && (
                      <div className="p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {breeds.map((breed) => (
                            <div
                              key={breed.id}
                              className="bg-white p-3 rounded-lg border flex items-center justify-between hover:shadow-md transition-shadow"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{breed.name}</p>
                                {breed.description && (
                                  <p className="text-xs text-gray-500 mt-1">{breed.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditBreed(breed)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDeleteBreed(breed)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay especies registradas
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza registrando la primera especie
              </p>
              <Button onClick={handleCreateSpecies}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primera Especie
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SpeciesFormDialog
        open={speciesFormOpen}
        onOpenChange={setSpeciesFormOpen}
        species={selectedSpecies}
        mode={speciesMode}
      />

      <BreedFormDialog
        open={breedFormOpen}
        onOpenChange={setBreedFormOpen}
        breed={selectedBreed}
        mode={breedMode}
        preselectedSpeciesId={selectedSpecies?.id}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle>Eliminar {deleteType === 'species' ? 'Especie' : 'Raza'}</DialogTitle>
                <DialogDescription>Esta acción no se puede deshacer</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive">
              <p className="text-sm">{deleteError}</p>
            </Alert>
          )}

          <div className="py-4">
            {deleteType === 'species' && selectedSpecies ? (
              <>
                <p className="text-sm text-gray-600">
                  ¿Estás seguro de que deseas eliminar la especie{' '}
                  <span className="font-semibold">{selectedSpecies.name}</span>?
                </p>
                {getBreedsForSpecies(selectedSpecies.id).length > 0 && (
                  <p className="text-sm text-amber-600 mt-2 font-medium">
                    ⚠ Esta especie tiene {getBreedsForSpecies(selectedSpecies.id).length} raza(s) asociada(s). Debes eliminarlas primero.
                  </p>
                )}
              </>
            ) : deleteType === 'breed' && selectedBreed ? (
              <p className="text-sm text-gray-600">
                ¿Estás seguro de que deseas eliminar la raza{' '}
                <span className="font-semibold">{selectedBreed.name}</span>?
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleteLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleteLoading}
            >
              {isDeleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar {deleteType === 'species' ? 'Especie' : 'Raza'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
