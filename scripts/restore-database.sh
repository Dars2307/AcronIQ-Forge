#!/bin/bash

# Database restore script for Forge
# Usage: ./restore-database.sh <backup_file>

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-forge}"
DB_USER="${DB_USER:-forge}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Check backup file argument
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 forge_backup_20240623_120000.dump.gz"
  exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
  echo "Error: Backup file not found: ${BACKUP_DIR}/${BACKUP_FILE}"
  exit 1
fi

echo "Starting database restore..."
echo "Host: ${DB_HOST}:${DB_PORT}"
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_DIR}/${BACKUP_FILE}"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
  TEMP_FILE="${BACKUP_FILE%.gz}"
  gunzip -c "${BACKUP_DIR}/${BACKUP_FILE}" > "${BACKUP_DIR}/${TEMP_FILE}"
  BACKUP_FILE="${TEMP_FILE}"
fi

# Perform restore
PGPASSWORD="${DB_PASSWORD}" pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  "${BACKUP_DIR}/${BACKUP_FILE}"

# Clean up temporary decompressed file
if [[ $TEMP_FILE != "" ]]; then
  rm "${BACKUP_DIR}/${TEMP_FILE}"
fi

echo "Restore completed successfully"
