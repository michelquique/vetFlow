import { QueryRunner } from 'typeorm';
import { IdMappingService } from '../utils/id-mapping';
import { MigrationLogger } from '../utils/logger';

export class ClientMapper {
  constructor(
    private idMapping: IdMappingService,
    private logger: MigrationLogger,
  ) {}

  async migrateBatch(clientsData: any[], queryRunner: QueryRunner): Promise<number> {
    let count = 0;

    for (const client of clientsData) {
      try {
        // Verificar que tenga datos mínimos
        if (!client.DueñNomb || client.DueñNomb.trim() === '') {
          this.logger.warn(`Cliente sin nombre, RUT: ${client.DueñRutd}`);
          continue;
        }

        // Verificar si ya existe por RUT
        const existing = await queryRunner.manager
          .createQueryBuilder()
          .select('id')
          .from('clients', 'c')
          .where('c.rut = :rut', { rut: client.DueñRutd })
          .getRawOne();

        if (existing) {
          this.idMapping.addMapping('clients', client.DueñRutd, existing.id);
          count++;
          continue;
        }

        const result = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('clients')
          .values({
            rut: client.DueñRutd || null,
            name: client.DueñNomb,
            address: client.DueñDire || null,
            commune: client.DueñComu || null,
            phone: client.DueñTele || null,
            email: null,
            clientType: 'Normal',
            discount: 0,
            city: null,
          })
          .returning('id')
          .execute();

        const newId = result.identifiers[0].id;
        this.idMapping.addMapping('clients', client.DueñRutd, newId);
        count++;
      } catch (error) {
        this.logger.error(`Error migrando cliente RUT ${client.DueñRutd}`, error);
      }
    }

    return count;
  }
}
