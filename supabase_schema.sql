-- ============================================================================
-- ALPHASENTIENCE AI · PAL & ROSTR AUTONOMOUS AGENT OS SUPABASE SCHEMA (v1.0.0)
-- Paste into Supabase SQL Editor to provision persistent tables + RLS policies
-- ============================================================================

create table if not exists pal_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  project_id text default 'alphasentience-rostr-core',
  wizard_config jsonb default '{}'::jsonb,
  wholeness_score numeric(4,2) default 1.00,
  created_at timestamptz default now()
);

create table if not exists pal_prompts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references pal_sessions(id) on delete cascade,
  user_id text not null,
  project_id text default 'alphasentience-rostr-core',
  question text,
  response text,
  philosophy text,
  holding_horizon text,
  goal_target text,
  input_links jsonb default '[]'::jsonb,
  file_storage_links jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists pal_files (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references pal_sessions(id) on delete cascade,
  user_id text not null,
  project_id text default 'alphasentience-rostr-core',
  file_name text not null,
  file_format text default 'text/markdown',
  file_description text,
  storage_path text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists pal_runs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references pal_sessions(id) on delete cascade,
  run_number int default 1,
  stage text not null, -- intent | hypothesis | docs | instructions | dag_waves | pop_11 | diagrid
  artifact_path text,
  dag_compression_ms int default 11,
  summary jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists rostr_pop_artifacts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references pal_sessions(id) on delete cascade,
  user_id text not null,
  artifact_code text not null, -- A .. K
  filename text not null,      -- 01_INTENT_BRIEF.md .. 11_SKILL.md
  content_md text not null,
  created_at timestamptz default now()
);

create table if not exists composio_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  integration_id text not null,
  status text default 'connected',
  last_receipt jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS) across all tables
alter table pal_sessions enable row level security;
alter table pal_prompts enable row level security;
alter table pal_files enable row level security;
alter table pal_runs enable row level security;
alter table rostr_pop_artifacts enable row level security;
alter table composio_connections enable row level security;

-- Tenant Isolation RLS Policies
create policy "Users manage own pal_sessions" on pal_sessions
  for all using (auth.uid()::text = user_id);

create policy "Users manage own pal_prompts" on pal_prompts
  for all using (auth.uid()::text = user_id);

create policy "Users manage own pal_files" on pal_files
  for all using (auth.uid()::text = user_id);

create policy "Users manage own rostr_pop_artifacts" on rostr_pop_artifacts
  for all using (auth.uid()::text = user_id);

create policy "Users manage own composio_connections" on composio_connections
  for all using (auth.uid()::text = user_id);
