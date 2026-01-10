alter table public.daily_challenge_schedule
  add column message text not null
  default 'Descubre la palabra del día';
