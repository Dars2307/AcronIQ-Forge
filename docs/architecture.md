# Forge Architecture

## Overview

Forge is an internal AI-powered development platform for AcronIQ. It provides code analysis, automated fixes, and engineering memory management for development teams.

## System Components

### Applications

- **Web UI** (`apps/forge`) - React-based web interface for managing projects, agents, and settings
- **API Server** (`apps/api-server`) - Express.js backend with PostgreSQL database
- **Desktop Agent** (`apps/desktop-agent`) - Tauri-based desktop application for local file monitoring
- **Forge Seed** (`apps/forge-seed`) - CLI tool for project setup and device pairing
- **Mockup Sandbox** (`apps/mockup-sandbox`) - Design mockup testing environment

### Shared Packages

- **api-client-react** (`packages/api-client-react`) - React hooks for API communication
- **api-spec** (`packages/api-spec`) - OpenAPI specifications
- **api-zod** (`packages/api-zod`) - Zod schemas for API validation
- **db** (`packages/db`) - Database schemas and types

## Technology Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Vite
- Wouter (routing)
- TanStack Query (data fetching)

### Backend
- Node.js
- Express.js
- PostgreSQL (via Supabase)
- pg (PostgreSQL client)
- express-session (session management)
- connect-pg-simple (PostgreSQL session store)

### Desktop
- Tauri
- Rust
- React

## Data Flow

```
┌─────────────┐
│   Web UI    │
└──────┬──────┘
       │ HTTP/REST
       ↓
┌─────────────┐
│ API Server  │
└──────┬──────┘
       │
       ├─→ PostgreSQL (sessions, users, projects, etc.)
       └─→ In-memory queues (agents, tasks)
```

## Key Features

### Engineering Memory
- Stores project-specific patterns, conventions, and preferences
- Categories: architecture, fix, convention, preference, workflow
- Manual and automatic entry sources

### Constitution Rules
- Enforceable engineering rules for AI-generated code
- Enforcement levels: block, warn, info
- Categories: language, security, structure, git, testing, architecture

### Agent System
- AI-powered code analysis and fixes
- In-memory queue processing
- Audit logging for all actions

### Device Management
- Desktop agent registration and pairing
- Real-time status monitoring
- Folder watching and indexing

## Security

- Session-based authentication with PostgreSQL storage
- Zero Trust principles (no implicit trust)
- Audit logging for all data mutations
- Environment variable configuration

## Deployment

- Web UI: Cloudflare Pages
- API Server: Render
- Database: Supabase (PostgreSQL)
- Desktop Agent: Standalone installer

## Development

```bash
# Install dependencies
pnpm install

# Run web UI
cd apps/forge
pnpm dev

# Run API server
cd apps/api-server
pnpm dev

# Run database migrations
cd db/migrations
node migrate.mjs
```

## AcronIQ Principles Applied

- **Data-First Design**: All systems built around structured data models
- **Explicit State**: All state is observable and queryable
- **Event Awareness**: Significant actions are logged as audit entries
- **Loose Coupling**: Clear separation between apps and shared packages
- **Auditability**: All mutations are logged in tamper-evident manner
