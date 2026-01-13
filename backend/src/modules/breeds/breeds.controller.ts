import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BreedsService } from './breeds.service';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('breeds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva raza' })
  @ApiResponse({ status: 201, description: 'Raza creada exitosamente' })
  create(@Body() createBreedDto: CreateBreedDto) {
    return this.breedsService.create(createBreedDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las razas o filtrar por especie' })
  @ApiResponse({ status: 200, description: 'Lista de razas' })
  findAll(@Query('speciesTypeId') speciesTypeId?: string) {
    if (speciesTypeId) {
      return this.breedsService.findBySpecies(speciesTypeId);
    }
    return this.breedsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una raza por ID' })
  @ApiResponse({ status: 200, description: 'Raza encontrada' })
  @ApiResponse({ status: 404, description: 'Raza no encontrada' })
  findOne(@Param('id') id: string) {
    return this.breedsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una raza' })
  @ApiResponse({ status: 200, description: 'Raza actualizada exitosamente' })
  update(@Param('id') id: string, @Body() updateBreedDto: UpdateBreedDto) {
    return this.breedsService.update(id, updateBreedDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una raza' })
  @ApiResponse({ status: 200, description: 'Raza eliminada exitosamente' })
  remove(@Param('id') id: string) {
    return this.breedsService.remove(id);
  }
}
