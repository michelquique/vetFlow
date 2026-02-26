import { api } from './api'
import type { Breed, CreateBreedDto, UpdateBreedDto } from '@/types/breed'

export interface SearchBreedParams {
  speciesTypeId?: string
  search?: string
  limit?: number
}

export const breedService = {
  async getAll(): Promise<Breed[]> {
    const response = await api.get<Breed[]>('/breeds')
    return response.data
  },

  async getBySpecies(speciesId: string): Promise<Breed[]> {
    const response = await api.get<Breed[]>('/breeds', { params: { speciesTypeId: speciesId } })
    return response.data
  },

  async search(params: SearchBreedParams): Promise<Breed[]> {
    const response = await api.get<Breed[]>('/breeds', { params })
    return response.data
  },

  async getOne(id: string): Promise<Breed> {
    const response = await api.get<Breed>(`/breeds/${id}`)
    return response.data
  },

  async create(data: CreateBreedDto): Promise<Breed> {
    const response = await api.post<Breed>('/breeds', data)
    return response.data
  },

  async update(id: string, data: UpdateBreedDto): Promise<Breed> {
    const response = await api.patch<Breed>(`/breeds/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/breeds/${id}`)
  },
}
