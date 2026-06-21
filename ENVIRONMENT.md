# Environment Variables

This document lists all required environment variables for deploying AcronIQ Forge.

## API Server (Render)

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Secret for JWT token signing | `your-secret-key-here` |
| `NODE_ENV` | Environment (set to `production`) | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3001` |
| `LOG_LEVEL` | Logging level | `info` |

## Forge Web Application (Cloudflare Pages)

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Build port (required by Vite config) | `3000` |
| `BASE_PATH` | Base path for routing | `/` |
| `VITE_API_BASE_URL` | API server URL | `https://acroniq-forge.onrender.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Environment name | `production` |

## Forge Seed (Local)

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FORGE_API_URL` | Forge API endpoint | `https://acroniq-forge.onrender.com` |
| `FORGE_API_KEY` | API authentication key | `your-api-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_ENDPOINT` | Ollama API endpoint | `http://localhost:11434` |
| `OLLAMA_MODEL` | Default Ollama model | `deepseek-coder` |

## Setup Instructions

### Render (API Server)

1. Go to your Render dashboard
2. Select your Forge API service
3. Go to "Environment" section
4. Add all required variables from the table above
5. Redeploy the service

### Cloudflare Pages (Web App)

1. Go to your Cloudflare Pages dashboard
2. Select your Forge Pages project
3. Go to "Settings" > "Environment variables"
4. Add all required variables from the table above
5. Redeploy the project

### Local Development

Create a `.env` file in the root directory:

```env
# API Server
DATABASE_URL=postgresql://user:pass@localhost:5432/forge
JWT_SECRET=your-secret-key-here
NODE_ENV=development

# Web App
VITE_API_BASE_URL=http://localhost:3001

# Forge Seed
FORGE_API_URL=http://localhost:3001
FORGE_API_KEY=your-api-key
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=deepseek-coder
```

## Security Notes

- Never commit `.env` files to version control
- Use strong, randomly generated secrets for production
- Rotate secrets regularly
- Use different secrets for development and production
- Store secrets in your platform's secret management system (Render/Cloudflare)

