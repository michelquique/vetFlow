import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { PetSex, PetSize } from '../../../database/entities/pet.entity';

export class CreatePetDto {
  @ApiProperty({ description: 'Nombre de la mascota', example: 'Luna' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID del cliente propietario', example: 'uuid' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'ID del tipo de especie', example: 'uuid' })
  @IsUUID()
  speciesTypeId: string;

  @ApiPropertyOptional({ description: 'ID de la raza', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  breedId?: string;

  @ApiProperty({ description: 'Sexo de la mascota', enum: PetSex, example: PetSex.FEMALE })
  @IsEnum(PetSex)
  sex: PetSex;

  @ApiProperty({ description: 'Tamaño de la mascota', enum: PetSize, example: PetSize.MEDIUM })
  @IsEnum(PetSize)
  size: PetSize;

  @ApiPropertyOptional({ description: 'Color', example: 'Dorado' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento', example: '2020-01-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Estado vivo/fallecido', default: true })
  @IsOptional()
  @IsBoolean()
  isAlive?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de fallecimiento', example: '2023-12-31' })
  @IsOptional()
  @IsDateString()
  deathDate?: string;

  @ApiPropertyOptional({ description: 'URL de la foto', example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
