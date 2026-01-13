import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ClientType } from '../../../database/entities/client.entity';

export class CreateClientDto {
  @ApiPropertyOptional({ description: 'RUT del cliente', example: '12345678-9' })
  @IsOptional()
  @IsString()
  rut?: string;

  @ApiProperty({ description: 'Nombre completo del cliente', example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Dirección', example: 'Av. Providencia 123' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Comuna', example: 'Providencia' })
  @IsOptional()
  @IsString()
  commune?: string;

  @ApiPropertyOptional({ description: 'Teléfono', example: '+56912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'juan@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Tipo de cliente',
    enum: ClientType,
    default: ClientType.NORMAL,
  })
  @IsOptional()
  @IsEnum(ClientType)
  clientType?: ClientType;

  @ApiPropertyOptional({
    description: 'Porcentaje de descuento',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @ApiPropertyOptional({ description: 'Ciudad', example: 'Santiago' })
  @IsOptional()
  @IsString()
  city?: string;
}
