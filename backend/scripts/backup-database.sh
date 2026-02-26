#!/bin/bash

# Script para crear backup de la base de datos antes de la migración
# Uso: ./scripts/backup-database.sh

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🗄️  BACKUP DE BASE DE DATOS VETFLOW${NC}\n"

# Cargar variables de entorno si existen
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Variables de base de datos
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USERNAME:-postgres}
DB_NAME=${DB_DATABASE:-vetflow}

# Crear directorio de backups si no existe
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Nombre del archivo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/vetflow_backup_${TIMESTAMP}.sql"

echo "Configuración:"
echo "  Host: $DB_HOST"
echo "  Puerto: $DB_PORT"
echo "  Base de datos: $DB_NAME"
echo "  Usuario: $DB_USER"
echo ""

# Crear backup
echo -e "${YELLOW}Creando backup...${NC}"

PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo -e "${GREEN}✓ Backup creado exitosamente${NC}"
    echo "  Archivo: $BACKUP_FILE"
    echo "  Tamaño: $FILE_SIZE"
    echo ""
    echo -e "${GREEN}Ahora puedes ejecutar la migración con confianza:${NC}"
    echo "  cd backend"
    echo "  npm run migrate:keysoft:dry    # (primero en modo dry-run)"
    echo "  npm run migrate:keysoft        # (migración real)"
    echo ""
    echo -e "${YELLOW}Para restaurar este backup:${NC}"
    echo "  psql -U $DB_USER -d $DB_NAME < $BACKUP_FILE"
else
    echo -e "${RED}✗ Error al crear backup${NC}"
    echo "Verifica que PostgreSQL esté corriendo y las credenciales sean correctas"
    exit 1
fi
