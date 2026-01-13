import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import {
  ConsultationType,
  ConsultationStatus,
} from '../../../database/entities/consultation.entity';

export class CreateConsultationDto {
  @ApiProperty({ description: 'ID de la mascota', example: 'uuid' })
  @IsUUID()
  petId: string;

  @ApiProperty({ description: 'ID del cliente', example: 'uuid' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'ID del doctor', example: 'uuid' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: 'Fecha y hora de la consulta',
    example: '2024-01-15T10:00:00Z',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Tipo de consulta',
    enum: ConsultationType,
    example: ConsultationType.CURATIVA,
  })
  @IsEnum(ConsultationType)
  type: ConsultationType;

  @ApiPropertyOptional({ description: 'Motivo de consulta' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Síntomas observados' })
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiPropertyOptional({ description: 'Diagnóstico' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Tratamiento prescrito' })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiPropertyOptional({ description: 'Exámenes solicitados' })
  @IsOptional()
  @IsString()
  exams?: string;

  @ApiPropertyOptional({ description: 'Fecha de próxima visita', example: '2024-02-15' })
  @IsOptional()
  @IsDateString()
  nextVisitDate?: string;

  @ApiPropertyOptional({
    description: 'Tipo de próxima visita',
    enum: ConsultationType,
  })
  @IsOptional()
  @IsEnum(ConsultationType)
  nextVisitType?: ConsultationType;

  @ApiPropertyOptional({ description: 'Tratamiento para próxima visita' })
  @IsOptional()
  @IsString()
  nextTreatment?: string;

  @ApiPropertyOptional({ description: 'Monto total', example: 50000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Monto pagado', example: 30000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paid?: number;

  @ApiPropertyOptional({
    description: 'Estado de la consulta',
    enum: ConsultationStatus,
    default: ConsultationStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;
}
