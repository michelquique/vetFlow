import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ClientsModule } from '../clients/clients.module';
import { PetsModule } from '../pets/pets.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { ConsultationsModule } from '../consultations/consultations.module';

@Module({
  imports: [ClientsModule, PetsModule, DoctorsModule, ConsultationsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
