import { api } from './api'
import type { SpeciesType, CreateSpeciesDto, UpdateSpeciesDto } from '@/types/species'

export const speciesService = {
  async getAll(): Promise<SpeciesType[]> {
    const response = await api.get<SpeciesType[]>('/species')
    return response.data
  },

  async getOne(id: string): Promise<SpeciesType> {
    const response = await api.get<SpeciesType>(`/species/${id}`)
    return response.data
  },

  async create(data: CreateSpeciesDto): Promise<SpeciesType> {
    const response = await api.post<SpeciesType>('/species', data)
    return response.data
  },

  async update(id: string, data: UpdateSpeciesDto): Promise<SpeciesType> {
    const response = await api.patch<SpeciesType>(`/species/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/species/${id}`)
  },
}
