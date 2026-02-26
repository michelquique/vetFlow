export interface ValidationResult {
  doctors: { valid: number; total: number };
  clients: { valid: number; total: number };
  pets: { valid: number; total: number };
  consultations: { valid: number; total: number };
  errors: string[];
}

export class DataValidator {
  validate(data: any): ValidationResult {
    const errors: string[] = [];

    // Validar doctores
    const doctorsResult = this.validateDoctors(data.Doctores.data, errors);

    // Validar clientes
    const clientsResult = this.validateClients(data.Dueños.data, errors);

    // Validar mascotas
    const petsResult = this.validatePets(data.Especies.data, errors);

    // Validar consultas
    const consultationsResult = this.validateConsultations(data.Tratamientos.data, errors);

    return {
      doctors: doctorsResult,
      clients: clientsResult,
      pets: petsResult,
      consultations: consultationsResult,
      errors,
    };
  }

  private validateDoctors(doctors: any[], errors: string[]): { valid: number; total: number } {
    let valid = 0;
    const total = doctors.length;

    doctors.forEach((doc, index) => {
      if (!doc.DoctNomb || doc.DoctNomb.trim() === '') {
        errors.push(`Doctor ${index}: nombre vacío`);
      } else {
        valid++;
      }
    });

    return { valid, total };
  }

  private validateClients(clients: any[], errors: string[]): { valid: number; total: number } {
    let valid = 0;
    const total = clients.length;

    clients.forEach((client, index) => {
      if (!client.DueñNomb || client.DueñNomb.trim() === '') {
        errors.push(`Cliente ${index}: nombre vacío`);
      } else if (!client.DueñRutd) {
        errors.push(`Cliente ${index}: RUT vacío`);
      } else {
        valid++;
      }
    });

    return { valid, total };
  }

  private validatePets(pets: any[], errors: string[]): { valid: number; total: number } {
    let valid = 0;
    const total = pets.length;

    pets.forEach((pet, index) => {
      if (!pet.EspeNoes || pet.EspeNoes.trim() === '') {
        errors.push(`Mascota ${index}: nombre vacío`);
      } else if (!pet.EspeRutd) {
        errors.push(`Mascota ${index}: sin dueño (RUT vacío)`);
      } else if (!pet.EspeTies) {
        errors.push(`Mascota ${index}: sin tipo de especie`);
      } else {
        valid++;
      }
    });

    return { valid, total };
  }

  private validateConsultations(consultations: any[], errors: string[]): { valid: number; total: number } {
    let valid = 0;
    const total = consultations.length;

    consultations.forEach((consult, index) => {
      if (!consult.TratNrfi) {
        errors.push(`Consulta ${index}: sin número de ficha`);
      } else if (!consult.TratRutd) {
        errors.push(`Consulta ${index}: sin RUT de cliente`);
      } else if (!consult.TratFevi) {
        errors.push(`Consulta ${index}: sin fecha`);
      } else {
        valid++;
      }
    });

    return { valid, total };
  }
}
