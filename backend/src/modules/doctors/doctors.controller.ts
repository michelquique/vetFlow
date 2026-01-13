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
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo doctor' })
  @ApiResponse({ status: 201, description: 'Doctor creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los doctores' })
  @ApiResponse({ status: 200, description: 'Lista de doctores' })
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener doctores activos' })
  @ApiResponse({ status: 200, description: 'Lista de doctores activos' })
  findActive() {
    return this.doctorsService.findActive();
  }

  @Get('count')
  @ApiOperation({ summary: 'Contar total de doctores activos' })
  @ApiResponse({ status: 200, description: 'Número total de doctores activos' })
  async count() {
    const total = await this.doctorsService.count();
    return { total };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un doctor por ID' })
  @ApiResponse({ status: 200, description: 'Doctor encontrado' })
  @ApiResponse({ status: 404, description: 'Doctor no encontrado' })
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un doctor' })
  @ApiResponse({ status: 200, description: 'Doctor actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Doctor no encontrado' })
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un doctor' })
  @ApiResponse({ status: 200, description: 'Doctor eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Doctor no encontrado' })
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }
}
