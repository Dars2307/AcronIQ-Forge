#!/bin/bash

# Database backup script for Forge
# Usage: ./backup-database.sh [backup_name]

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-forge}"
DB_USER="${DB_USER:-forge}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${1:-forge_backup_${TIMESTAMP}}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting database backup..."
echo "Host: ${DB_HOST}:${DB_PORT}"
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_DIR}/${BACKUP_NAME}.sql"

# Perform backup
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=custom \
  --file="${BACKUP_DIR}/${BACKUP_NAME}.dump"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_NAME}.dump"

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.dump.gz"

# Keep only last 7 days of backups
find "${BACKUP_DIR}" -name "forge_backup_*.dump.gz" -mtime +7 -delete

echo "Old backups cleaned up (older than 7 days)"
