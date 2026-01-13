import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({ description: 'Nombre completo del doctor', example: 'Dr. María González' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Especialidad', example: 'Cirugía Veterinaria' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: 'Número de licencia', example: 'VET-12345' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'Teléfono', example: '+56912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'maria@veterinaria.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Estado activo', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
