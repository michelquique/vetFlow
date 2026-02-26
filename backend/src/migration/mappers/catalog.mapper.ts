import { QueryRunner } from 'typeorm';
import { IdMappingService } from '../utils/id-mapping';
import { MigrationLogger } from '../utils/logger';

export class CatalogMapper {
  constructor(
    private idMapping: IdMappingService,
    private logger: MigrationLogger,
  ) {}

  async migrateSpeciesTypes(speciesData: any[], queryRunner: QueryRunner): Promise<number> {
    let count = 0;

    for (const species of speciesData) {
      try {
        const result = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('species_types')
          .values({
            name: species.TiesDesc,
            description: null,
          })
          .returning('id')
          .execute();

        const newId = result.identifiers[0].id;
        this.idMapping.addMapping('species', species.TiesCodi, newId);
        count++;
      } catch (error) {
        this.logger.error(`Error migrando especie ${species.TiesDesc}`, error);
      }
    }

    return count;
  }

  async migrateBreeds(breedsData: any[], queryRunner: QueryRunner): Promise<number> {
    let count = 0;

    for (const breed of breedsData) {
      try {
        // Por defecto, asignar razas al tipo "CANINO" (00001)
        // Si necesitas lógica más específica, agrégala aquí
        const speciesTypeId = this.idMapping.getMappingOrThrow('species', '00001');

        const result = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('breeds')
          .values({
            name: breed.RazaDesc,
            description: null,
            speciesTypeId: speciesTypeId,
          })
          .returning('id')
          .execute();

        const newId = result.identifiers[0].id;
        this.idMapping.addMapping('breeds', breed.RazaCodi, newId);
        count++;
      } catch (error) {
        this.logger.error(`Error migrando raza ${breed.RazaDesc}`, error);
      }
    }

    return count;
  }
}
