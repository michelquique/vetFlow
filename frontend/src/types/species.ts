import { Pet } from './pet'
import { Breed } from './breed'

export interface SpeciesType {
  id: string
  name: string
  description?: string
  pets?: Pet[]
  breeds?: Breed[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateSpeciesDto {
  name: string
  description?: string
}

export interface UpdateSpeciesDto extends Partial<CreateSpeciesDto> {}
