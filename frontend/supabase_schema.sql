-- ==============================================================================
-- MAURIK ANGELO L. FERNANDEZ — PORTFOLIO DATABASE SCHEMA (SUPABASE)
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to "SQL Editor" on the left menu
-- 3. Click "+ New Query"
-- 4. Paste this entire file and click "Run" (green button)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. SITE CONTENT (Key-Value JSONB store for Profile, Skills, etc.)
create table if not exists public.site_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. PROJECTS TABLE
create table if not exists public.projects (
  id text primary key,
  title text not null,
  name text,
  subtitle text,
  tagline text,
  short_description text,
  long_description text,
  description text,
  summary text,
  category text,
  status text default 'Completed',
  repository_url text,
  live_demo_url text,
  start_date text,
  end_date text,
  featured boolean default false,
  display_order integer default 0,
  thumbnail_image text,
  technologies jsonb default '[]'::jsonb,
  highlights jsonb default '[]'::jsonb,
  gallery_images jsonb default '[]'::jsonb,
  screenshots jsonb default '[]'::jsonb,
  features jsonb default '[]'::jsonb,
  contributions jsonb default '[]'::jsonb,
  problem text,
  solution text,
  app_store_url text,
  play_store_url text,
  project_type text default 'main',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. EXPERIENCE TABLE
create table if not exists public.experience (
  id text primary key,
  company text not null,
  position text not null,
  duration text,
  description text,
  responsibilities jsonb default '[]'::jsonb,
  technologies jsonb default '[]'::jsonb,
  logo_url text,
  display_order integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. EDUCATION TABLE
create table if not exists public.education (
  id text primary key,
  degree text not null,
  institution text not null,
  campus text,
  duration text,
  description text,
  display_order integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. CERTIFICATES TABLE
create table if not exists public.certificates (
  id text primary key,
  title text not null,
  issuer text,
  date text,
  credential_url text,
  pdf_url text,
  image_url text,
  display_order integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. ANALYTICS EVENTS TABLE (Privacy-Conscious Visitor Telemetry)
create table if not exists public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  visitor_id text not null,
  session_id text not null,
  event_type text not null,
  event_target text,
  referrer text,
  referrer_raw text,
  device_type text,
  browser text,
  os text,
  page_path text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Index for fast analytics queries
create index if not exists idx_analytics_created_at on public.analytics_events (created_at desc);
create index if not exists idx_analytics_event_type on public.analytics_events (event_type);
create index if not exists idx_analytics_visitor_id on public.analytics_events (visitor_id);
create index if not exists idx_analytics_session_id on public.analytics_events (session_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Anyone can read/view public portfolio data.
-- Anyone can insert anonymous analytics events.
-- Only authenticated admin accounts can read analytics data or write content.
-- ==============================================================================

-- Enable RLS
alter table public.site_content enable row level security;
alter table public.projects enable row level security;
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.certificates enable row level security;
alter table public.analytics_events enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public read site_content" on public.site_content;
drop policy if exists "Admin write site_content" on public.site_content;
drop policy if exists "Public read projects" on public.projects;
drop policy if exists "Admin write projects" on public.projects;
drop policy if exists "Public read experience" on public.experience;
drop policy if exists "Admin write experience" on public.experience;
drop policy if exists "Public read education" on public.education;
drop policy if exists "Admin write education" on public.education;
drop policy if exists "Public read certificates" on public.certificates;
drop policy if exists "Admin write certificates" on public.certificates;
drop policy if exists "Public insert analytics_events" on public.analytics_events;
drop policy if exists "Admin read analytics_events" on public.analytics_events;
drop policy if exists "Admin delete analytics_events" on public.analytics_events;

-- Site Content Policies
create policy "Public read site_content" on public.site_content for select using (true);
create policy "Admin write site_content" on public.site_content for all using (auth.role() = 'authenticated');

-- Projects Policies
create policy "Public read projects" on public.projects for select using (true);
create policy "Admin write projects" on public.projects for all using (auth.role() = 'authenticated');

-- Experience Policies
create policy "Public read experience" on public.experience for select using (true);
create policy "Admin write experience" on public.experience for all using (auth.role() = 'authenticated');

-- Education Policies
create policy "Public read education" on public.education for select using (true);
create policy "Admin write education" on public.education for all using (auth.role() = 'authenticated');

-- Certificates Policies
create policy "Public read certificates" on public.certificates for select using (true);
create policy "Admin write certificates" on public.certificates for all using (auth.role() = 'authenticated');

-- Analytics Events Policies (Public insert, Admin read/manage)
create policy "Public insert analytics_events" on public.analytics_events for insert with check (true);
create policy "Admin read analytics_events" on public.analytics_events for select using (auth.role() = 'authenticated');
create policy "Admin delete analytics_events" on public.analytics_events for delete using (auth.role() = 'authenticated');

-- ==============================================================================
-- STORAGE BUCKET CREATION (For screenshots, thumbnails, resumes)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "Public read portfolio storage"
on storage.objects for select
using ( bucket_id = 'portfolio' );

create policy "Admin write portfolio storage"
on storage.objects for insert
with check ( bucket_id = 'portfolio' and auth.role() = 'authenticated' );

create policy "Admin update portfolio storage"
on storage.objects for update
using ( bucket_id = 'portfolio' and auth.role() = 'authenticated' );

create policy "Admin delete portfolio storage"
on storage.objects for delete
using ( bucket_id = 'portfolio' and auth.role() = 'authenticated' );

