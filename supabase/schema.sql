-- TableNow — Supabase (Postgres) schema
-- =====================================================================
-- This is the live backend target. It mirrors the domain model in
-- src/lib/types.ts. Run it in the Supabase SQL editor (or via the CLI) to
-- provision the database. Row Level Security keeps every row scoped to its
-- owner, and the book_reservation() function makes "confirm booking + consume
-- exactly one credit" a single atomic transaction — the Postgres equivalent of
-- the Cloudflare Durable Object lock described in the original spec.

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type platform              as enum ('resy', 'opentable');
create type flexibility           as enum ('strict', 'flexible', 'very_flexible');
create type seating_preference    as enum ('any', 'indoor', 'outdoor', 'bar', 'counter');
create type priority              as enum ('normal', 'high');
create type request_status        as enum (
  'draft','active','booked','needs_credits','needs_connection',
  'paused','expired','failed','canceled'
);
create type attempt_status        as enum (
  'checked_no_match','match_found','booking_started','booking_succeeded',
  'booking_failed','connection_failed','request_locked','duplicate_prevented'
);
create type booking_status        as enum ('confirmed','canceled','manual_review');
create type credit_txn_type       as enum (
  'signup_bonus','purchase','booking_success','refund','admin_adjustment'
);
create type connection_status     as enum ('connected','disconnected','needs_reconnect');
create type notification_type     as enum (
  'booking_success','request_expired','request_paused','needs_credits','connection_issue'
);

-- ---------------------------------------------------------------------
-- users  (profile row; auth handled by Supabase auth.users)
-- ---------------------------------------------------------------------
create table public.users (
  id                  uuid primary key references auth.users (id) on delete cascade,
  name                text not null default '',
  email               text not null,
  credit_balance      integer not null default 0 check (credit_balance >= 0),
  free_credit_granted boolean not null default true,
  free_credit_used    boolean not null default false,
  default_city        text not null default 'New York',
  default_party_size  integer not null default 2,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- connected_accounts
-- ---------------------------------------------------------------------
create table public.connected_accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  provider        platform not null,
  status          connection_status not null default 'disconnected',
  account_label   text,
  last_checked_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, provider)
);

-- ---------------------------------------------------------------------
-- reservation_requests
-- ---------------------------------------------------------------------
create table public.reservation_requests (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users (id) on delete cascade,
  restaurant_name   text not null,
  platform          platform not null,
  provider_venue_id text,
  city              text not null,
  neighborhood      text,
  party_size        integer not null check (party_size > 0),
  date_start        date not null,
  date_end          date not null,
  time_start        text not null,   -- 'HH:MM'
  time_end          text not null,
  flexibility_level flexibility not null default 'flexible',
  seating_preference seating_preference not null default 'any',
  priority          priority not null default 'normal',
  status            request_status not null default 'draft',
  credit_required   boolean not null default true,
  auto_book_enabled boolean not null default false,
  notes             text,
  expires_at        timestamptz,
  last_checked_at   timestamptz,
  next_check_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on public.reservation_requests (user_id);
-- Drives the scheduled checker: "find active requests due for a check".
create index on public.reservation_requests (status, next_check_at)
  where status = 'active';

-- ---------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------
create table public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users (id) on delete cascade,
  reservation_request_id uuid not null references public.reservation_requests (id) on delete cascade,
  restaurant_name       text not null,
  platform              platform not null,
  date                  date not null,
  time                  text not null,
  party_size            integer not null,
  confirmation_number   text not null,
  status                booking_status not null default 'confirmed',
  credit_used           boolean not null default false,
  booked_at             timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
-- A request can only ever have one confirmed booking. This unique partial
-- index is the database-level guarantee against double-booking.
create unique index one_confirmed_booking_per_request
  on public.bookings (reservation_request_id)
  where status = 'confirmed';

-- ---------------------------------------------------------------------
-- credit_transactions
-- ---------------------------------------------------------------------
create table public.credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  type        credit_txn_type not null,
  amount      integer not null,         -- +added / -consumed / 0 free
  reason      text not null default '',
  booking_id  uuid references public.bookings (id) on delete set null,
  created_at  timestamptz not null default now()
);
-- A booking can only ever drive one credit consumption. Belt-and-suspenders
-- against double credit usage alongside book_reservation()'s transaction.
create unique index one_consumption_per_booking
  on public.credit_transactions (booking_id)
  where type = 'booking_success';

-- ---------------------------------------------------------------------
-- booking_attempts  (audit trail)
-- ---------------------------------------------------------------------
create table public.booking_attempts (
  id                    uuid primary key default gen_random_uuid(),
  reservation_request_id uuid not null references public.reservation_requests (id) on delete cascade,
  platform              platform not null,
  status                attempt_status not null,
  message               text not null default '',
  checked_at            timestamptz not null default now(),
  created_at            timestamptz not null default now()
);
create index on public.booking_attempts (reservation_request_id, checked_at desc);

-- ---------------------------------------------------------------------
-- concierge_messages
-- ---------------------------------------------------------------------
create table public.concierge_messages (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users (id) on delete cascade,
  role               text not null check (role in ('user','assistant')),
  content            text not null,
  structured_payload jsonb,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
create table public.notifications (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users (id) on delete cascade,
  reservation_request_id uuid references public.reservation_requests (id) on delete set null,
  type                   notification_type not null,
  channel                text not null default 'email',
  status                 text not null default 'queued',
  sent_at                timestamptz,
  created_at             timestamptz not null default now()
);

-- =====================================================================
-- book_reservation(): atomic "confirm booking + consume exactly 1 credit"
-- =====================================================================
-- Called by the booking worker only after an adapter confirms a table. A
-- transaction-level advisory lock keyed on the request id serialises any
-- concurrent attempts for the same request, and the unique indexes above make
-- a duplicate booking or duplicate consumption impossible even under a race.
create or replace function public.book_reservation(
  p_request_id        uuid,
  p_confirmation      text,
  p_booked_date       date,
  p_booked_time       text,
  p_party_size        integer
) returns public.bookings
language plpgsql
security definer
as $$
declare
  v_user   public.users;
  v_req    public.reservation_requests;
  v_use_free   boolean;
  v_booking    public.bookings;
begin
  -- Serialise concurrent attempts for this request (the DO-lock equivalent).
  perform pg_advisory_xact_lock(hashtext(p_request_id::text));

  select * into v_req from public.reservation_requests where id = p_request_id for update;
  if v_req.status = 'booked' then
    raise exception 'request_already_booked';
  end if;

  select * into v_user from public.users where id = v_req.user_id for update;

  v_use_free := not v_user.free_credit_used;
  if not v_use_free and v_user.credit_balance < 1 then
    raise exception 'insufficient_credits';
  end if;

  insert into public.bookings (
    user_id, reservation_request_id, restaurant_name, platform,
    date, time, party_size, confirmation_number, status, credit_used
  ) values (
    v_req.user_id, v_req.id, v_req.restaurant_name, v_req.platform,
    p_booked_date, p_booked_time, p_party_size, p_confirmation, 'confirmed',
    not v_use_free
  ) returning * into v_booking;

  if v_use_free then
    update public.users set free_credit_used = true, updated_at = now()
      where id = v_user.id;
    insert into public.credit_transactions (user_id, type, amount, reason, booking_id)
      values (v_user.id, 'booking_success', 0,
              'First successful booking — free', v_booking.id);
  else
    update public.users set credit_balance = credit_balance - 1, updated_at = now()
      where id = v_user.id;
    insert into public.credit_transactions (user_id, type, amount, reason, booking_id)
      values (v_user.id, 'booking_success', -1,
              'Successful booking at ' || v_req.restaurant_name, v_booking.id);
  end if;

  update public.reservation_requests
    set status = 'booked', auto_book_enabled = false,
        next_check_at = null, updated_at = now()
    where id = v_req.id;

  return v_booking;
end;
$$;

-- =====================================================================
-- Auto-provision a profile + signup bonus when a new auth user is created
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  insert into public.connected_accounts (user_id, provider) values (new.id, 'resy');
  insert into public.connected_accounts (user_id, provider) values (new.id, 'opentable');
  insert into public.credit_transactions (user_id, type, amount, reason)
    values (new.id, 'signup_bonus', 1, 'Welcome — your first booking is free');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security — every table scoped to the owning user
-- =====================================================================
alter table public.users                 enable row level security;
alter table public.connected_accounts     enable row level security;
alter table public.reservation_requests   enable row level security;
alter table public.bookings                enable row level security;
alter table public.credit_transactions     enable row level security;
alter table public.booking_attempts        enable row level security;
alter table public.concierge_messages      enable row level security;
alter table public.notifications           enable row level security;

create policy "own profile"  on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own accounts" on public.connected_accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own requests" on public.reservation_requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "own txns"     on public.credit_transactions
  for select using (auth.uid() = user_id);

create policy "own attempts" on public.booking_attempts
  for select using (
    exists (select 1 from public.reservation_requests r
            where r.id = reservation_request_id and r.user_id = auth.uid())
  );

create policy "own messages" on public.concierge_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own notifs"   on public.notifications
  for select using (auth.uid() = user_id);

-- Note: the booking worker uses the service-role key, which bypasses RLS, to
-- write bookings / attempts / notifications and to call book_reservation().
