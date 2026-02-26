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
  ApiQuery,
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
  @ApiOperation({ summary: 'Obtener todas las razas o filtrar/buscar por especie' })
  @ApiResponse({ status: 200, description: 'Lista de razas' })
  @ApiQuery({ name: 'speciesTypeId', required: false, description: 'Filtrar por ID de especie' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre de raza' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados' })
  findAll(
    @Query('speciesTypeId') speciesTypeId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    // Si hay búsqueda o límite, usar el método search
    if (search || limit) {
      return this.breedsService.search({
        speciesTypeId,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
    }
    
    // Si solo hay speciesTypeId, usar el método existente
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
