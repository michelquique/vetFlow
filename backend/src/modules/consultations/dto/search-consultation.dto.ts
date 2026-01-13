import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConsultationType,
  ConsultationStatus,
} from '../../../database/entities/consultation.entity';

export class SearchConsultationDto {
  @ApiPropertyOptional({ description: 'Página actual', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filtrar por mascota', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  petId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por cliente', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por doctor', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo',
    enum: ConsultationType,
  })
  @IsOptional()
  @IsEnum(ConsultationType)
  type?: ConsultationType;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: ConsultationStatus,
  })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @ApiPropertyOptional({
    description: 'Fecha desde',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
