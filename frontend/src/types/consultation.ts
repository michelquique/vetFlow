import type { Pet } from './pet'
import type { Client } from './client'
import type { Doctor } from './doctor'

export type ConsultationType = 'Curativa' | 'Profilactica'

export type ConsultationStatus = 'Active' | 'Completed' | 'Cancelled'

export interface Consultation {
  id: string
  consultationNumber: number
  petId: string
  pet?: Pet
  clientId: string
  client?: Client
  doctorId: string
  doctor?: Doctor
  date: Date
  type: ConsultationType
  reason?: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  exams?: string
  nextVisitDate?: Date
  nextVisitType?: string
  nextTreatment?: string
  amount: number
  paid: number
  balance: number
  status: ConsultationStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateConsultationDto {
  petId: string
  clientId: string
  doctorId: string
  date: Date
  type: ConsultationType
  reason?: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  exams?: string
  nextVisitDate?: Date
  nextVisitType?: string
  nextTreatment?: string
  amount?: number
  paid?: number
}

export interface UpdateConsultationDto extends Partial<CreateConsultationDto> {
  status?: ConsultationStatus
}

export interface SearchConsultationDto {
  page?: number
  limit?: number
  search?: string
  petId?: string
  clientId?: string
  doctorId?: string
  startDate?: Date
  endDate?: Date
  type?: ConsultationType
  status?: ConsultationStatus
}
