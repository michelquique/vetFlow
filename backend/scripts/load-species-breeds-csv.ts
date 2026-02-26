import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

interface SpeciesCSVRow {
  Codigo: string;
  Tipo: string;
}

interface BreedCSVRow {
  Codigo: string;
  Raza: string;
}

// Mapeo de razas a sus especies (basado en conocimiento general)
const BREED_SPECIES_MAP: Record<string, string> = {
  // Gatos (Felinos)
  'SIAMES': 'FELINO',
  'PERSA': 'FELINO',
  'TURKISCHE': 'FELINO',
  'SIBERIANO': 'FELINO',
  'EXOTICO': 'FELINO',
  'TURCO BLANCO': 'FELINO',
  // Todas las demás son Caninos por defecto
};

async function loadSpeciesBreedsFromCSV() {
  console.log('\n🐾 CARGANDO ESPECIES Y RAZAS DESDE CSV\n');

  // Cargar variables de entorno
  const envPath = path.join(__dirname, '../.env');
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
    database: process.env.DB_NAME || 'vetflow',
    entities: [path.join(__dirname, '../src/database/entities/*.entity{.ts,.js}')],
    synchronize: false,
    logging: false,
  });

  try {
    // Conectar a la base de datos
    console.log('📡 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✓ Conexión establecida\n');

    const speciesRepository = dataSource.getRepository('SpeciesType');
    const breedRepository = dataSource.getRepository('Breed');

    // === CARGAR ESPECIES ===
    console.log('📂 CARGANDO ESPECIES...\n');
    
    const speciesPath = path.join(__dirname, '../../docs/datosAntiguos/TiposEspecie.csv');
    console.log(`📄 Leyendo archivo: ${speciesPath}`);
    
    if (!fs.existsSync(speciesPath)) {
      throw new Error(`Archivo no encontrado: ${speciesPath}`);
    }

    const speciesContent = fs.readFileSync(speciesPath, 'utf-8');
    const speciesRecords: SpeciesCSVRow[] = parse(speciesContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`✓ Total de especies en CSV: ${speciesRecords.length}\n`);

    const speciesMap: Record<string, string> = {}; // name -> id
    let speciesLoaded = 0;
    let speciesSkipped = 0;

    for (const record of speciesRecords) {
      const name = record.Tipo.trim().toUpperCase();
      
      if (!name) {
        speciesSkipped++;
        continue;
      }

      // Verificar si ya existe
      let existing = await speciesRepository.findOne({
        where: { name }
      });

      if (existing) {
        console.log(`  ⚠️  Especie ya existe: ${name}`);
        speciesMap[name] = (existing as any).id;
        speciesSkipped++;
        continue;
      }

      // Crear especie
      const species = await speciesRepository.save({
        name,
        description: `Especie ${name.charAt(0) + name.slice(1).toLowerCase()}`,
      });

      speciesMap[name] = (species as any).id;
      speciesLoaded++;
      console.log(`  ✓ Especie creada: ${name}`);
    }

    console.log(`\n📊 Especies: ${speciesLoaded} cargadas, ${speciesSkipped} existentes\n`);

    // === CARGAR RAZAS ===
    console.log('📂 CARGANDO RAZAS...\n');

    const breedsPath = path.join(__dirname, '../../docs/datosAntiguos/Razas.csv');
    console.log(`📄 Leyendo archivo: ${breedsPath}`);
    
    if (!fs.existsSync(breedsPath)) {
      throw new Error(`Archivo no encontrado: ${breedsPath}`);
    }

    const breedsContent = fs.readFileSync(breedsPath, 'utf-8');
    const breedsRecords: BreedCSVRow[] = parse(breedsContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`✓ Total de razas en CSV: ${breedsRecords.length}\n`);

    let breedsLoaded = 0;
    let breedsSkipped = 0;
    let breedsErrors = 0;

    // Obtener IDs de especies
    const caninoId = speciesMap['CANINO'];
    const felinoId = speciesMap['FELINO'];
    const otrosId = speciesMap['OTROS'];

    if (!caninoId || !felinoId) {
      console.log('⚠️  Especies base no encontradas. Creando...');
      
      // Crear especies si no existen
      if (!caninoId) {
        const canino = await speciesRepository.save({
          name: 'CANINO',
          description: 'Especie Canino',
        });
        speciesMap['CANINO'] = (canino as any).id;
      }
      
      if (!felinoId) {
        const felino = await speciesRepository.save({
          name: 'FELINO',
          description: 'Especie Felino',
        });
        speciesMap['FELINO'] = (felino as any).id;
      }
      
      if (!otrosId) {
        const otros = await speciesRepository.save({
          name: 'OTROS',
          description: 'Otras especies',
        });
        speciesMap['OTROS'] = (otros as any).id;
      }
    }

    for (const record of breedsRecords) {
      try {
        const name = record.Raza.trim().toUpperCase();
        
        if (!name) {
          breedsSkipped++;
          continue;
        }

        // Determinar especie basado en el mapeo
        let speciesTypeId = speciesMap['CANINO']; // Por defecto es canino
        
        if (BREED_SPECIES_MAP[name]) {
          speciesTypeId = speciesMap[BREED_SPECIES_MAP[name]];
        }

        // Verificar si ya existe la raza para esa especie
        const existing = await breedRepository.findOne({
          where: { name, speciesTypeId }
        });

        if (existing) {
          console.log(`  ⚠️  Raza ya existe: ${name}`);
          breedsSkipped++;
          continue;
        }

        // Crear raza
        await breedRepository.save({
          name,
          speciesTypeId,
          description: null,
        });

        breedsLoaded++;
        
        if (breedsLoaded % 10 === 0) {
          console.log(`  ✓ Cargadas: ${breedsLoaded} razas`);
        }
      } catch (error) {
        breedsErrors++;
        console.error(`  ❌ Error cargando raza ${record.Raza}:`, error.message);
      }
    }

    // Crear razas adicionales para felinos
    const felinoBreeds = [
      'SIAMES', 'PERSA', 'ANGORA', 'MAINE COON', 'RAGDOLL', 
      'BENGALA', 'ABISINIO', 'BRITISH SHORTHAIR', 'SCOTTISH FOLD',
      'BIRMANO', 'SPHYNX', 'HIMALAYO', 'AZUL RUSO', 'DEVON REX',
      'MESTIZO FELINO', 'EUROPEO COMUN'
    ];

    console.log('\n📂 Creando razas de felinos adicionales...');
    
    for (const breedName of felinoBreeds) {
      const existing = await breedRepository.findOne({
        where: { name: breedName, speciesTypeId: speciesMap['FELINO'] }
      });

      if (!existing) {
        await breedRepository.save({
          name: breedName,
          speciesTypeId: speciesMap['FELINO'],
          description: null,
        });
        breedsLoaded++;
        console.log(`  ✓ Raza felina creada: ${breedName}`);
      }
    }

    // Crear algunas razas para "OTROS"
    const otrosBreeds = [
      'CONEJO', 'HAMSTER', 'COBAYO', 'TORTUGA', 'LORO', 
      'CANARIO', 'PERICO', 'HURON', 'ERIZO', 'IGUANA',
      'SERPIENTE', 'PECES', 'CHINCHILLA', 'RATON', 'RATA'
    ];

    console.log('\n📂 Creando razas de otras especies...');
    
    for (const breedName of otrosBreeds) {
      const existing = await breedRepository.findOne({
        where: { name: breedName, speciesTypeId: speciesMap['OTROS'] }
      });

      if (!existing) {
        await breedRepository.save({
          name: breedName,
          speciesTypeId: speciesMap['OTROS'],
          description: null,
        });
        breedsLoaded++;
        console.log(`  ✓ Otra especie creada: ${breedName}`);
      }
    }

    console.log('\n📊 RESUMEN FINAL:');
    console.log(`  ✓ Especies cargadas: ${speciesLoaded}`);
    console.log(`  ✓ Razas cargadas: ${breedsLoaded}`);
    console.log(`  ⚠️  Registros saltados: ${breedsSkipped}`);
    console.log(`  ❌ Errores: ${breedsErrors}`);
    console.log('\n✅ Proceso completado exitosamente\n');

  } catch (error) {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Ejecutar
if (require.main === module) {
  loadSpeciesBreedsFromCSV().catch(console.error);
}

export default loadSpeciesBreedsFromCSV;
