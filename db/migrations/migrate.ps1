# Database migration script for AcronIQ Forge
# Usage: .\migrate.ps1

if (-not $env:DATABASE_URL) {
  Write-Error "Error: DATABASE_URL environment variable is not set"
  exit 1
}

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Applying database migrations..."

# Apply initial schema
Write-Host "Applying 001_initial_schema.sql..."
& psql $env:DATABASE_URL -f "$scriptPath\migrations\001_initial_schema.sql"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to apply 001_initial_schema.sql"
  exit 1
}

# Apply nullable user_id migration
Write-Host "Applying 002_make_user_id_nullable.sql..."
& psql $env:DATABASE_URL -f "$scriptPath\migrations\002_make_user_id_nullable.sql"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to apply 002_make_user_id_nullable.sql"
  exit 1
}

Write-Host "Database migrations completed successfully!"
