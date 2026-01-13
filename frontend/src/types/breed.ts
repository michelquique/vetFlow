import { SpeciesType } from './species'
import { Pet } from './pet'

export interface Breed {
  id: string
  name: string
  speciesTypeId: string
  speciesType?: SpeciesType
  description?: string
  pets?: Pet[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateBreedDto {
  name: string
  speciesTypeId: string
  description?: string
}

export interface UpdateBreedDto extends Partial<CreateBreedDto> {}
