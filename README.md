# AcronIQ-Forge

An autonomous software engineering platform that uses AI to analyze, fix, and improve codebases.

## Overview

Forge is a complete development platform consisting of:

- **Forge Web Application** - React-based control centre for managing projects, tasks, and AI agents
- **Forge Seed** - Local agent that monitors project folders and provides AI capabilities
- **API Server** - Backend API for authentication, project management, and task orchestration
- **Desktop Agent** - Tauri-based desktop application (requires Rust)

## Features

- **Prompt-Driven Engineering**: Submit natural language prompts to generate code fixes
- **Project Analysis**: Automatic codebase scanning with health scores and issue detection
- **Task Validation Pipeline**: Build and test validation before applying changes
- **AI Configuration**: Support for No AI, Local AI (Ollama), and Cloud AI modes
- **Engineering Memory**: Learns from your codebase patterns
- **Constitution Rules**: Enforceable engineering standards

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- (Optional) Rust for desktop agent

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Build Forge Seed executable
cd artifacts/forge-seed
pnpm run build:win
```

## Deployment

### Cloudflare Pages (Frontend)

The Forge web application is configured for Cloudflare Pages deployment:

1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - Build command: `cd artifacts/forge && pnpm install && pnpm run build`
   - Build output directory: `artifacts/forge/dist/public`
   - Environment variables:
     - `PORT`: `3000`
     - `BASE_PATH`: `/`
     - `VITE_API_BASE_URL`: `https://acroniq-forge.onrender.com`

3. Deploy - Cloudflare will automatically deploy on push to main branch

### Render (Backend API)

The API server is configured for Render deployment:

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build settings:
   - Root Directory: `artifacts/api-server`
   - Build Command: `pnpm install && pnpm run build`
   - Start Command: `pnpm run start`
   - Environment variables (required):
     - `DATABASE_URL`: PostgreSQL connection string
     - `JWT_SECRET`: Secret for JWT tokens
     - `NODE_ENV`: `production`

4. Deploy - Render will automatically deploy on push to main branch

### Environment Variables

See [ENVIRONMENT.md](./ENVIRONMENT.md) for a complete list of required environment variables.

## Project Structure

```text
AcronIQ-Forge/
├── artifacts/
│   ├── forge/              # Web application (React/Vite)
│   ├── forge-seed/         # Local agent (Node.js)
│   ├── api-server/         # Backend API (Express)
│   ├── api-client-react/   # Generated API client
│   ├── api-spec/           # OpenAPI specification
│   ├── api-zod/            # API schemas
│   └── db/                 # Database schemas
├── desktop-agent/          # Desktop application (Tauri)
├── lib/                    # Shared libraries
└── scripts/                # Utility scripts
```

## Development

### Running Locally

```bash
# Start API server
cd artifacts/api-server
pnpm run dev

# Start web application (in another terminal)
cd artifacts/forge
pnpm run dev

# Start Forge Seed (in another terminal)
cd artifacts/forge-seed
node dist/bundle.js
```

### Building

```bash
# Build all packages
pnpm run build

# Build specific package
cd artifacts/forge
pnpm run build
```

## License

MIT
