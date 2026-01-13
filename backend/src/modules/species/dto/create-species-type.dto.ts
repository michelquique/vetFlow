import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateSpeciesTypeDto {
  @ApiProperty({ description: 'Nombre de la especie', example: 'Perro' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción', example: 'Canis lupus familiaris' })
  @IsOptional()
  @IsString()
  description?: string;
}
