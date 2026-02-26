import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { DataCleaner } from './data-cleaner';
import { CatalogMapper } from './mappers/catalog.mapper';
import { DoctorMapper } from './mappers/doctor.mapper';
import { ClientMapper } from './mappers/client.mapper';
import { PetMapper } from './mappers/pet.mapper';
import { ConsultationMapper } from './mappers/consultation.mapper';
import { IdMappingService } from './utils/id-mapping';
import { MigrationLogger } from './utils/logger';
import { BatchProcessor } from './utils/batch-processor';
import { DataValidator } from './validators/data.validator';

interface KeySoftData {
  Doctores: { rowCount: number; columns: string[]; data: any[] };
  Dueños: { rowCount: number; columns: string[]; data: any[] };
  Especies: { rowCount: number; columns: string[]; data: any[] };
  Tratamientos: { rowCount: number; columns: string[]; data: any[] };
  TipoEspecie: { rowCount: number; columns: string[]; data: any[] };
  Razas: { rowCount: number; columns: string[]; data: any[] };
  EstCuenta: { rowCount: number; columns: string[]; data: any[] };
}

export class KeySoftMigration {
  private dataSource: DataSource;
  private logger: MigrationLogger;
  private idMapping: IdMappingService;
  private cleaner: DataCleaner;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.logger = new MigrationLogger('./migration-logs');
    this.idMapping = new IdMappingService();
    this.cleaner = new DataCleaner();
  }

  async migrate(jsonFilePath: string, dryRun: boolean = false): Promise<void> {
    this.logger.info('=== INICIO DE MIGRACIÓN KEYSOFT ===');
    this.logger.info(`Modo: ${dryRun ? 'DRY RUN (sin cambios)' : 'PRODUCCIÓN'}`);
    this.logger.info(`Archivo: ${jsonFilePath}`);

    try {
      // Paso 1: Cargar y validar JSON
      this.logger.info('Paso 1: Cargando datos de KeySoft...');
      const rawData = await this.loadJsonFile(jsonFilePath);
      const cleanData = this.cleaner.cleanAll(rawData);
      
      // Paso 2: Validar integridad
      this.logger.info('Paso 2: Validando integridad de datos...');
      await this.validateData(cleanData);

      // Mostrar estadísticas
      this.showStatistics(cleanData);

      if (dryRun) {
        this.logger.info('DRY RUN: Finalizando sin realizar cambios en la base de datos.');
        return;
      }

      // Confirmar antes de continuar
      this.logger.info('\n⚠️  A punto de iniciar la migración a la base de datos.');
      this.logger.info('   Asegúrate de haber hecho un backup de la base de datos.\n');

      // Paso 3: Iniciar transacción
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Paso 4: Migrar catálogos
        this.logger.info('Paso 3: Migrando catálogos (especies, razas)...');
        await this.migrateCatalogs(cleanData, queryRunner);

        // Paso 5: Migrar doctores
        this.logger.info('Paso 4: Migrando doctores...');
        await this.migrateDoctors(cleanData, queryRunner);

        // Paso 6: Migrar clientes
        this.logger.info('Paso 5: Migrando clientes...');
        await this.migrateClients(cleanData, queryRunner);

        // Paso 7: Migrar mascotas
        this.logger.info('Paso 6: Migrando mascotas...');
        await this.migratePets(cleanData, queryRunner);

        // Paso 8: Migrar consultas
        this.logger.info('Paso 7: Migrando consultas (esto puede tardar varios minutos)...');
        await this.migrateConsultations(cleanData, queryRunner);

        // Paso 9: Validar migración
        this.logger.info('Paso 8: Validando migración...');
        await this.validateMigration(cleanData, queryRunner);

        await queryRunner.commitTransaction();
        this.logger.success('\n=== MIGRACIÓN COMPLETADA EXITOSAMENTE ===\n');
        
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error('Error durante la migración, haciendo rollback', error);
        throw error;
      } finally {
        await queryRunner.release();
      }

      // Guardar mapeos para referencia futura
      const mappingPath = './migration-logs/id-mappings.json';
      await this.idMapping.saveToFile(mappingPath);
      this.logger.success(`Mapeos guardados en: ${mappingPath}`);
      
      // Mostrar estadísticas de mapeo
      const stats = this.idMapping.getStatistics();
      this.logger.info('\n📊 Estadísticas de mapeo:');
      Object.entries(stats).forEach(([entity, count]) => {
        this.logger.info(`  ${entity}: ${count} registros mapeados`);
      });
      
    } catch (error) {
      this.logger.error('Error fatal en la migración', error);
      throw error;
    }
  }

  private async loadJsonFile(filePath: string): Promise<KeySoftData> {
    this.logger.info(`Leyendo archivo: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    const fileSize = fs.statSync(filePath).size;
    this.logger.info(`Tamaño del archivo: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

    // Leer archivo
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Normalizar nombres de propiedades con caracteres especiales
    // El JSON original tiene "Due�os" con caracteres mal codificados
    const duenosKey = Object.keys(data).find(key => key.includes('Due') && key.includes('os'));
    if (duenosKey && duenosKey !== 'Dueños') {
      data['Dueños'] = data[duenosKey];
      delete data[duenosKey];
    }

    return data;
  }

  private async validateData(data: KeySoftData): Promise<void> {
    const validator = new DataValidator();
    const results = validator.validate(data);
    
    this.logger.info('Resultados de validación:');
    this.logger.info(`  - Doctores: ${results.doctors.valid}/${results.doctors.total} válidos`);
    this.logger.info(`  - Clientes: ${results.clients.valid}/${results.clients.total} válidos`);
    this.logger.info(`  - Mascotas: ${results.pets.valid}/${results.pets.total} válidos`);
    this.logger.info(`  - Consultas: ${results.consultations.valid}/${results.consultations.total} válidos`);

    if (results.errors.length > 0) {
      this.logger.warn(`\n⚠️  Se encontraron ${results.errors.length} advertencias`);
      const maxErrors = 10;
      results.errors.slice(0, maxErrors).forEach(err => this.logger.warn(`  - ${err}`));
      if (results.errors.length > maxErrors) {
        this.logger.warn(`  ... y ${results.errors.length - maxErrors} advertencias más`);
      }
    }
  }

  private showStatistics(data: KeySoftData): void {
    this.logger.info('\n📊 ESTADÍSTICAS DE DATOS A MIGRAR:');
    this.logger.info(`  Doctores:     ${data.Doctores.rowCount.toLocaleString()} registros`);
    this.logger.info(`  Clientes:     ${data.Dueños.rowCount.toLocaleString()} registros`);
    this.logger.info(`  Mascotas:     ${data.Especies.rowCount.toLocaleString()} registros`);
    this.logger.info(`  Consultas:    ${data.Tratamientos.rowCount.toLocaleString()} registros`);
    this.logger.info(`  Especies:     ${data.TipoEspecie.rowCount.toLocaleString()} tipos`);
    this.logger.info(`  Razas:        ${data.Razas.rowCount.toLocaleString()} razas\n`);
  }

  private async migrateCatalogs(data: KeySoftData, queryRunner: any): Promise<void> {
    const mapper = new CatalogMapper(this.idMapping, this.logger);
    
    // Migrar tipos de especie
    const speciesCount = await mapper.migrateSpeciesTypes(
      data.TipoEspecie.data,
      queryRunner
    );
    this.logger.success(`  ✓ ${speciesCount} tipos de especie migrados`);

    // Migrar razas
    const breedCount = await mapper.migrateBreeds(
      data.Razas.data,
      queryRunner
    );
    this.logger.success(`  ✓ ${breedCount} razas migradas`);
  }

  private async migrateDoctors(data: KeySoftData, queryRunner: any): Promise<void> {
    const mapper = new DoctorMapper(this.idMapping, this.logger);
    const count = await mapper.migrate(data.Doctores.data, queryRunner);
    this.logger.success(`  ✓ ${count} doctores migrados\n`);
  }

  private async migrateClients(data: KeySoftData, queryRunner: any): Promise<void> {
    const mapper = new ClientMapper(this.idMapping, this.logger);
    const batchProcessor = new BatchProcessor(1000); // 1000 por lote
    
    let migrated = 0;
    await batchProcessor.process(
      data.Dueños.data,
      async (batch) => {
        const count = await mapper.migrateBatch(batch, queryRunner);
        migrated += count;
        this.logger.info(`    Progreso: ${migrated.toLocaleString()}/${data.Dueños.rowCount.toLocaleString()}`);
      }
    );
    
    this.logger.success(`  ✓ ${migrated.toLocaleString()} clientes migrados\n`);
  }

  private async migratePets(data: KeySoftData, queryRunner: any): Promise<void> {
    const mapper = new PetMapper(this.idMapping, this.logger);
    const batchProcessor = new BatchProcessor(500);
    
    let migrated = 0;
    await batchProcessor.process(
      data.Especies.data,
      async (batch) => {
        const count = await mapper.migrateBatch(batch, queryRunner);
        migrated += count;
        this.logger.info(`    Progreso: ${migrated.toLocaleString()}/${data.Especies.rowCount.toLocaleString()}`);
      }
    );
    
    this.logger.success(`  ✓ ${migrated.toLocaleString()} mascotas migradas\n`);
  }

  private async migrateConsultations(data: KeySoftData, queryRunner: any): Promise<void> {
    const mapper = new ConsultationMapper(this.idMapping, this.logger);
    const batchProcessor = new BatchProcessor(200); // Más pequeño por ser datos complejos
    
    let migrated = 0;
    await batchProcessor.process(
      data.Tratamientos.data,
      async (batch) => {
        const count = await mapper.migrateBatch(batch, queryRunner);
        migrated += count;
        this.logger.info(`    Progreso: ${migrated.toLocaleString()}/${data.Tratamientos.rowCount.toLocaleString()}`);
      }
    );
    
    this.logger.success(`  ✓ ${migrated.toLocaleString()} consultas migradas\n`);
  }

  private async validateMigration(data: KeySoftData, queryRunner: any): Promise<void> {
    // Contar registros migrados
    const doctorCount = await queryRunner.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('doctors', 'd')
      .getRawOne();

    const clientCount = await queryRunner.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('clients', 'c')
      .getRawOne();

    const petCount = await queryRunner.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('pets', 'p')
      .getRawOne();

    const consultationCount = await queryRunner.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('consultations', 'co')
      .getRawOne();

    const results = {
      doctors: { expected: data.Doctores.rowCount, actual: parseInt(doctorCount.count) },
      clients: { expected: data.Dueños.rowCount, actual: parseInt(clientCount.count) },
      pets: { expected: data.Especies.rowCount, actual: parseInt(petCount.count) },
      consultations: { expected: data.Tratamientos.rowCount, actual: parseInt(consultationCount.count) },
    };

    this.logger.info('\n📊 VALIDACIÓN FINAL:');
    Object.entries(results).forEach(([entity, counts]) => {
      const percentage = ((counts.actual / counts.expected) * 100).toFixed(1);
      const status = counts.actual === counts.expected ? '✓' : '⚠️';
      this.logger.info(`  ${status} ${entity}: ${counts.actual.toLocaleString()}/${counts.expected.toLocaleString()} (${percentage}%)`);
    });
  }
}

// Script de ejecución
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const jsonPath = args.find(arg => arg.endsWith('.json')) || 
                   path.join(__dirname, '../../../docs/datosAntiguos/KeySoft_all.json');

  console.log('\n🏥 MIGRACIÓN KEYSOFT → VETFLOW\n');
  console.log('Argumentos disponibles:');
  console.log('  --dry-run          Ejecuta validación sin modificar la base de datos');
  console.log('  <ruta>.json        Ruta al archivo JSON de KeySoft\n');

  // Cargar variables de entorno si existen
  const envPath = path.join(__dirname, '../../../.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }

  // Configurar conexión a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'vetflow',
    entities: [path.join(__dirname, '../database/entities/*.entity{.ts,.js}')],
    synchronize: false,
  });

  try {
    console.log('📡 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✓ Conexión establecida\n');

    const migration = new KeySoftMigration(dataSource);
    await migration.migrate(jsonPath, dryRun);

    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

export default KeySoftMigration;
