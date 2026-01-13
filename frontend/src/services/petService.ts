import { api } from './api'
import type { Pet, CreatePetDto, UpdatePetDto, SearchPetDto } from '@/types/pet'
import type { PaginatedResponse } from '@/types/api'

export const petService = {
  async getAll(params: SearchPetDto = {}): Promise<PaginatedResponse<Pet>> {
    const response = await api.get<PaginatedResponse<Pet>>('/pets', { params })
    return response.data
  },

  async getOne(id: string): Promise<Pet> {
    const response = await api.get<Pet>(`/pets/${id}`)
    return response.data
  },

  async getByFicha(ficha: number): Promise<Pet> {
    const response = await api.get<Pet>(`/pets/ficha/${ficha}`)
    return response.data
  },

  async create(data: CreatePetDto): Promise<Pet> {
    const response = await api.post<Pet>('/pets', data)
    return response.data
  },

  async update(id: string, data: UpdatePetDto): Promise<Pet> {
    const response = await api.patch<Pet>(`/pets/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/pets/${id}`)
  },

  async count(): Promise<number> {
    const response = await api.get<number>('/pets/count')
    return response.data
  },

  async countAlive(): Promise<number> {
    const response = await api.get<number>('/pets/count/alive')
    return response.data
  },
}
