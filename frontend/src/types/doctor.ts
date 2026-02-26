import type { Consultation } from './consultation'

export interface Doctor {
  id: string
  name: string
  specialty: string
  licenseNumber: string
  phone?: string
  email?: string
  isActive: boolean
  consultations?: Consultation[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateDoctorDto {
  name: string
  specialty: string
  licenseNumber: string
  phone?: string
  email?: string
}

export interface UpdateDoctorDto extends Partial<CreateDoctorDto> {
  isActive?: boolean
}
