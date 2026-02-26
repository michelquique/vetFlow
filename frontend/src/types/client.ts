import type { Pet } from './pet'
import type { Consultation } from './consultation'

export type ClientType = 'Normal' | 'VIP'

export interface Client {
  id: string
  rut?: string
  name: string
  address?: string
  commune?: string
  city?: string
  phone?: string
  email?: string
  clientType: ClientType
  discount: number
  pets?: Pet[]
  consultations?: Consultation[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateClientDto {
  rut?: string
  name: string
  address?: string
  commune?: string
  city?: string
  phone?: string
  email?: string
  clientType?: ClientType
  discount?: number
}

export interface UpdateClientDto extends Partial<CreateClientDto> { }

export interface SearchClientDto {
  page?: number
  limit?: number
  search?: string
}
