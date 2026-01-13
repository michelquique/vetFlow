import { Injectable } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { PetsService } from '../pets/pets.service';
import { DoctorsService } from '../doctors/doctors.service';
import { ConsultationsService } from '../consultations/consultations.service';

@Injectable()
export class DashboardService {
  constructor(
    private clientsService: ClientsService,
    private petsService: PetsService,
    private doctorsService: DoctorsService,
    private consultationsService: ConsultationsService,
  ) {}

  async getStats() {
    const [
      totalClients,
      totalPets,
      alivePets,
      totalDoctors,
      totalConsultations,
      todayConsultations,
    ] = await Promise.all([
      this.clientsService.count(),
      this.petsService.count(),
      this.petsService.countAlive(),
      this.doctorsService.count(),
      this.consultationsService.count(),
      this.consultationsService.countToday(),
    ]);

    return {
      totalClients,
      totalPets,
      alivePets,
      deadPets: totalPets - alivePets,
      totalDoctors,
      totalConsultations,
      todayConsultations,
    };
  }

  async getRecentConsultations(limit: number = 10) {
    return await this.consultationsService.getRecentConsultations(limit);
  }
}
