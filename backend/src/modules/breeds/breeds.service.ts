import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Breed } from '../../database/entities/breed.entity';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';

export interface SearchBreedParams {
  speciesTypeId?: string;
  search?: string;
  limit?: number;
}

@Injectable()
export class BreedsService {
  constructor(
    @InjectRepository(Breed)
    private breedRepository: Repository<Breed>,
  ) {}

  async create(createBreedDto: CreateBreedDto): Promise<Breed> {
    const breed = this.breedRepository.create(createBreedDto);
    return await this.breedRepository.save(breed);
  }

  async findAll(): Promise<Breed[]> {
    return await this.breedRepository.find({
      order: { name: 'ASC' },
      relations: ['speciesType'],
    });
  }

  async findBySpecies(speciesTypeId: string): Promise<Breed[]> {
    return await this.breedRepository.find({
      where: { speciesTypeId },
      order: { name: 'ASC' },
      relations: ['speciesType'],
    });
  }

  async search(params: SearchBreedParams): Promise<Breed[]> {
    const { speciesTypeId, search, limit = 50 } = params;

    const queryBuilder = this.breedRepository
      .createQueryBuilder('breed')
      .leftJoinAndSelect('breed.speciesType', 'speciesType')
      .orderBy('breed.name', 'ASC');

    if (speciesTypeId) {
      queryBuilder.andWhere('breed.speciesTypeId = :speciesTypeId', { speciesTypeId });
    }

    if (search && search.trim()) {
      queryBuilder.andWhere('breed.name ILIKE :search', { search: `%${search.trim()}%` });
    }

    queryBuilder.take(limit);

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Breed> {
    const breed = await this.breedRepository.findOne({
      where: { id },
      relations: ['speciesType'],
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    return breed;
  }

  async update(id: string, updateBreedDto: UpdateBreedDto): Promise<Breed> {
    const breed = await this.findOne(id);
    Object.assign(breed, updateBreedDto);
    return await this.breedRepository.save(breed);
  }

  async remove(id: string): Promise<void> {
    const breed = await this.findOne(id);
    await this.breedRepository.remove(breed);
  }
}
