import { Client } from './client'
import { SpeciesType } from './species'
import { Breed } from './breed'
import { Consultation } from './consultation'

export enum PetSex {
  MALE = 'M',
  FEMALE = 'F',
}

export enum PetSize {
  SMALL = 'S',
  MEDIUM = 'M',
  LARGE = 'L',
}

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
