import type { Client } from './client'
import type { SpeciesType } from './species'
import type { Breed } from './breed'
import type { Consultation } from './consultation'

export type PetSex = 'M' | 'F'

export type PetSize = 'S' | 'M' | 'L'

export interface Pet {
  id: string
  ficha: number
  name: string
  clientId: string
  client?: Client
  speciesTypeId: string
  speciesType?: SpeciesType
  breedId?: string
  breed?: Breed
  sex: PetSex
  size: PetSize
  color?: string
  birthDate?: Date
  isAlive: boolean
  deathDate?: Date
  photoUrl?: string
  consultations?: Consultation[]
  createdAt: Date
  updatedAt: Date
}

export interface CreatePetDto {
  name: string
  clientId: string
  speciesTypeId: string
  breedId?: string
  sex: PetSex
  size: PetSize
  color?: string
  birthDate?: Date
}

export interface UpdatePetDto extends Partial<CreatePetDto> {
  isAlive?: boolean
  deathDate?: Date
  photoUrl?: string
}

export interface SearchPetDto {
  page?: number
  limit?: number
  search?: string
  clientId?: string
  speciesTypeId?: string
}
