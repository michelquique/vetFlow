import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeciesType } from '../../database/entities/species-type.entity';
import { CreateSpeciesTypeDto } from './dto/create-species-type.dto';
import { UpdateSpeciesTypeDto } from './dto/update-species-type.dto';

@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(SpeciesType)
    private speciesRepository: Repository<SpeciesType>,
  ) {}

  async create(createSpeciesTypeDto: CreateSpeciesTypeDto): Promise<SpeciesType> {
    const species = this.speciesRepository.create(createSpeciesTypeDto);
    return await this.speciesRepository.save(species);
  }

  async findAll(): Promise<SpeciesType[]> {
    return await this.speciesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SpeciesType> {
    const species = await this.speciesRepository.findOne({
      where: { id },
      relations: ['breeds'],
    });

    if (!species) {
      throw new NotFoundException(`Species with ID ${id} not found`);
    }

    return species;
  }

  async update(id: string, updateSpeciesTypeDto: UpdateSpeciesTypeDto): Promise<SpeciesType> {
    const species = await this.findOne(id);
    Object.assign(species, updateSpeciesTypeDto);
    return await this.speciesRepository.save(species);
  }

  async remove(id: string): Promise<void> {
    const species = await this.findOne(id);
    await this.speciesRepository.remove(species);
  }
}
