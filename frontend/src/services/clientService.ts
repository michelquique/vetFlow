import { api } from './api'
import type {
  Client,
  CreateClientDto,
  UpdateClientDto,
  SearchClientDto,
} from '@/types/client'
import type { PaginatedResponse } from '@/types/api'

export const clientService = {
  async getAll(params: SearchClientDto = {}): Promise<PaginatedResponse<Client>> {
    const response = await api.get<PaginatedResponse<Client>>('/clients', { params })
    return response.data
  },

  async getOne(id: string): Promise<Client> {
    const response = await api.get<Client>(`/clients/${id}`)
    return response.data
  },

  async getByRut(rut: string): Promise<Client> {
    const response = await api.get<Client>(`/clients/rut/${rut}`)
    return response.data
  },

  async create(data: CreateClientDto): Promise<Client> {
    const response = await api.post<Client>('/clients', data)
    return response.data
  },

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const response = await api.patch<Client>(`/clients/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/clients/${id}`)
  },

  async count(): Promise<number> {
    const response = await api.get<number>('/clients/count')
    return response.data
  },
}
