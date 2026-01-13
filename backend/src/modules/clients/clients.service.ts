import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Client } from '../../database/entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SearchClientDto } from './dto/search-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
  }

  async findAll(
    searchDto: SearchClientDto,
  ): Promise<{ data: Client[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.clientRepository.createQueryBuilder('client');

    if (search) {
      queryBuilder.where(
        'client.name ILIKE :search OR client.rut ILIKE :search OR client.phone ILIKE :search OR client.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder.skip(skip).take(limit).orderBy('client.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['pets', 'consultations'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async findByRut(rut: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { rut },
      relations: ['pets'],
    });

    if (!client) {
      throw new NotFoundException(`Client with RUT ${rut} not found`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return await this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  async count(): Promise<number> {
    return await this.clientRepository.count();
  }
}
