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
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { SearchConsultationDto } from './dto/search-consultation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva consulta' })
  @ApiResponse({ status: 201, description: 'Consulta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createConsultationDto: CreateConsultationDto) {
    return this.consultationsService.create(createConsultationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las consultas con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de consultas' })
  findAll(@Query() searchDto: SearchConsultationDto) {
    return this.consultationsService.findAll(searchDto);
  }

  @Get('count')
  @ApiOperation({ summary: 'Contar total de consultas y consultas de hoy' })
  @ApiResponse({ status: 200, description: 'Contadores de consultas' })
  async count() {
    const total = await this.consultationsService.count();
    const today = await this.consultationsService.countToday();
    return { total, today };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Obtener consultas recientes' })
  @ApiResponse({ status: 200, description: 'Lista de consultas recientes' })
  async getRecent(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.consultationsService.getRecentConsultations(limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una consulta por ID' })
  @ApiResponse({ status: 200, description: 'Consulta encontrada' })
  @ApiResponse({ status: 404, description: 'Consulta no encontrada' })
  findOne(@Param('id') id: string) {
    return this.consultationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una consulta' })
  @ApiResponse({ status: 200, description: 'Consulta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Consulta no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ) {
    return this.consultationsService.update(id, updateConsultationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una consulta' })
  @ApiResponse({ status: 200, description: 'Consulta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Consulta no encontrada' })
  remove(@Param('id') id: string) {
    return this.consultationsService.remove(id);
  }
}
