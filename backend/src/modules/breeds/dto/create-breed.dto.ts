import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateBreedDto {
  @ApiProperty({ description: 'Nombre de la raza', example: 'Golden Retriever' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID del tipo de especie', example: 'uuid' })
  @IsUUID()
  speciesTypeId: string;

  @ApiPropertyOptional({ description: 'Descripción', example: 'Raza mediana, amigable' })
  @IsOptional()
  @IsString()
  description?: string;
}
