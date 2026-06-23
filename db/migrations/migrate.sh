#!/bin/bash

# Database migration script for AcronIQ Forge
# Usage: ./migrate.sh

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "Applying database migrations..."

# Apply initial schema
echo "Applying 001_initial_schema.sql..."
psql "$DATABASE_URL" -f "$(dirname "$0")/migrations/001_initial_schema.sql"

# Apply nullable user_id migration
echo "Applying 002_make_user_id_nullable.sql..."
psql "$DATABASE_URL" -f "$(dirname "$0")/migrations/002_make_user_id_nullable.sql"

echo "Database migrations completed successfully!"
