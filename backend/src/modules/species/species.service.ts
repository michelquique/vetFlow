import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
  ) { }

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

    if (species.breeds && species.breeds.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la especie "${species.name}" porque tiene ${species.breeds.length} raza(s) asociada(s). Elimine primero las razas.`,
      );
    }

    const petCount = await this.speciesRepository
      .createQueryBuilder('species')
      .innerJoin('pets', 'pet', 'pet.speciesTypeId = species.id')
      .where('species.id = :id', { id })
      .getCount();

    if (petCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la especie "${species.name}" porque tiene ${petCount} mascota(s) asociada(s).`,
      );
    }

    await this.speciesRepository.remove(species);
  }
}
