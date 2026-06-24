# Forge Deployment Guide

## Overview

Forge consists of multiple components deployed to different platforms:

- **Web UI**: Cloudflare Pages
- **API Server**: Render
- **Database**: Supabase (PostgreSQL)
- **Desktop Agent**: Standalone installer

## Prerequisites

- Node.js 18+
- pnpm
- Cloudflare account
- Render account
- Supabase account

## Environment Variables

### Web UI (apps/forge)

```env
VITE_API_BASE_URL="https://acroniq-forge.onrender.com"
```

### API Server (apps/api-server)

```env
DATABASE_URL="postgresql://user:password@host:port/database"
SESSION_SECRET="your-session-secret"
SUPABASE_SECRET_KEY="your-supabase-secret-key"
SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
SUPABASE_URL="https://your-project.supabase.co"
```

## Web UI Deployment (Cloudflare Pages)

### Build Configuration

The web UI uses Vite and is deployed to Cloudflare Pages.

**Build Settings:**
- **Root Directory:** Repository root (`/`)
- **Build command:** `pnpm --filter @workspace/forge run build`
- **Build output directory:** `apps/forge/dist`
- **Node.js version:** 18+

### Deployment Steps

1. Connect Cloudflare Pages to your Git repository
2. Configure build settings:
   - Framework preset: None (or Vite)
   - Root Directory: (Leave empty or set to `/`)
   - Build command: `pnpm --filter @workspace/forge run build`
   - Output directory: `apps/forge/dist`
3. Add environment variables:
   - `VITE_API_BASE_URL`: Your API server URL
4. Deploy

### Cloudflare Headers

The `_headers` file in `apps/forge` configures:
- Security headers
- CORS headers
- Cache policies

## API Server Deployment (Render)

### Build Configuration

The API server is an Express.js application deployed to Render.

**render.yaml:**

```yaml
services:
  - type: web
    name: forge-api
    env: node
    rootDirectory: apps/api-server
    buildCommand: cd ../.. && pnpm install && cd apps/api-server && pnpm run build
    startCommand: pnpm run start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: NODE_ENV
        value: production
```

### Deployment Steps

1. Connect Render to your Git repository
2. Create a new Web Service
3. Configure:
    - Root Directory: `apps/api-server`
    - Runtime: Node
    - Build Command: `cd ../.. && pnpm install && cd apps/api-server && pnpm run build`
    - Start Command: `pnpm run start`
4. Add environment variables
5. Deploy

### Health Check

Render automatically health checks the `/health` endpoint.

## Database Setup (Supabase)

### Project Creation

1. Create a new Supabase project
2. Note the database URL and API keys
3. Set up environment variables

### Running Migrations

```bash
cd db/migrations
node migrate.mjs
```

### Connection Pooling

Supabase provides connection pooling. Use the pooler URL in production:

```env
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
```

## Desktop Agent Distribution

### Building the Installer

The desktop agent is built with Tauri.

```bash
cd apps/desktop-agent
pnpm tauri build
```

### Distribution

- Windows: `.exe` installer
- macOS: `.dmg` disk image
- Linux: `.AppImage` or `.deb`

### Download Setup

Place the installer in `apps/forge/public/downloads/`:

```bash
cp apps/desktop-agent/src-tauri/target/release/bundle/nsis/forge-seed.exe apps/forge/public/downloads/
```

## Monitoring and Logging

### API Server Logs

Render provides real-time logs for the API server.

### Database Logs

Supabase provides database query logs in the dashboard.

### Web UI Analytics

Cloudflare Pages provides analytics for the web UI.

## Rollback Procedures

### Web UI

Cloudflare Pages automatically keeps previous deployments. Rollback via the dashboard.

### API Server

Render supports rollbacks to previous deployments via the dashboard.

### Database

Use Supabase point-in-time recovery if needed.

## Security Considerations

- All environment variables are encrypted
- Database uses SSL connections
- Session secrets are randomly generated
- API keys are rotated regularly
- CORS is configured for allowed origins

## Troubleshooting

### Web UI Issues

- Check Cloudflare Pages build logs
- Verify `VITE_API_BASE_URL` is correct
- Clear browser cache

### API Server Issues

- Check Render service logs
- Verify database connection string
- Check environment variables
- Test health endpoint: `https://your-api.onrender.com/health`

### Database Issues

- Check Supabase dashboard for connection status
- Verify migration was applied
- Check connection pool status
- Review query logs

### Desktop Agent Issues

- Verify pairing token is valid
- Check API server connectivity
- Review agent logs
- Ensure watched folders exist
