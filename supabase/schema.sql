-- =========================================================
-- Plant Pokedex schema
-- Run this in the Supabase SQL editor (Project > SQL Editor)
-- =========================================================

-- 1. Genus -> "Type" lookup table (like Pokemon types, derived from genus)
create table if not exists genus_types (
  genus text primary key,
  type text not null
);

insert into genus_types (genus, type) values
  ('Monstera', 'Tropical'),
  ('Philodendron', 'Tropical'),
  ('Calathea', 'Tropical'),
  ('Alocasia', 'Tropical'),
  ('Anthurium', 'Tropical'),
  ('Epipremnum', 'Vine'),
  ('Hoya', 'Vine'),
  ('Ficus', 'Tree'),
  ('Dracaena', 'Tree'),
  ('Echeveria', 'Succulent'),
  ('Haworthia', 'Succulent'),
  ('Sedum', 'Succulent'),
  ('Crassula', 'Succulent'),
  ('Aloe', 'Succulent'),
  ('Opuntia', 'Cactus'),
  ('Mammillaria', 'Cactus'),
  ('Echinocactus', 'Cactus'),
  ('Nephrolepis', 'Fern'),
  ('Adiantum', 'Fern'),
  ('Platycerium', 'Fern'),
  ('Sansevieria', 'Structural'),
  ('Zamioculcas', 'Structural'),
  ('Spathiphyllum', 'Flowering'),
  ('Phalaenopsis', 'Flowering'),
  ('Begonia', 'Flowering'),
  ('Peperomia', 'Compact'),
  ('Pilea', 'Compact'),
  ('Tradescantia', 'Trailing'),
  ('Chlorophytum', 'Trailing')
on conflict (genus) do nothing;

-- 2. Plants table
create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  nickname text not null,
  genus text not null,
  species text,
  type text generated always as (null) stored, -- placeholder, replaced by trigger below
  photo_url text,
  acquired_date date default current_date,
  watering_interval_days integer default 7,
  notes text,
  created_at timestamptz default now()
);

-- Replace generated column with a real "type" column populated via trigger,
-- since genus_types is a separate lookup table (can't reference it in a generated column).
alter table plants drop column if exists type;
alter table plants add column type text;

create or replace function set_plant_type()
returns trigger as $$
begin
  select type into new.type from genus_types where genus = new.genus;
  if new.type is null then
    new.type := 'Unclassified';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_plant_type on plants;
create trigger trg_set_plant_type
before insert or update of genus on plants
for each row execute function set_plant_type();

-- 3. Watering logs
create table if not exists watering_logs (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid references plants(id) on delete cascade,
  watered_at timestamptz default now(),
  notes text
);

-- 4. Row Level Security
alter table plants enable row level security;
alter table watering_logs enable row level security;

-- Plants: users can only see/manage their own plants
create policy "Users can view own plants" on plants
  for select using (auth.uid() = user_id);
create policy "Users can insert own plants" on plants
  for insert with check (auth.uid() = user_id);
create policy "Users can update own plants" on plants
  for update using (auth.uid() = user_id);
create policy "Users can delete own plants" on plants
  for delete using (auth.uid() = user_id);

-- Watering logs: tied to ownership of the parent plant
create policy "Users can view own watering logs" on watering_logs
  for select using (
    exists (select 1 from plants where plants.id = watering_logs.plant_id and plants.user_id = auth.uid())
  );
create policy "Users can insert own watering logs" on watering_logs
  for insert with check (
    exists (select 1 from plants where plants.id = watering_logs.plant_id and plants.user_id = auth.uid())
  );
create policy "Users can delete own watering logs" on watering_logs
  for delete using (
    exists (select 1 from plants where plants.id = watering_logs.plant_id and plants.user_id = auth.uid())
  );

-- genus_types is public reference data, readable by anyone
alter table genus_types enable row level security;
create policy "Anyone can read genus types" on genus_types
  for select using (true);
