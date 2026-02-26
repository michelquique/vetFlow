-- Script para limpiar las tablas antes de una re-migración
-- ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos de las tablas
-- Solo usar si necesitas rehacer la migración desde cero
-- 
-- Uso: psql -U postgres -d vetflow -f scripts/clean-migration-tables.sql

\echo '\n⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de las tablas'
\echo '¿Estás seguro que quieres continuar? (Presiona Ctrl+C para cancelar)'
\echo 'Esperando 5 segundos...\n'

SELECT pg_sleep(5);

\echo 'Limpiando tablas en orden...\n'

-- Desactivar temporalmente las foreign keys
SET session_replication_role = replica;

-- Limpiar tablas en orden inverso de dependencias
TRUNCATE TABLE consultations CASCADE;
\echo '✓ Tabla consultations limpiada'

TRUNCATE TABLE pets CASCADE;
\echo '✓ Tabla pets limpiada'

TRUNCATE TABLE clients CASCADE;
\echo '✓ Tabla clients limpiada'

TRUNCATE TABLE doctors CASCADE;
\echo '✓ Tabla doctors limpiada'

TRUNCATE TABLE breeds CASCADE;
\echo '✓ Tabla breeds limpiada'

TRUNCATE TABLE species_types CASCADE;
\echo '✓ Tabla species_types limpiada'

-- Reactivar foreign keys
SET session_replication_role = DEFAULT;

\echo '\n✅ Todas las tablas han sido limpiadas'
\echo 'Ahora puedes ejecutar la migración nuevamente:\n'
\echo '  cd backend'
\echo '  npm run migrate:keysoft\n'
