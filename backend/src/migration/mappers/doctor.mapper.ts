import { QueryRunner } from 'typeorm';
import { IdMappingService } from '../utils/id-mapping';
import { MigrationLogger } from '../utils/logger';

export class DoctorMapper {
  constructor(
    private idMapping: IdMappingService,
    private logger: MigrationLogger,
  ) {}

  async migrate(doctorsData: any[], queryRunner: QueryRunner): Promise<number> {
    let count = 0;

    for (const doctor of doctorsData) {
      try {
        const result = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('doctors')
          .values({
            name: doctor.DoctNomb,
            specialty: null,
            licenseNumber: doctor.DoctNcmv || null,
            phone: null,
            email: null,
            isActive: true,
          })
          .returning('id')
          .execute();

        const newId = result.identifiers[0].id;
        this.idMapping.addMapping('doctors', doctor.DoctCodi, newId);
        count++;

        this.logger.info(`  ✓ Doctor: ${doctor.DoctNomb} (${doctor.DoctCodi} → ${newId})`);
      } catch (error) {
        this.logger.error(`Error migrando doctor ${doctor.DoctNomb}`, error);
      }
    }

    return count;
  }
}
