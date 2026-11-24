-- ============================================================================
-- Sentinel Trading: ROSTR Hub knowledge base + sign-up funnel events
-- Paste into Supabase -> SQL Editor -> Run. Safe to run more than once.
-- ============================================================================

-- 1. Vector search support
create extension if not exists vector;

-- 2. Hub knowledge base (RAG DAL findings with provenance, paper section 5.5)
create table if not exists public.rostr_kb (
  id uuid primary key default gen_random_uuid(),
  namespace text not null default 'global',          -- global | org/... | project/...
  query_origin text not null,                        -- question that triggered the research
  topic text not null,                               -- the sub-question answered
  summary text not null,                             -- finding, without citation markers
  sources jsonb not null default '[]'::jsonb,        -- [{title,url,domain,tier,credibility}]
  confidence real not null,                          -- RAG DAL confidence 0..1
  verification_status text not null check (verification_status in ('verified','uncertain')),
  time_sensitive boolean not null default true,      -- time-sensitive findings expire after 72h
  domain text,
  tickers text[] default '{}',
  embedding vector(768) not null,                    -- gemini-embedding-001, 768 dims
  created_at timestamptz not null default now()
);

create index if not exists rostr_kb_embedding_idx
  on public.rostr_kb using hnsw (embedding vector_cosine_ops);
create index if not exists rostr_kb_namespace_created_idx
  on public.rostr_kb (namespace, created_at desc);

-- Only the server (service role) reads/writes. No public access.
alter table public.rostr_kb enable row level security;

-- 3. Semantic search function used by PAL stage 2 (context injection)
create or replace function public.match_rostr_kb(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_namespace text default 'global'
)
returns table (
  id uuid, query_origin text, topic text, summary text, sources jsonb,
  confidence real, verification_status text, time_sensitive boolean,
  created_at timestamptz, similarity float
)
language sql stable
set search_path = public
as $$
  select k.id, k.query_origin, k.topic, k.summary, k.sources,
         k.confidence, k.verification_status, k.time_sensitive, k.created_at,
         1 - (k.embedding <=> query_embedding) as similarity
  from public.rostr_kb k
  where k.namespace = p_namespace
    and 1 - (k.embedding <=> query_embedding) > match_threshold
  order by k.embedding <=> query_embedding
  limit least(match_count, 20);
$$;

revoke all on function public.match_rostr_kb(vector, float, int, text) from public, anon, authenticated;

-- 4. Funnel analytics (anonymous; no emails, no names, no keys)
create table if not exists public.funnel_events (
  id bigint generated always as identity primary key,
  event text not null,          -- landing_view, cta_click, signup_plan_selected, ...
  anon_id text not null,        -- random id stored in the visitor's browser
  plan text,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists funnel_events_event_created_idx on public.funnel_events (event, created_at desc);
create index if not exists funnel_events_anon_idx on public.funnel_events (anon_id, created_at);
alter table public.funnel_events enable row level security;

-- 5. Funnel report: unique visitors reaching each step (last 30 days)
create or replace view public.funnel_report as
with steps(step_order, event, label) as (
  values
    (1, 'landing_view',            'Saw landing page'),
    (2, 'cta_click',               'Clicked Start free'),
    (3, 'signup_plan_selected',    'Chose a plan'),
    (4, 'signup_account_created',  'Created account'),
    (5, 'signup_ai_key_connected', 'Connected AI key'),
    (6, 'dashboard_first_view',    'Reached dashboard'),
    (7, 'first_question_asked',    'Asked first question'),
    (8, 'first_answer_received',   'Got first answer')
),
reached as (
  select event, count(distinct anon_id) as visitors
  from public.funnel_events
  where created_at > now() - interval '30 days'
  group by event
)
select s.step_order, s.label, s.event,
       coalesce(r.visitors, 0) as visitors,
       round(100.0 * coalesce(r.visitors, 0) / nullif(first_value(coalesce(r.visitors, 0)) over (order by s.step_order), 0), 1) as pct_of_start,
       round(100.0 * coalesce(r.visitors, 0) / nullif(lag(coalesce(r.visitors, 0)) over (order by s.step_order), 0), 1) as pct_of_previous
from steps s left join reached r on r.event = s.event
order by s.step_order;

revoke all on public.funnel_report from anon, authenticated;
