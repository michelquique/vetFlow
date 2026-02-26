import { QueryRunner } from 'typeorm';
import { IdMappingService } from '../utils/id-mapping';
import { MigrationLogger } from '../utils/logger';

export class PetMapper {
  constructor(
    private idMapping: IdMappingService,
    private logger: MigrationLogger,
  ) {}

  async migrateBatch(petsData: any[], queryRunner: QueryRunner): Promise<number> {
    let count = 0;

    for (const pet of petsData) {
      try {
        // Validar datos mínimos
        if (!pet.EspeNoes || pet.EspeNoes.trim() === '') {
          this.logger.warn(`Mascota sin nombre, ficha: ${pet.EspeNrfi}`);
          continue;
        }

        // Obtener IDs mapeados
        const clientId = this.idMapping.getMapping('clients', pet.EspeRutd);
        if (!clientId) {
          this.logger.warn(`Mascota ${pet.EspeNoes}: cliente no encontrado (RUT: ${pet.EspeRutd})`);
          continue;
        }

        const speciesTypeId = this.idMapping.getMapping('species', pet.EspeTies);
        if (!speciesTypeId) {
          this.logger.warn(`Mascota ${pet.EspeNoes}: tipo de especie no encontrado (${pet.EspeTies})`);
          continue;
        }

        const breedId = this.idMapping.getMapping('breeds', pet.EspeRaza);
        // La raza puede ser null, no es crítico

        // Calcular fecha de nacimiento aproximada
        const birthDate = this.calculateBirthDate(pet.EspeAños, pet.EspeMese);

        // Determinar si está vivo
        const isAlive = pet.EspeEsta === '0' || pet.EspeEsta === 0;
        const deathDate = !isAlive && pet.EspeFede ? new Date(pet.EspeFede) : null;

        const result = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('pets')
          .values({
            ficha: parseInt(pet.EspeNrfi),
            name: pet.EspeNoes,
            clientId: clientId,
            speciesTypeId: speciesTypeId,
            breedId: breedId || null,
            sex: pet.EspeSexo, // Ya viene transformado (F o M)
            size: pet.EspeTama,
            color: pet.EspeColo || null,
            birthDate: birthDate,
            isAlive: isAlive,
            deathDate: deathDate,
            photoUrl: null,
          })
          .returning('id')
          .execute();

        const newId = result.identifiers[0].id;
        this.idMapping.addMapping('pets', pet.EspeNrfi, newId);
        count++;
      } catch (error) {
        this.logger.error(`Error migrando mascota ${pet.EspeNoes} (ficha: ${pet.EspeNrfi})`, error);
      }
    }

    return count;
  }

  private calculateBirthDate(years: number, months: number): Date | null {
    if (!years && !months) return null;

    const now = new Date();
    const birthYear = now.getFullYear() - (years || 0);
    const birthMonth = now.getMonth() - (months || 0);

    const birthDate = new Date(birthYear, birthMonth, now.getDate());
    
    // Validar que no sea fecha futura
    if (birthDate > now) {
      return null;
    }

    return birthDate;
  }
}
