import { PartialType } from '@nestjs/swagger';
import { CreateSpeciesTypeDto } from './create-species-type.dto';

export class UpdateSpeciesTypeDto extends PartialType(CreateSpeciesTypeDto) {}
