-- ===============================
-- EXTENSIONS
-- ===============================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================
-- SCHEMA
-- ===============================
CREATE SCHEMA IF NOT EXISTS forge;

-- ===============================
-- SESSION TABLE (express-session / connect-pg-simple)
-- ===============================
CREATE TABLE IF NOT EXISTS forge.sessions (
  sid TEXT PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expire
  ON forge.sessions (expire);

-- ===============================
-- USERS
-- ===============================
CREATE TABLE forge.users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================
-- DEVICES
-- ===============================
CREATE TABLE forge.devices (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'windows',
  status TEXT NOT NULL DEFAULT 'offline',
  pairing_token TEXT NOT NULL,
  agent_version TEXT,
  ollama_available BOOLEAN NOT NULL DEFAULT false,
  ollama_version TEXT,
  active_model TEXT,
  last_heartbeat_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON forge.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_pairing_token ON forge.devices(pairing_token);
CREATE INDEX IF NOT EXISTS idx_devices_status ON forge.devices(status);

-- ===============================
-- PROJECTS
-- ===============================
CREATE TABLE forge.projects (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_scan_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON forge.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON forge.projects(status);

-- ===============================
-- AGENTS
-- ===============================
CREATE TABLE forge.agents (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_agents_project FOREIGN KEY (project_id) REFERENCES forge.projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agents_project_id ON forge.agents(project_id);

-- ===============================
-- AGENT RUNS
-- ===============================
CREATE TABLE forge.agent_runs (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  summary TEXT,
  recommendations TEXT[],
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_agent_runs_agent FOREIGN KEY (agent_id) REFERENCES forge.agents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON forge.agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON forge.agent_runs(status);

-- ===============================
-- TASKS
-- ===============================
CREATE TABLE forge.tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  build_status TEXT,
  files_modified TEXT[],
  confidence_score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES forge.projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON forge.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON forge.tasks(status);

-- ===============================
-- CONVERSATIONS
-- ===============================
CREATE TABLE forge.conversations (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  project_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_conversations_project FOREIGN KEY (project_id) REFERENCES forge.projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON forge.conversations(project_id);

-- ===============================
-- MESSAGES
-- ===============================
CREATE TABLE forge.messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES forge.conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON forge.messages(conversation_id);

-- ===============================
-- CONSTITUTION RULES
-- ===============================
CREATE TABLE forge.constitution_rules (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  enforcement TEXT NOT NULL DEFAULT 'warn',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_constitution_rules_category ON forge.constitution_rules(category);
CREATE INDEX IF NOT EXISTS idx_constitution_rules_enabled ON forge.constitution_rules(enabled);

-- ===============================
-- MEMORY
-- ===============================
CREATE TABLE forge.memory (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_key ON forge.memory(key);

-- ===============================
-- AUDIT ENTRIES
-- ===============================
CREATE TABLE forge.audit_entries (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  actor VARCHAR,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entries_entity ON forge.audit_entries(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_entries_action ON forge.audit_entries(action);
CREATE INDEX IF NOT EXISTS idx_audit_entries_created_at ON forge.audit_entries(created_at DESC);

-- ===============================
-- INTEGRATIONS
-- ===============================
CREATE TABLE forge.integrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrations_type ON forge.integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_enabled ON forge.integrations(enabled);
