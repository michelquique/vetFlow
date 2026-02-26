# 📑 Índice de Documentación - Sistema de Migración

## 🎯 ¿Qué necesitas?

### 👤 Soy Usuario / No Técnico
**Quiero migrar los datos del sistema antiguo**

📖 Ve a: [`/MIGRATION_GUIDE.md`](../../../MIGRATION_GUIDE.md)
- Guía simple paso a paso
- 3 comandos principales
- Solución de problemas comunes

---

### 👨‍💻 Soy Desarrollador
**Necesito entender el sistema completo**

#### Documentación Disponible

1. **📋 Resumen General**
   - Archivo: [`/MIGRATION_SUMMARY.md`](../../../MIGRATION_SUMMARY.md)
   - Qué es: Resumen ejecutivo de todo el sistema
   - Cuándo leer: Primera vez conociendo el proyecto
   - Tiempo: 10-15 minutos

2. **📖 Guía de Usuario**
   - Archivo: [`/MIGRATION_GUIDE.md`](../../../MIGRATION_GUIDE.md)
   - Qué es: Instrucciones de uso práctico
   - Cuándo leer: Antes de ejecutar migración
   - Tiempo: 5-10 minutos

3. **📚 Documentación Completa**
   - Archivo: [`README.md`](./README.md) (este directorio)
   - Qué es: Manual técnico detallado
   - Cuándo leer: Para configuración avanzada
   - Tiempo: 20-30 minutos

4. **🏗️ Arquitectura Técnica**
   - Archivo: [`ARCHITECTURE.md`](./ARCHITECTURE.md) (este directorio)
   - Qué es: Diseño del sistema, patrones, flujos
   - Cuándo leer: Para modificar o extender el código
   - Tiempo: 30-40 minutos

---

### 🔧 Tareas Específicas

#### Ejecutar Migración
```bash
cd backend
npm run migrate:keysoft:dry  # Dry-run
npm run migrate:keysoft      # Real
```
📖 Guía: [`/MIGRATION_GUIDE.md`](../../../MIGRATION_GUIDE.md)

#### Hacer Backup
```bash
cd backend
./scripts/backup-database.sh
```

#### Verificar Resultado
```bash
psql -U postgres -d vetflow -f scripts/verify-migration.sql
```

#### Limpiar Tablas (Re-migración)
```bash
psql -U postgres -d vetflow -f scripts/clean-migration-tables.sql
```

#### Ver Logs
```bash
cat migration-logs/migration-*.log
cat migration-logs/errors-*.log
```

#### Modificar Código
1. Lee: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
2. Identifica el componente a modificar
3. Edita el archivo correspondiente en:
   - `mappers/` - Transformación de datos
   - `validators/` - Validaciones
   - `utils/` - Utilidades

---

## 📁 Estructura de Archivos

```
backend/src/migration/
│
├── 📑 INDEX.md                    ← Estás aquí
├── 📚 README.md                   ← Documentación completa
├── 🏗️  ARCHITECTURE.md            ← Arquitectura técnica
├── ⚙️  .env.example                ← Configuración
│
├── 🎯 migrate-keysoft.ts          ← Script principal
├── 🧹 data-cleaner.ts             ← Limpieza de datos
│
├── mappers/                       ← Transformadores
│   ├── catalog.mapper.ts
│   ├── doctor.mapper.ts
│   ├── client.mapper.ts
│   ├── pet.mapper.ts
│   └── consultation.mapper.ts
│
├── validators/                    ← Validadores
│   └── data.validator.ts
│
└── utils/                         ← Utilidades
    ├── logger.ts
    ├── id-mapping.ts
    └── batch-processor.ts
```

```
backend/scripts/
├── 💾 backup-database.sh          ← Crear backup
├── ✅ verify-migration.sql        ← Verificar migración
└── 🧹 clean-migration-tables.sql  ← Limpiar tablas
```

```
/ (raíz del proyecto)
├── 📖 MIGRATION_GUIDE.md          ← Guía de usuario
└── 📋 MIGRATION_SUMMARY.md        ← Resumen ejecutivo
```

---

## 🚀 Flujo Recomendado de Lectura

### Primera Vez
1. [`/MIGRATION_SUMMARY.md`](../../../MIGRATION_SUMMARY.md) - Visión general
2. [`/MIGRATION_GUIDE.md`](../../../MIGRATION_GUIDE.md) - Cómo usar
3. **Ejecutar migración** en ambiente de prueba

### Necesito Modificar el Código
1. [`README.md`](./README.md) - Entender funcionalidad completa
2. [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Entender diseño
3. **Revisar código** específico del componente
4. **Hacer cambios** y probar

### Troubleshooting
1. Ver logs en `migration-logs/`
2. Consultar sección de problemas en [`README.md`](./README.md)
3. Ejecutar `verify-migration.sql`
4. Revisar [`ARCHITECTURE.md`](./ARCHITECTURE.md) para entender flujo

---

## 📊 Mapeo de Tablas

| Sistema Antiguo | Sistema Nuevo | Registros | Mapper |
|-----------------|---------------|-----------|--------|
| TipoEspecie | `species_types` | 3 | `catalog.mapper.ts` |
| Razas | `breeds` | 74 | `catalog.mapper.ts` |
| Doctores | `doctors` | 5 | `doctor.mapper.ts` |
| Dueños | `clients` | 11,635 | `client.mapper.ts` |
| Especies | `pets` | 17,379 | `pet.mapper.ts` |
| Tratamientos | `consultations` | 46,055 | `consultation.mapper.ts` |

---

## 🆘 Ayuda Rápida

### Error durante migración
```bash
# Los logs están en:
cat backend/migration-logs/errors-*.log
```

### Necesito re-migrar
```bash
# 1. Limpiar tablas
psql -U postgres -d vetflow -f backend/scripts/clean-migration-tables.sql

# 2. Re-ejecutar
cd backend
npm run migrate:keysoft
```

### ¿Cuánto demora?
- Dry-run: 1-2 minutos
- Migración real: 15-25 minutos

### ¿Es seguro?
✅ Sí, usa transacciones ACID
✅ Rollback automático en errores
✅ Backup recomendado antes de migrar

---

## 💡 Tips

1. **Siempre hacer backup** antes de migrar
2. **Ejecutar dry-run primero** para ver problemas
3. **Revisar logs** después de migración
4. **Verificar con SQL** la integridad de datos
5. **Probar la aplicación** después de migrar

---

## 📞 Contacto / Soporte

- Logs: `migration-logs/`
- Mapeos: `migration-logs/id-mappings.json`
- Scripts: `backend/scripts/`

---

**Última actualización:** 2026-01-27
**Versión del sistema:** 1.0.0
