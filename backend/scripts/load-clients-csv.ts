import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { ClientType } from '../src/database/entities/client.entity';

interface ClientCSVRow {
  Codigo: string;
  RUT: string;
  Nombre: string;
  Direccion: string;
  Comuna: string;
  Fono: string;
  Fax: string;
  Tipo: string;
  PDescuento: string;
  email: string;
  Ciudad: string;
}

async function loadClientsFromCSV() {
  console.log('\n🏥 CARGANDO CLIENTES DESDE CSV\n');

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

    // Leer el archivo CSV
    const csvPath = path.join(__dirname, '../../docs/datosAntiguos/Clientes.csv');
    console.log(`📄 Leyendo archivo: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Archivo no encontrado: ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parsear CSV
    const records: ClientCSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`✓ Total de registros en CSV: ${records.length}`);
    console.log(`📊 Se cargarán los primeros 100 registros\n`);

    // Tomar solo los primeros 100 registros
    const recordsToLoad = records.slice(0, 100);

    const clientRepository = dataSource.getRepository('Client');

    let loaded = 0;
    let skipped = 0;
    let errors = 0;

    for (const record of recordsToLoad) {
      try {
        // Limpiar y validar datos
        const name = cleanText(record.Nombre);
        
        // Validar que tenga nombre
        if (!name || name.trim() === '') {
          console.log(`⚠️  Saltando cliente sin nombre (RUT: ${record.RUT})`);
          skipped++;
          continue;
        }

        const rut = cleanRut(record.RUT);
        const address = cleanText(record.Direccion);
        const commune = cleanText(record.Comuna);
        const phone = cleanPhone(record.Fono);
        const email = cleanEmail(record.email);
        const city = cleanText(record.Ciudad);
        const clientType = record.Tipo === 'VIP' ? ClientType.VIP : ClientType.NORMAL;
        const discount = parseFloat(record.PDescuento) || 0;

        // Verificar si ya existe por RUT
        if (rut) {
          const existing = await clientRepository.findOne({
            where: { rut }
          });

          if (existing) {
            console.log(`⚠️  Cliente ya existe (RUT: ${rut})`);
            skipped++;
            continue;
          }
        }

        // Crear y guardar cliente
        const client: any = {};
        if (rut) client.rut = rut;
        client.name = name;
        if (address) client.address = address;
        if (commune) client.commune = commune;
        if (phone) client.phone = phone;
        if (email) client.email = email;
        client.clientType = clientType;
        client.discount = discount;
        if (city) client.city = city;

        await clientRepository.save(client);
        loaded++;
        
        if (loaded % 10 === 0) {
          console.log(`  ✓ Cargados: ${loaded} clientes`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error cargando cliente ${record.Nombre}:`, error.message);
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`  ✓ Clientes cargados: ${loaded}`);
    console.log(`  ⚠️  Registros saltados: ${skipped}`);
    console.log(`  ❌ Errores: ${errors}`);
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

// Funciones de limpieza
function cleanText(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

function cleanRut(rut: string): string {
  if (!rut) return '';
  // Remover caracteres no válidos y mantener solo números, K y guión
  return rut.toString().replace(/[^0-9kK-]/g, '').trim();
}

function cleanPhone(phone: string): string {
  if (!phone) return '';
  // Remover todo excepto números y el signo +
  const cleaned = phone.toString().replace(/[^0-9+]/g, '');
  return cleaned.slice(0, 15);
}

function cleanEmail(email: string): string {
  if (!email) return '';
  const cleaned = email.trim().toLowerCase();
  // Validar formato básico de email
  if (cleaned.includes('@') && cleaned.includes('.')) {
    return cleaned;
  }
  return '';
}

// Ejecutar
if (require.main === module) {
  loadClientsFromCSV().catch(console.error);
}

export default loadClientsFromCSV;
