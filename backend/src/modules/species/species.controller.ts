import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SpeciesService } from './species.service';
import { CreateSpeciesTypeDto } from './dto/create-species-type.dto';
import { UpdateSpeciesTypeDto } from './dto/update-species-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('species')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de especie' })
  @ApiResponse({ status: 201, description: 'Especie creada exitosamente' })
  create(@Body() createSpeciesTypeDto: CreateSpeciesTypeDto) {
    return this.speciesService.create(createSpeciesTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de especies' })
  @ApiResponse({ status: 200, description: 'Lista de especies' })
  findAll() {
    return this.speciesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una especie por ID' })
  @ApiResponse({ status: 200, description: 'Especie encontrada' })
  @ApiResponse({ status: 404, description: 'Especie no encontrada' })
  findOne(@Param('id') id: string) {
    return this.speciesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una especie' })
  @ApiResponse({ status: 200, description: 'Especie actualizada exitosamente' })
  update(@Param('id') id: string, @Body() updateSpeciesTypeDto: UpdateSpeciesTypeDto) {
    return this.speciesService.update(id, updateSpeciesTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una especie' })
  @ApiResponse({ status: 200, description: 'Especie eliminada exitosamente' })
  @ApiResponse({ status: 409, description: 'La especie tiene razas o mascotas asociadas' })
  remove(@Param('id') id: string) {
    return this.speciesService.remove(id);
  }
}
