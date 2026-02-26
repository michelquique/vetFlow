export class DataCleaner {
  cleanAll(data: any): any {
    // El JSON ya viene normalizado desde migrate-keysoft.ts
    return {
      Doctores: this.cleanDoctors(data.Doctores),
      Dueños: this.cleanClients(data.Dueños || data['Dueños']),
      Especies: this.cleanPets(data.Especies),
      Tratamientos: this.cleanConsultations(data.Tratamientos),
      TipoEspecie: this.cleanSpeciesTypes(data.TipoEspecie),
      Razas: this.cleanBreeds(data.Razas),
      EstCuenta: data.EstCuenta,
    };
  }

  private cleanDoctors(doctors: any): any {
    if (!doctors || !doctors.data) {
      return { rowCount: 0, columns: [], data: [] };
    }

    return {
      ...doctors,
      data: doctors.data.map((doc: any) => ({
        ...doc,
        DoctNomb: this.fixEncoding(doc.DoctNomb || '').toUpperCase().trim(),
        DoctNcmv: doc.DoctNcmv || null,
        DoctMeve: doc.DoctMeve || null,
      })),
    };
  }

  private cleanClients(clients: any): any {
    if (!clients || !clients.data) {
      return { rowCount: 0, columns: [], data: [] };
    }

    return {
      ...clients,
      data: clients.data.map((client: any) => {
        // Buscar las propiedades con nombres mal codificados
        const nombKey = Object.keys(client).find(k => k.includes('Nomb')) || 'DueñNomb';
        const direKey = Object.keys(client).find(k => k.includes('Dire')) || 'DueñDire';
        const comuKey = Object.keys(client).find(k => k.includes('Comu')) || 'DueñComu';
        const teleKey = Object.keys(client).find(k => k.includes('Tele')) || 'DueñTele';
        const rutdKey = Object.keys(client).find(k => k.includes('Rutd')) || 'DueñRutd';

        return {
          ...client,
          DueñNomb: this.fixEncoding(client[nombKey] || '').toUpperCase().trim(),
          DueñDire: this.fixEncoding(client[direKey] || ''),
          DueñComu: this.fixEncoding(client[comuKey] || ''),
          DueñTele: this.cleanPhone(client[teleKey] || ''),
          DueñRutd: this.cleanRut(client[rutdKey] || ''),
        };
      }),
    };
  }

  private cleanPets(pets: any): any {
    if (!pets || !pets.data) {
      return { rowCount: 0, columns: [], data: [] };
    }

    return {
      ...pets,
      data: pets.data.map((pet: any) => {
        // Buscar propiedades con nombres mal codificados
        const anosKey = Object.keys(pet).find(k => k.includes('A') && k.includes('os')) || 'EspeAños';
        
        return {
          ...pet,
          EspeNoes: this.fixEncoding(pet.EspeNoes || '').toUpperCase().trim(),
          EspeColo: this.fixEncoding(pet.EspeColo || 'S/C'),
          EspeSexo: pet.EspeSexo === 'H' ? 'F' : 'M', // Hembra → Female
          EspeTama: pet.EspeTama || 'M',
          EspeAños: parseInt(pet[anosKey] || 0),
          EspeMese: parseInt(pet.EspeMese || 0),
        };
      }),
    };
  }

  private cleanConsultations(consultations: any): any {
    if (!consultations || !consultations.data) {
      return { rowCount: 0, columns: [], data: [] };
    }

    return {
      ...consultations,
      data: consultations.data.map((consult: any) => ({
        ...consult,
        TratSint: this.fixEncoding(consult.TratSint || ''),
        TratDiag: this.fixEncoding(consult.TratDiag || ''),
        TratTrat: this.fixEncoding(consult.TratTrat || ''),
        TratValo: parseFloat(consult.TratValo || 0),
        TratVapa: parseFloat(consult.TratVapa || 0),
      })),
    };
  }

  private cleanSpeciesTypes(species: any): any {
    if (!species || !species.data) {
      return { rowCount: 0, columns: [], data: [] };
    }
    return species;
  }

  private cleanBreeds(breeds: any): any {
    if (!breeds || !breeds.data) {
      return { rowCount: 0, columns: [], data: [] };
    }

    return {
      ...breeds,
      data: breeds.data.map((breed: any) => ({
        ...breed,
        RazaDesc: this.fixEncoding(breed.RazaDesc || '').toUpperCase().trim(),
      })),
    };
  }

  private fixEncoding(text: string): string {
    if (!text) return '';
    
    const replacements: { [key: string]: string } = {
      'Ñ': 'Ñ',
      'ñ': 'ñ',
      'á': 'á',
      'é': 'é',
      'í': 'í',
      'ó': 'ó',
      'ú': 'ú',
      'Á': 'Á',
      'É': 'É',
      'Í': 'Í',
      'Ó': 'Ó',
      'Ú': 'Ú',
    };

    let fixed = text;
    Object.entries(replacements).forEach(([bad, good]) => {
      fixed = fixed.replace(new RegExp(bad, 'g'), good);
    });

    return fixed;
  }

  private cleanPhone(phone: string): string {
    if (!phone) return '';
    return phone.toString().replace(/[^0-9+]/g, '').slice(0, 15);
  }

  private cleanRut(rut: string): string {
    if (!rut) return '';
    return rut.toString().replace(/[^0-9kK-]/g, '');
  }
}
