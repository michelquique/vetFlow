import { api } from './api'
import type { Doctor, CreateDoctorDto, UpdateDoctorDto } from '@/types/doctor'

export const doctorService = {
  async getAll(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>('/doctors')
    return response.data
  },

  async getActive(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>('/doctors/active')
    return response.data
  },

  async getOne(id: string): Promise<Doctor> {
    const response = await api.get<Doctor>(`/doctors/${id}`)
    return response.data
  },

  async create(data: CreateDoctorDto): Promise<Doctor> {
    const response = await api.post<Doctor>('/doctors', data)
    return response.data
  },

  async update(id: string, data: UpdateDoctorDto): Promise<Doctor> {
    const response = await api.patch<Doctor>(`/doctors/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/doctors/${id}`)
  },

  async count(): Promise<number> {
    const response = await api.get<number>('/doctors/count')
    return response.data
  },
}
