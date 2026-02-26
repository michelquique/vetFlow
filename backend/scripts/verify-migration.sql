-- Script de verificación post-migración
-- Ejecutar con: psql -U postgres -d vetflow -f scripts/verify-migration.sql

\echo '\n==== VERIFICACIÓN DE MIGRACIÓN KEYSOFT → VETFLOW ====\n'

\echo '📊 1. CONTEO DE REGISTROS POR TABLA:'
SELECT 
    'doctors' as tabla, 
    COUNT(*) as total,
    '5 esperados' as esperado
FROM doctors
UNION ALL
SELECT 
    'clients', 
    COUNT(*),
    '~11,635 esperados'
FROM clients
UNION ALL
SELECT 
    'species_types', 
    COUNT(*),
    '3 esperados'
FROM species_types
UNION ALL
SELECT 
    'breeds', 
    COUNT(*),
    '74 esperados'
FROM breeds
UNION ALL
SELECT 
    'pets', 
    COUNT(*),
    '~17,379 esperados'
FROM pets
UNION ALL
SELECT 
    'consultations', 
    COUNT(*),
    '~46,055 esperados'
FROM consultations;

\echo '\n📊 2. INTEGRIDAD REFERENCIAL:'

\echo '\nMascotas sin cliente:'
SELECT COUNT(*) as total, 'DEBE SER 0' as estado
FROM pets p 
LEFT JOIN clients c ON p."clientId" = c.id 
WHERE c.id IS NULL;

\echo '\nMascotas sin tipo de especie:'
SELECT COUNT(*) as total, 'DEBE SER 0' as estado
FROM pets p 
LEFT JOIN species_types st ON p."speciesTypeId" = st.id 
WHERE st.id IS NULL;

\echo '\nConsultas sin mascota:'
SELECT COUNT(*) as total, 'DEBE SER 0' as estado
FROM consultations co
LEFT JOIN pets p ON co."petId" = p.id
WHERE p.id IS NULL;

\echo '\nConsultas sin cliente:'
SELECT COUNT(*) as total, 'DEBE SER 0' as estado
FROM consultations co
LEFT JOIN clients c ON co."clientId" = c.id
WHERE c.id IS NULL;

\echo '\nConsultas sin doctor:'
SELECT COUNT(*) as total, 'DEBE SER 0' as estado
FROM consultations co
LEFT JOIN doctors d ON co."doctorId" = d.id
WHERE d.id IS NULL;

\echo '\n💰 3. DATOS FINANCIEROS:'
SELECT 
    COUNT(*) as total_consultas,
    SUM(amount) as total_facturado,
    SUM(paid) as total_pagado,
    SUM(balance) as total_pendiente,
    ROUND(AVG(amount), 2) as promedio_consulta
FROM consultations;

\echo '\n📈 4. DISTRIBUCIÓN POR TIPO DE ESPECIE:'
SELECT 
    st.name as tipo_especie,
    COUNT(p.id) as total_mascotas
FROM species_types st
LEFT JOIN pets p ON p."speciesTypeId" = st.id
GROUP BY st.name
ORDER BY total_mascotas DESC;

\echo '\n🏥 5. CONSULTAS POR DOCTOR:'
SELECT 
    d.name as doctor,
    COUNT(co.id) as total_consultas,
    SUM(co.amount) as total_facturado
FROM doctors d
LEFT JOIN consultations co ON co."doctorId" = d.id
GROUP BY d.name
ORDER BY total_consultas DESC;

\echo '\n📅 6. RANGO DE FECHAS DE CONSULTAS:'
SELECT 
    MIN(date) as primera_consulta,
    MAX(date) as ultima_consulta,
    COUNT(*) as total_consultas
FROM consultations;

\echo '\n🐾 7. DISTRIBUCIÓN DE MASCOTAS POR SEXO:'
SELECT 
    sex as sexo,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM pets), 2) as porcentaje
FROM pets
GROUP BY sex;

\echo '\n💊 8. TIPOS DE CONSULTA:'
SELECT 
    type as tipo,
    COUNT(*) as total,
    SUM(amount) as total_monto,
    ROUND(AVG(amount), 2) as promedio
FROM consultations
GROUP BY type;

\echo '\n🔍 9. TOP 10 CLIENTES CON MÁS MASCOTAS:'
SELECT 
    c.name as cliente,
    c.rut,
    COUNT(p.id) as total_mascotas
FROM clients c
LEFT JOIN pets p ON p."clientId" = c.id
GROUP BY c.id, c.name, c.rut
ORDER BY total_mascotas DESC
LIMIT 10;

\echo '\n🏆 10. TOP 10 MASCOTAS CON MÁS CONSULTAS:'
SELECT 
    p.name as mascota,
    p.ficha,
    c.name as dueño,
    COUNT(co.id) as total_consultas
FROM pets p
LEFT JOIN clients c ON p."clientId" = c.id
LEFT JOIN consultations co ON co."petId" = p.id
GROUP BY p.id, p.name, p.ficha, c.name
ORDER BY total_consultas DESC
LIMIT 10;

\echo '\n✅ VERIFICACIÓN COMPLETADA\n'
