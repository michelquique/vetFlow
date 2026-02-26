# Arquitectura del Sistema de Migración

## 📁 Estructura de Archivos

```
backend/src/migration/
├── migrate-keysoft.ts              # Script principal orquestador
├── data-cleaner.ts                 # Limpieza y normalización de datos
├── README.md                       # Documentación completa
├── ARCHITECTURE.md                 # Este archivo
├── .env.example                    # Ejemplo de configuración
│
├── mappers/                        # Transformadores de datos
│   ├── catalog.mapper.ts          # Especies y razas
│   ├── doctor.mapper.ts           # Doctores
│   ├── client.mapper.ts           # Clientes
│   ├── pet.mapper.ts              # Mascotas
│   └── consultation.mapper.ts     # Consultas
│
├── validators/                     # Validadores de integridad
│   └── data.validator.ts          # Validación de datos
│
└── utils/                          # Utilidades
    ├── logger.ts                  # Sistema de logs
    ├── id-mapping.ts              # Mapeo de IDs antiguos → nuevos
    └── batch-processor.ts         # Procesamiento por lotes
```

## 🔄 Flujo de Migración

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO DE MIGRACIÓN                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. CARGA Y VALIDACIÓN                                       │
│    - Leer KeySoft_all.json (32MB)                          │
│    - Normalizar encoding de caracteres                      │
│    - Validar integridad de datos                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. INICIAR TRANSACCIÓN                                      │
│    - BEGIN TRANSACTION                                      │
│    - Todo o nada (atomicidad)                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. MIGRAR CATÁLOGOS (orden: base de dependencias)          │
│    ├─ TipoEspecie → species_types (3 registros)           │
│    │   └─ Mapeo: código antiguo → UUID nuevo              │
│    │                                                         │
│    └─ Razas → breeds (74 registros)                       │
│        └─ Mapeo: código antiguo → UUID nuevo              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. MIGRAR DOCTORES                                          │
│    - Doctores → doctors (5 registros)                      │
│    - Mapeo: DoctCodi → UUID                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. MIGRAR CLIENTES (procesamiento por lotes)               │
│    - Lotes de 1,000 registros                              │
│    - Dueños → clients (11,635 registros)                   │
│    - Mapeo: RUT → UUID                                     │
│    - Validar duplicados por RUT                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. MIGRAR MASCOTAS (procesamiento por lotes)               │
│    - Lotes de 500 registros                                │
│    - Especies → pets (17,379 registros)                    │
│    - Mapeo: EspeNrfi (ficha) → UUID                       │
│    - Calcular birthDate desde años y meses                 │
│    - Transformar sexo: H → F                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. MIGRAR CONSULTAS (procesamiento por lotes)              │
│    - Lotes de 200 registros                                │
│    - Tratamientos → consultations (46,055 registros)       │
│    - Transformar tipo: 0 → Profilactica, 1 → Curativa     │
│    - Calcular balance: amount - paid                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. VALIDACIÓN FINAL                                         │
│    - Contar registros migrados                             │
│    - Verificar integridad referencial                      │
│    - Comparar con datos originales                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. COMMIT TRANSACTION                                       │
│    - Si todo OK: COMMIT                                    │
│    - Si error: ROLLBACK automático                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. GENERAR REPORTES                                        │
│     - Guardar logs                                         │
│     - Guardar mapeos (id-mappings.json)                   │
│     - Estadísticas finales                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Componentes Principales

### 1. KeySoftMigration (Orquestador)

**Responsabilidad:** Coordinar todo el proceso de migración

**Métodos principales:**
- `migrate()` - Método principal
- `loadJsonFile()` - Cargar y parsear JSON
- `validateData()` - Validar integridad
- `migrateCatalogs()` - Migrar especies y razas
- `migrateDoctors()` - Migrar doctores
- `migrateClients()` - Migrar clientes
- `migratePets()` - Migrar mascotas
- `migrateConsultations()` - Migrar consultas
- `validateMigration()` - Validación final

### 2. DataCleaner

**Responsabilidad:** Limpiar y normalizar datos del JSON antiguo

**Transformaciones:**
- Corregir encoding de caracteres especiales (ñ, á, é, etc.)
- Normalizar teléfonos
- Limpiar RUTs
- Transformar sexo de mascotas (H → F)
- Convertir strings a números donde corresponda

### 3. Mappers

**Responsabilidad:** Transformar datos antiguos al formato nuevo

#### CatalogMapper
- Migra tipos de especie
- Migra razas
- Mantiene mapeo de códigos → UUIDs

#### DoctorMapper
- Transforma datos de doctores
- Genera UUIDs nuevos
- Mantiene mapeo DoctCodi → UUID

#### ClientMapper
- Transforma datos de clientes
- Detecta duplicados por RUT
- Mantiene mapeo RUT → UUID

#### PetMapper
- Transforma datos de mascotas
- Calcula fechas de nacimiento
- Determina estado (vivo/muerto)
- Mantiene mapeo Ficha → UUID

#### ConsultationMapper
- Transforma datos de consultas
- Calcula balances financieros
- Determina estado de consulta
- Requiere todos los mapeos previos

### 4. IdMappingService

**Responsabilidad:** Mantener mapeo de IDs antiguos → nuevos UUIDs

**Estructura:**
```typescript
Map<string, Map<string, string>>
// entity → (oldId → newId)

Ejemplo:
{
  'doctors': {
    '00001': 'uuid-123-456-789',
    '00004': 'uuid-987-654-321'
  },
  'clients': {
    '1': 'uuid-111-222-333'
  }
}
```

### 5. MigrationLogger

**Responsabilidad:** Registro de eventos y errores

**Tipos de logs:**
- INFO: Información general
- SUCCESS: Operaciones exitosas
- WARN: Advertencias (no críticas)
- ERROR: Errores (con stack trace)

**Archivos generados:**
- `migration-YYYY-MM-DD.log` - Log completo
- `errors-YYYY-MM-DD.log` - Solo errores

### 6. BatchProcessor

**Responsabilidad:** Procesar grandes volúmenes por lotes

**Configuración:**
- Clientes: 1,000 por lote
- Mascotas: 500 por lote
- Consultas: 200 por lote

**Beneficios:**
- Reduce uso de memoria
- Permite progreso visible
- Facilita debugging

### 7. DataValidator

**Responsabilidad:** Validar integridad antes de migrar

**Validaciones:**
- Campos requeridos no vacíos
- Referencias existentes
- Formatos válidos

## 🔐 Transaccionalidad

### Estrategia ACID

```sql
BEGIN TRANSACTION;
  -- Todas las operaciones aquí
  INSERT INTO species_types...
  INSERT INTO breeds...
  INSERT INTO doctors...
  INSERT INTO clients...
  INSERT INTO pets...
  INSERT INTO consultations...
COMMIT; -- Solo si todo es exitoso

-- Si cualquier operación falla:
ROLLBACK; -- Revierte TODO
```

### Ventajas

1. **Atomicidad:** Todo o nada
2. **Consistencia:** Nunca datos parciales
3. **Aislamiento:** No interfiere con otras operaciones
4. **Durabilidad:** Una vez COMMIT, permanente

## 🗺️ Mapeo de IDs

### Problema

Sistema antiguo usa códigos numéricos:
- Doctores: `"00001"`, `"00004"`, etc.
- Clientes: RUT como identificador
- Mascotas: Número de ficha

Sistema nuevo usa UUIDs:
- `"550e8400-e29b-41d4-a716-446655440000"`

### Solución

`IdMappingService` mantiene mapeo bidireccional durante migración:

```typescript
// Cuando se migra un doctor:
const newId = insertDoctor();
idMapping.addMapping('doctors', oldCode, newId);

// Cuando se migra una consulta que referencia ese doctor:
const doctorId = idMapping.getMappingOrThrow('doctors', oldCode);
insertConsultation({ doctorId });
```

### Persistencia

Al final, se guarda `id-mappings.json`:

```json
{
  "doctors": [
    { "oldId": "00001", "newId": "uuid-..." }
  ],
  "clients": [
    { "oldId": "123456789", "newId": "uuid-..." }
  ]
}
```

**Utilidad:** Referencia futura para auditoría o re-migración

## 🎯 Manejo de Errores

### Estrategia por Niveles

#### Nivel 1: Validación Pre-Migración
- Detectar problemas antes de comenzar
- No modifica base de datos
- Genera reporte de problemas

#### Nivel 2: Manejo Granular
- Registros individuales que fallan no detienen todo
- Se registran y continúa
- Al final, reporte de éxitos/fallos

#### Nivel 3: Rollback Transaccional
- Error crítico → ROLLBACK completo
- Base de datos queda intacta
- Logs detallan qué falló

### Ejemplos

```typescript
// Nivel 1: Pre-validación
if (!client.DueñNomb) {
  logger.warn(`Cliente sin nombre: ${client.DueñRutd}`);
  continue; // Salta este registro
}

// Nivel 2: Try-catch individual
try {
  await insertClient(client);
} catch (error) {
  logger.error(`Error con cliente ${client.DueñRutd}`, error);
  continue; // Sigue con el siguiente
}

// Nivel 3: Rollback transaccional
try {
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction(); // TODO o NADA
  throw error;
}
```

## 📊 Optimizaciones

### 1. Procesamiento por Lotes
- Reduce presión en memoria
- Permite commits incrementales (en futuro)
- Progreso visible

### 2. Eager Loading Estratégico
- Mapeos en memoria (no DB lookups repetidos)
- Relaciones eager en entidades donde necesario

### 3. Índices de Base de Datos
- RUT en clients (unique)
- Ficha en pets (unique)
- consultationNumber (unique)

### 4. Streaming (Potencial Mejora)
Para archivos más grandes, considerar streaming del JSON:

```typescript
const stream = fs.createReadStream('large.json');
const parser = JSONStream.parse('Dueños.data.*');
stream.pipe(parser);
```

## 🧪 Testing

### Dry-Run Mode

```bash
npm run migrate:keysoft:dry
```

- Ejecuta TODO excepto escritura en BD
- Valida datos
- Genera estadísticas
- Sin riesgo

### Validación Post-Migración

```sql
-- Ver scripts/verify-migration.sql
SELECT COUNT(*) FROM clients; -- Debe ser ~11,635
SELECT COUNT(*) FROM pets;    -- Debe ser ~17,379
```

## 🔮 Extensibilidad

### Agregar Nueva Entidad

1. Crear mapper en `mappers/`:
```typescript
export class NewEntityMapper {
  async migrate(data: any[], queryRunner: QueryRunner) {
    // Transformar y insertar
  }
}
```

2. Agregar al orquestador:
```typescript
await this.migrateNewEntity(cleanData, queryRunner);
```

3. Actualizar validador si necesario

### Agregar Nueva Transformación

En `DataCleaner`:
```typescript
private cleanNewEntity(entity: any): any {
  return {
    ...entity,
    field: this.transformField(entity.field)
  };
}
```

## 📚 Referencias

- [TypeORM Transactions](https://typeorm.io/transactions)
- [PostgreSQL ACID](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [Node.js Streams](https://nodejs.org/api/stream.html)
