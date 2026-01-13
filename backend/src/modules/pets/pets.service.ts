import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../../database/entities/pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { SearchPetDto } from './dto/search-pet.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    const pet = this.petRepository.create(createPetDto);
    return await this.petRepository.save(pet);
  }

  async findAll(
    searchDto: SearchPetDto,
  ): Promise<{ data: Pet[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, clientId, speciesTypeId } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.petRepository
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.client', 'client')
      .leftJoinAndSelect('pet.speciesType', 'speciesType')
      .leftJoinAndSelect('pet.breed', 'breed');

    if (search) {
      queryBuilder.where('pet.name ILIKE :search', { search: `%${search}%` });
    }

    if (clientId) {
      queryBuilder.andWhere('pet.clientId = :clientId', { clientId });
    }

    if (speciesTypeId) {
      queryBuilder.andWhere('pet.speciesTypeId = :speciesTypeId', { speciesTypeId });
    }

    queryBuilder.skip(skip).take(limit).orderBy('pet.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Pet> {
    const pet = await this.petRepository.findOne({
      where: { id },
      relations: ['client', 'speciesType', 'breed', 'consultations'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    return pet;
  }

  async findByFicha(ficha: number): Promise<Pet> {
    const pet = await this.petRepository.findOne({
      where: { ficha },
      relations: ['client', 'speciesType', 'breed'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ficha ${ficha} not found`);
    }

    return pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findOne(id);
    Object.assign(pet, updatePetDto);
    return await this.petRepository.save(pet);
  }

  async remove(id: string): Promise<void> {
    const pet = await this.findOne(id);
    await this.petRepository.remove(pet);
  }

  async count(): Promise<number> {
    return await this.petRepository.count();
  }

  async countAlive(): Promise<number> {
    return await this.petRepository.count({ where: { isAlive: true } });
  }
}
