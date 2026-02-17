-- Profili utente (estende auth.users)
create table profiles (
  id uuid references auth.users primary key,
  name text,
  property_type text,        -- appartamento, casa, stanza, villa
  location_city text,
  location_area text,
  experience_level text,     -- nuovo, <6mesi, 6-12mesi, >1anno
  guest_target text[],       -- array: turisti, business, famiglie, etc.
  improvement_budget text,   -- 0, <200, 200-500, 500+
  subscription_tier text default 'free',  -- free, pro, business
  stripe_customer_id text,
  analyses_used int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Listing analizzati
create table listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  airbnb_url text,
  raw_data jsonb,            -- dati scraping
  analysis jsonb,            -- risultato analisi Claude
  overall_score int,
  title_score int,
  photos_score int,
  amenities_score int,
  description_score int,
  pricing_score int,
  created_at timestamptz default now()
);

-- Task settimanali
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  title text,
  description text,
  impact text,               -- alto, medio, basso
  estimated_minutes int,
  completed boolean default false,
  week_start date,
  created_at timestamptz default now()
);

-- Foto analizzate
create table photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  listing_id uuid references listings(id),
  storage_path text,         -- path in Supabase Storage
  room_type text,
  score int,
  analysis jsonb,            -- risultato Claude Vision
  created_at timestamptz default now()
);

-- Titoli/descrizioni generate
create table generated_content (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  listing_id uuid references listings(id),
  content_type text,         -- title, description
  variants jsonb,            -- array di varianti generate
  created_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table listings enable row level security;
alter table tasks enable row level security;
alter table photos enable row level security;
alter table generated_content enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can view own listings" on listings
  for select using (auth.uid() = user_id);

create policy "Users can insert own listings" on listings
  for insert with check (auth.uid() = user_id);

create policy "Users can view own tasks" on tasks
  for select using (auth.uid() = user_id);

create policy "Users can update own tasks" on tasks
  for update using (auth.uid() = user_id);

create policy "Users can insert own tasks" on tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can view own photos" on photos
  for select using (auth.uid() = user_id);

create policy "Users can insert own photos" on photos
  for insert with check (auth.uid() = user_id);

create policy "Users can view own generated content" on generated_content
  for select using (auth.uid() = user_id);

create policy "Users can insert own generated content" on generated_content
  for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
