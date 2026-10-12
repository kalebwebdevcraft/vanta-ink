-- ======================================================================
-- VANTA / Ink Engine — database schema, Stage B1
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run once on a fresh project.
-- ======================================================================

-- ---------- Who is an admin (the artist) ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create policy "admins can read their own row"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Bookings ----------
create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  status         text not null default 'new'
                 check (status in ('new','reviewing','approved','declined','confirmed','completed','cancelled')),

  -- what they want
  kind           text not null check (kind in ('flash','custom','coverup')),
  flash_id       text,
  description    text check (char_length(description) <= 3000),
  style          text,
  reference_id   text,
  placement      text,
  size           text,
  detail         text,
  color          text,

  -- when
  session_date   date not null,
  session_time   text not null,

  -- money (whole currency units)
  estimate_low   integer,
  estimate_high  integer,
  deposit_amount integer,
  final_price    integer,
  payment_status text not null default 'unpaid'
                 check (payment_status in ('unpaid','pending','paid','refunded')),

  -- client
  name           text not null check (char_length(name) between 2 and 120),
  email          text not null check (char_length(email) <= 200 and email ~* '^\S+@\S+\.\S+$'),
  phone          text not null check (char_length(phone) between 6 and 40),
  notes          text check (char_length(notes) <= 2000),
  files          text[] not null default '{}',

  -- artist only
  artist_notes   text
);

create index if not exists bookings_status_idx on public.bookings (status, created_at desc);
create index if not exists bookings_date_idx   on public.bookings (session_date);

-- Two approved/confirmed bookings can never share the same slot.
create unique index if not exists bookings_one_per_slot
  on public.bookings (session_date, session_time)
  where status in ('approved','confirmed');

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ---------- Row Level Security ----------
alter table public.bookings enable row level security;

-- Visitors can ONLY create a fresh request. They can never read, edit or delete.
create policy "visitors can request a booking"
  on public.bookings for insert to anon, authenticated
  with check (
    status = 'new'
    and payment_status = 'unpaid'
    and artist_notes is null
    and final_price is null
  );

-- The artist can do everything.
create policy "admin full access"
  on public.bookings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke select, update, delete on public.bookings from anon;

-- ---------- Public availability (no personal data) ----------
-- Returns only date + time of slots that are already approved or confirmed.
create or replace function public.get_taken_slots(d_from date, d_to date)
returns table (session_date date, session_time text)
language sql stable security definer
set search_path = public
as $$
  select b.session_date, b.session_time
  from public.bookings b
  where b.session_date between d_from and d_to
    and b.status in ('approved','confirmed');
$$;

grant execute on function public.get_taken_slots(date, date) to anon, authenticated;

-- ---------- Private storage for reference images ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('references', 'references', false, 8388608,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

create policy "visitors can upload references"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'references');

create policy "admin can view references"
  on storage.objects for select to authenticated
  using (bucket_id = 'references' and public.is_admin());

create policy "admin can delete references"
  on storage.objects for delete to authenticated
  using (bucket_id = 'references' and public.is_admin());