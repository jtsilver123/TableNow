alter table public.reservation_requests
  add column if not exists provider_venue_id text;
