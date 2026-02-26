# Migración KeySoft → VetFlow

Sistema completo de migración de datos desde el antiguo sistema KeySoft al nuevo sistema VetFlow PostgreSQL.

## 📋 Índice

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura de Datos](#estructura-de-datos)
- [Proceso de Migración](#proceso-de-migración)
- [Solución de Problemas](#solución-de-problemas)

## 🔧 Requisitos Previos

1. **Base de datos PostgreSQL** funcionando
2. **Node.js** (v16 o superior)
3. **Archivo JSON** de KeySoft (`KeySoft_all.json`)
4. **Backup de la base de datos** actual

## 📦 Instalación

No requiere instalación adicional, usa las dependencias del proyecto backend.

## 🚀 Uso

### 1. Modo Dry-Run (Recomendado primero)

Ejecuta una validación completa sin modificar la base de datos:

```bash
cd backend
npm run migrate:keysoft -- --dry-run
```

Esto mostrará:
- ✅ Estadísticas de los datos
- ✅ Validación de integridad
- ✅ Registros válidos vs inválidos
- ❌ NO modifica la base de datos

### 2. Migración Real

**⚠️ IMPORTANTE: Haz un backup de tu base de datos antes de continuar**

```bash
# Backup de PostgreSQL
pg_dump -U postgres vetflow > backup_before_migration.sql

# Ejecutar migración
cd backend
npm run migrate:keysoft
```

### 3. Especificar archivo JSON personalizado

```bash
npm run migrate:keysoft -- /ruta/al/archivo/custom.json
```

## 📊 Estructura de Datos

### Tablas del Sistema Antiguo → Nuevo

| KeySoft | Registros | VetFlow | Prioridad |
|---------|-----------|---------|-----------|
| `Doctores` | 5 | `doctors` | 🔴 Alta |
| `Dueños` | 11,635 | `clients` | 🔴 Alta |
| `Especies` | 17,379 | `pets` | 🔴 Alta |
| `Tratamientos` | 46,055 | `consultations` | 🟡 Media |
| `TipoEspecie` | 3 | `species_types` | 🔴 Alta |
| `Razas` | 74 | `breeds` | 🔴 Alta |

### Mapeo de Campos Principales

#### Doctores
```
DoctCodi → UUID (mapeado)
DoctNomb → name
DoctNcmv → licenseNumber
```

#### Clientes (Dueños)
```
DueñRutd → rut
DueñNomb → name
DueñDire → address
DueñComu → commune
DueñTele → phone
```

#### Mascotas (Especies)
```
EspeNrfi → ficha
EspeNoes → name
EspeRutd → clientId (mapeado desde RUT)
EspeTies → speciesTypeId (mapeado)
EspeRaza → breedId (mapeado)
EspeSexo → sex (H→F, M→M)
EspeTama → size (S/M/L)
EspeColo → color
```

#### Consultas (Tratamientos)
```
TratNrvi → consultationNumber
TratFevi → date
TratTipo → type (0→Profilactica, 1→Curativa)
TratNrfi → petId (mapeado desde ficha)
TratRutd → clientId (mapeado desde RUT)
TratMedi → doctorId (mapeado)
TratSint → symptoms
TratDiag → diagnosis
TratTrat → treatment
TratValo → amount
TratVapa → paid
         → balance (calculado: amount - paid)
```

## 🔄 Proceso de Migración

### Fase 1: Preparación (automática)
1. Carga y validación del archivo JSON
2. Limpieza de caracteres especiales
3. Validación de integridad de datos

### Fase 2: Catálogos (automática)
1. Migración de tipos de especie (3 registros)
2. Migración de razas (74 registros)

### Fase 3: Datos Base (automática)
1. Migración de doctores (5 registros)
2. Migración de clientes (11,635 registros en lotes de 1,000)

### Fase 4: Datos Relacionados (automática)
1. Migración de mascotas (17,379 registros en lotes de 500)
2. Migración de consultas (46,055 registros en lotes de 200)

### Fase 5: Validación (automática)
1. Conteo de registros migrados
2. Verificación de integridad referencial
3. Generación de reporte

## 📁 Archivos Generados

Después de la migración, se generan:

```
migration-logs/
├── migration-YYYY-MM-DD.log          # Log completo
├── errors-YYYY-MM-DD.log             # Solo errores
└── id-mappings.json                  # Mapeo de IDs antiguos → nuevos
```

### Ejemplo de `id-mappings.json`

```json
{
  "doctors": [
    { "oldId": "00001", "newId": "uuid-123..." },
    { "oldId": "00004", "newId": "uuid-456..." }
  ],
  "clients": [
    { "oldId": "1", "newId": "uuid-789..." }
  ]
}
```

## 🛠️ Solución de Problemas

### Error: "Archivo no encontrado"

```bash
# Verificar ruta del archivo
ls -lh docs/datosAntiguos/KeySoft_all.json

# Especificar ruta completa
npm run migrate:keysoft -- /ruta/completa/KeySoft_all.json
```

### Error: "Connection refused" (PostgreSQL)

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar variables de entorno
cat backend/.env | grep DB_
```

### Error: "Duplicate key violation"

Esto indica que ya hay datos en la base de datos. Opciones:

1. **Limpiar tablas antes de migrar:**
```sql
TRUNCATE TABLE consultations CASCADE;
TRUNCATE TABLE pets CASCADE;
TRUNCATE TABLE clients CASCADE;
TRUNCATE TABLE doctors CASCADE;
TRUNCATE TABLE breeds CASCADE;
TRUNCATE TABLE species_types CASCADE;
```

2. **Restaurar desde backup:**
```bash
psql -U postgres vetflow < backup_before_migration.sql
```

### Advertencia: "Cliente no encontrado"

Esto es normal para algunos registros huérfanos. El sistema registra:
- Número de registros válidos migrados
- Registros que no pudieron migrarse (por referencias faltantes)

Revisa `errors-YYYY-MM-DD.log` para detalles.

## 📈 Tiempo Estimado

| Fase | Registros | Tiempo Estimado |
|------|-----------|-----------------|
| Validación | - | 1-2 minutos |
| Catálogos | 77 | < 1 segundo |
| Doctores | 5 | < 1 segundo |
| Clientes | 11,635 | 2-3 minutos |
| Mascotas | 17,379 | 3-5 minutos |
| Consultas | 46,055 | 10-15 minutos |
| **TOTAL** | **74,151** | **15-25 minutos** |

## ⚠️ Consideraciones Importantes

### Antes de Migrar

1. ✅ **Hacer backup** de la base de datos actual
2. ✅ **Ejecutar en ambiente de desarrollo** primero
3. ✅ **Verificar espacio en disco** (archivo JSON: 32MB, DB: ~500MB post-migración)
4. ✅ **Cerrar la aplicación** durante la migración

### Durante la Migración

- ⏳ **No interrumpir** el proceso (usa transacciones, rollback automático si falla)
- 📊 **Monitorear logs** en tiempo real
- 💾 **Verificar espacio** en disco de PostgreSQL

### Después de Migrar

1. ✅ **Validar datos críticos** manualmente
2. ✅ **Verificar conteos** de registros
3. ✅ **Probar funcionalidad** de la aplicación
4. ✅ **Revisar logs de errores**

## 🔍 Validación Manual Post-Migración

```sql
-- Contar registros por tabla
SELECT 'doctors' as tabla, COUNT(*) as total FROM doctors
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'pets', COUNT(*) FROM pets
UNION ALL
SELECT 'consultations', COUNT(*) FROM consultations;

-- Verificar integridad referencial
SELECT COUNT(*) as pets_sin_cliente 
FROM pets p 
LEFT JOIN clients c ON p."clientId" = c.id 
WHERE c.id IS NULL;

SELECT COUNT(*) as consultas_sin_mascota
FROM consultations co
LEFT JOIN pets p ON co."petId" = p.id
WHERE p.id IS NULL;

-- Verificar datos financieros
SELECT 
  SUM(amount) as total_facturado,
  SUM(paid) as total_pagado,
  SUM(balance) as total_pendiente
FROM consultations;
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en `migration-logs/`
2. Verifica la consola para errores en tiempo real
3. Consulta `id-mappings.json` para verificar mapeos

## 🎯 Checklist de Migración

### Pre-Migración
- [ ] Backup de base de datos creado
- [ ] Archivo KeySoft_all.json disponible
- [ ] Variables de entorno configuradas (.env)
- [ ] Dry-run ejecutado exitosamente

### Migración
- [ ] Migración ejecutada sin errores críticos
- [ ] Logs generados correctamente
- [ ] Mapeos guardados

### Post-Migración
- [ ] Conteo de registros validado
- [ ] Integridad referencial verificada
- [ ] Aplicación funciona correctamente
- [ ] Backup antiguo archivado

## 📝 Notas Técnicas

### Transformaciones Aplicadas

1. **Codificación de caracteres**: Corrección automática de caracteres mal codificados
2. **Sexo de mascotas**: `H` (Hembra) → `F` (Female)
3. **Tipo de consulta**: `0` → `Profilactica`, `1` → `Curativa`
4. **Fechas de nacimiento**: Calculadas desde años y meses
5. **Balance financiero**: Calculado como `amount - paid`

### Procesamiento por Lotes

Para optimizar memoria y rendimiento:
- Clientes: 1,000 por lote
- Mascotas: 500 por lote
- Consultas: 200 por lote

### Transaccionalidad

Toda la migración ocurre en una única transacción:
- ✅ Si todo tiene éxito: COMMIT
- ❌ Si algo falla: ROLLBACK completo

No quedarán datos parcialmente migrados.
