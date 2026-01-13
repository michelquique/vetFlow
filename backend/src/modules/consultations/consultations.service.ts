import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Consultation } from '../../database/entities/consultation.entity';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { SearchConsultationDto } from './dto/search-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
  ) {}

  async create(createConsultationDto: CreateConsultationDto): Promise<Consultation> {
    const consultation = this.consultationRepository.create(createConsultationDto);

    // Calculate balance
    const amount = createConsultationDto.amount || 0;
    const paid = createConsultationDto.paid || 0;
    consultation.balance = amount - paid;

    return await this.consultationRepository.save(consultation);
  }

  async findAll(
    searchDto: SearchConsultationDto,
  ): Promise<{ data: Consultation[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      petId,
      clientId,
      doctorId,
      type,
      status,
      dateFrom,
      dateTo,
    } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.consultationRepository
      .createQueryBuilder('consultation')
      .leftJoinAndSelect('consultation.pet', 'pet')
      .leftJoinAndSelect('consultation.client', 'client')
      .leftJoinAndSelect('consultation.doctor', 'doctor');

    if (petId) {
      queryBuilder.andWhere('consultation.petId = :petId', { petId });
    }

    if (clientId) {
      queryBuilder.andWhere('consultation.clientId = :clientId', { clientId });
    }

    if (doctorId) {
      queryBuilder.andWhere('consultation.doctorId = :doctorId', { doctorId });
    }

    if (type) {
      queryBuilder.andWhere('consultation.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('consultation.status = :status', { status });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere('consultation.date BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      });
    } else if (dateFrom) {
      queryBuilder.andWhere('consultation.date >= :dateFrom', { dateFrom });
    } else if (dateTo) {
      queryBuilder.andWhere('consultation.date <= :dateTo', { dateTo });
    }

    queryBuilder.skip(skip).take(limit).orderBy('consultation.date', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Consultation> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: ['pet', 'client', 'doctor', 'radiologicalReports'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    return consultation;
  }

  async update(
    id: string,
    updateConsultationDto: UpdateConsultationDto,
  ): Promise<Consultation> {
    const consultation = await this.findOne(id);
    Object.assign(consultation, updateConsultationDto);

    // Recalculate balance if amount or paid changed
    if (
      updateConsultationDto.amount !== undefined ||
      updateConsultationDto.paid !== undefined
    ) {
      const amount = updateConsultationDto.amount ?? consultation.amount;
      const paid = updateConsultationDto.paid ?? consultation.paid;
      consultation.balance = Number(amount) - Number(paid);
    }

    return await this.consultationRepository.save(consultation);
  }

  async remove(id: string): Promise<void> {
    const consultation = await this.findOne(id);
    await this.consultationRepository.remove(consultation);
  }

  async count(): Promise<number> {
    return await this.consultationRepository.count();
  }

  async countToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.consultationRepository.count({
      where: {
        date: Between(today, tomorrow),
      },
    });
  }

  async getRecentConsultations(limit: number = 10): Promise<Consultation[]> {
    return await this.consultationRepository.find({
      order: { date: 'DESC' },
      take: limit,
      relations: ['pet', 'client', 'doctor'],
    });
  }
}
