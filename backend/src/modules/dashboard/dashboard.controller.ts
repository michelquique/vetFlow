import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas generales del sistema',
  })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('recent-consultations')
  @ApiOperation({ summary: 'Obtener consultas recientes' })
  @ApiResponse({ status: 200, description: 'Lista de consultas recientes' })
  getRecentConsultations(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getRecentConsultations(limitNum);
  }
}
