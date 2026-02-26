import { api } from './api'
import type {
  Consultation,
  CreateConsultationDto,
  UpdateConsultationDto,
  SearchConsultationDto,
} from '@/types/consultation'
import type { PaginatedResponse } from '@/types/api'

export interface ConsultationCountResponse {
  total: number
  today: number
}

export const consultationService = {
  async getAll(params: SearchConsultationDto = {}): Promise<PaginatedResponse<Consultation>> {
    const response = await api.get<PaginatedResponse<Consultation>>('/consultations', { params })
    return response.data
  },

  async getOne(id: string): Promise<Consultation> {
    const response = await api.get<Consultation>(`/consultations/${id}`)
    return response.data
  },

  async getRecent(limit: number = 10): Promise<Consultation[]> {
    const response = await api.get<Consultation[]>('/consultations/recent', { params: { limit } })
    return response.data
  },

  async create(data: CreateConsultationDto): Promise<Consultation> {
    const response = await api.post<Consultation>('/consultations', data)
    return response.data
  },

  async update(id: string, data: UpdateConsultationDto): Promise<Consultation> {
    const response = await api.patch<Consultation>(`/consultations/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/consultations/${id}`)
  },

  async getCount(): Promise<ConsultationCountResponse> {
    const response = await api.get<ConsultationCountResponse>('/consultations/count')
    return response.data
  },
}
