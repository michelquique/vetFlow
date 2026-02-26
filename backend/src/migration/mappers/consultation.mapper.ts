import { QueryRunner } from 'typeorm';
import { IdMappingService } from '../utils/id-mapping';
import { MigrationLogger } from '../utils/logger';

export class ConsultationMapper {
  constructor(
    private idMapping: IdMappingService,
    private logger: MigrationLogger,
  ) {}

  async migrateBatch(consultationsData: any[], queryRunner: QueryRunner): Promise<number> {
    let count = 0;

    for (const consult of consultationsData) {
      try {
        // Obtener IDs mapeados
        const petId = this.idMapping.getMapping('pets', consult.TratNrfi);
        if (!petId) {
          this.logger.warn(`Consulta ${consult.TratNrvi}: mascota no encontrada (ficha: ${consult.TratNrfi})`);
          continue;
        }

        const clientId = this.idMapping.getMapping('clients', consult.TratRutd);
        if (!clientId) {
          this.logger.warn(`Consulta ${consult.TratNrvi}: cliente no encontrado (RUT: ${consult.TratRutd})`);
          continue;
        }

        const doctorId = this.idMapping.getMapping('doctors', consult.TratMedi);
        if (!doctorId) {
          this.logger.warn(`Consulta ${consult.TratNrvi}: doctor no encontrado (código: ${consult.TratMedi})`);
          continue;
        }

        // Determinar tipo de consulta
        const type = consult.TratTipo === '1' || consult.TratTipo === 1 
          ? 'Curativa' 
          : 'Profilactica';

        // Calcular balance
        const amount = parseFloat(consult.TratValo || 0);
        const paid = parseFloat(consult.TratVapa || 0);
        const balance = amount - paid;

        // Fecha de próxima visita
        const nextVisitDate = consult.TratPrvi ? new Date(consult.TratPrvi) : null;

        const result = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('consultations')
          .values({
            consultationNumber: parseInt(consult.TratNrvi),
            petId: petId,
            clientId: clientId,
            doctorId: doctorId,
            date: new Date(consult.TratFevi),
            type: type,
            reason: null,
            symptoms: consult.TratSint || null,
            diagnosis: consult.TratDiag || null,
            treatment: consult.TratTrat || null,
            exams: null,
            nextVisitDate: nextVisitDate,
            nextVisitType: nextVisitDate ? type : null,
            nextTreatment: consult.TratPrtr || null,
            amount: amount,
            paid: paid,
            balance: balance,
            status: balance > 0 ? 'Active' : 'Completed',
          })
          .returning('id')
          .execute();

        count++;
      } catch (error) {
        this.logger.error(`Error migrando consulta ${consult.TratNrvi}`, error);
      }
    }

    return count;
  }
}
