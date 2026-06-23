# Forge Database Documentation

## Overview

Forge uses PostgreSQL (hosted on Supabase) as its primary database. The database stores user sessions, projects, agents, tasks, engineering memory, constitution rules, and audit logs.

## Schema

### Tables

#### sessions
Session storage for express-session with PostgreSQL backend.

| Column | Type | Description |
|--------|------|-------------|
| sid | varchar | Primary key (session ID) |
| sess | jsonb | Session data |
| expire | timestamp | Expiration time |

**Indexes:**
- `IDX_session_expire` on `expire`

#### users
User accounts and authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| email | varchar | Unique email address |
| first_name | varchar | User first name |
| last_name | varchar | User last name |
| profile_image_url | varchar | Profile image URL |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### projects
Development projects managed by Forge.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| name | varchar | Project name |
| description | text | Project description |
| repository_url | varchar | Git repository URL |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### agents
AI agents for code analysis and fixes.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| project_id | integer | Foreign key to projects |
| name | varchar | Agent name |
| type | varchar | Agent type (e.g., "code-analyzer") |
| status | varchar | Agent status (idle, processing, error) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### tasks
Tasks queued for agent processing.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| project_id | integer | Foreign key to projects |
| agent_id | integer | Foreign key to agents |
| type | varchar | Task type |
| status | varchar | Task status (pending, processing, completed, failed) |
| input_data | jsonb | Task input data |
| result_data | jsonb | Task result data |
| error_message | text | Error message if failed |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes:**
- `IDX_tasks_status` on `status`
- `IDX_tasks_project_id` on `project_id`

#### memory_entries
Engineering memory for project patterns and conventions.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| project_id | integer | Foreign key to projects |
| category | varchar | Memory category (architecture, fix, convention, preference, workflow) |
| key | varchar | Memory key |
| value | text | Memory value |
| source | varchar | Entry source (manual, automatic) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes:**
- `IDX_memory_project_id` on `project_id`
- `IDX_memory_category` on `category`

#### constitution_rules
Enforceable engineering rules.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| category | varchar | Rule category (language, security, structure, git, testing, architecture) |
| title | varchar | Rule title |
| description | text | Rule description |
| enforcement | varchar | Enforcement level (block, warn, info) |
| enabled | boolean | Whether rule is enabled |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes:**
- `IDX_constitution_category` on `category`

#### audit_entries
Audit log for all system actions.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| project_id | integer | Foreign key to projects (nullable) |
| action | varchar | Action performed |
| actor | varchar | Who performed the action |
| details | jsonb | Action details |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `IDX_audit_project_id` on `project_id`
- `IDX_audit_created_at` on `created_at`

#### devices
Registered desktop devices.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| name | varchar | Device name |
| platform | varchar | Device platform (windows, macos, linux) |
| status | varchar | Device status (online, offline) |
| last_seen | timestamp | Last activity timestamp |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### conversations
Chat conversations with agents.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| project_id | integer | Foreign key to projects |
| title | varchar | Conversation title |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes:**
- `IDX_conversations_project_id` on `project_id`

#### messages
Messages within conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| conversation_id | integer | Foreign key to conversations |
| role | varchar | Message role (user, assistant, system) |
| content | text | Message content |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `IDX_messages_conversation_id` on `conversation_id`

## Migrations

Database migrations are located in `db/migrations/`.

### Running Migrations

```bash
cd db/migrations
node migrate.mjs
```

### Migration Files

- `001_initial_schema.sql` - Initial database schema
- `002_make_user_id_nullable.sql` - Makes user_id nullable in relevant tables

## Connection

The database is accessed via the `pg` Node.js package using the `DATABASE_URL` environment variable.

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Backup and Recovery

- Supabase provides automated backups
- Point-in-time recovery available
- Export functionality for manual backups

## Performance Considerations

- Indexes on frequently queried columns (project_id, status, created_at)
- JSONB for flexible data storage (tasks, audit entries)
- Connection pooling via pg Pool
- Session data stored in dedicated sessions table
