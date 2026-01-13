import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { SearchPetDto } from './dto/search-pet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva mascota' })
  @ApiResponse({ status: 201, description: 'Mascota creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las mascotas con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Lista de mascotas' })
  findAll(@Query() searchDto: SearchPetDto) {
    return this.petsService.findAll(searchDto);
  }

  @Get('count')
  @ApiOperation({ summary: 'Contar total de mascotas' })
  @ApiResponse({ status: 200, description: 'Número total de mascotas' })
  async count() {
    const total = await this.petsService.count();
    const alive = await this.petsService.countAlive();
    return { total, alive };
  }

  @Get('ficha/:ficha')
  @ApiOperation({ summary: 'Buscar mascota por número de ficha' })
  @ApiResponse({ status: 200, description: 'Mascota encontrada' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
  findByFicha(@Param('ficha') ficha: string) {
    return this.petsService.findByFicha(parseInt(ficha, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una mascota por ID' })
  @ApiResponse({ status: 200, description: 'Mascota encontrada' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una mascota' })
  @ApiResponse({ status: 200, description: 'Mascota actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una mascota' })
  @ApiResponse({ status: 200, description: 'Mascota eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}
