create table if not exists public.season_scores (
  player uuid primary key,
  season_points integer not null default 0,
  current_streak integer not null default 0,
  last_played date,
  last_bonus_day integer not null default 0,
  fast_bonus_awarded boolean not null default false,
  missed_in_a_row integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.season_scores is 'Total points per player for the current ranking season.';

create table if not exists public.challenge_sessions (
  player uuid not null,
  challenge_id bigint not null,
  opened_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint challenge_sessions_pkey primary key (player, challenge_id)
);

comment on table public.challenge_sessions is 'Tracks when a player first opened a daily challenge.';

-- Poblar season_scores con jugadores existentes (sin season_id)
insert into public.season_scores (player)
select distinct player
from public.challenges_completed
on conflict (player) do nothing;

-- Funciones auxiliares

create or replace function public.register_challenge_open(p_player uuid, p_challenge bigint)
returns void
language plpgsql
as $$
begin
  insert into public.challenge_sessions (player, challenge_id, opened_at)
  values (p_player, p_challenge, now())
  on conflict (player, challenge_id) do nothing;
end;
$$;

comment on function public.register_challenge_open(uuid, bigint) is 'Stores the first time a player opens the challenge.';

create or replace function public.award_season_points_trigger()
returns trigger
language plpgsql
as $$
declare
  v_season_row public.season_scores%rowtype;
  v_points integer := 1;
  v_bonus integer := 0;
  v_fast_bonus boolean := false;
  v_granted_bonus boolean := false;
  v_opened_at timestamptz;
  v_played_date date := new.created_at::date;
begin
  select *
  into v_season_row
  from public.season_scores
  where player = new.player
  for update;

  if not found then
    insert into public.season_scores (player)
    values (new.player)
    returning * into v_season_row;
  end if;

  select opened_at
  into v_opened_at
  from public.challenge_sessions
  where player = new.player
    and challenge_id = new.challenge;

  if v_opened_at is not null
     and extract(epoch from (new.created_at - v_opened_at)) <= 60 then
    v_fast_bonus := true;
    v_bonus := v_bonus + 1;
  end if;

  if v_season_row.last_played = v_played_date - 1 then
    v_season_row.current_streak := v_season_row.current_streak + 1;
    if v_season_row.current_streak > 0 and v_season_row.last_bonus_day <> v_season_row.current_streak then
      v_bonus := v_bonus + 1;
      v_granted_bonus := true;
    end if;
  else
    v_season_row.current_streak := 1;
    v_granted_bonus := false;
    v_season_row.last_bonus_day := 0;
  end if;

  update public.season_scores
  set
    season_points = season_points + v_points + v_bonus,
    current_streak = v_season_row.current_streak,
    last_played = v_played_date,
    last_bonus_day = case
      when v_granted_bonus then v_season_row.current_streak
      when v_season_row.current_streak = 1 then 0
      else last_bonus_day
    end,
    fast_bonus_awarded = v_fast_bonus,
    missed_in_a_row = 0,
    updated_at = new.created_at
  where player = new.player;

  return new;
end;
$$;

comment on function public.award_season_points_trigger() is 'Trigger that assigns points for the daily ranking.';

create or replace function public.apply_inactivity_penalties(p_reference_date date default current_date)
returns void
language plpgsql
as $$
declare
  v_row record;
  v_ref date := coalesce(p_reference_date, current_date);
  v_missed integer;
  v_penalty integer;
begin
  for v_row in
    select player, last_played, missed_in_a_row, season_points
    from public.season_scores
  loop
    if v_row.last_played is null or v_row.last_played < (v_ref - 1) then
      v_missed := v_row.missed_in_a_row + 1;
      v_penalty := case when v_missed > 3 then 1 else 0 end;

      update public.season_scores
      set
        missed_in_a_row = v_missed,
        current_streak = 0,
        fast_bonus_awarded = false,
        season_points = greatest(0, season_points - v_penalty),
        updated_at = now()
      where player = v_row.player;
    end if;
  end loop;
end;
$$;

comment on function public.apply_inactivity_penalties(date) is 'Subtracts points once a player misses 4+ challenges in a row.';

create or replace function public.get_active_season_ranking()
returns table (
  player uuid,
  season_points integer,
  current_streak integer,
  fast_bonus_awarded boolean,
  missed_in_a_row integer
)
language sql
as $$
  select player, season_points, current_streak, fast_bonus_awarded, missed_in_a_row
  from public.season_scores
  order by season_points desc, current_streak desc, updated_at asc;
$$;

comment on function public.get_active_season_ranking() is 'Primary ranking query based on season_scores.';

drop trigger if exists award_season_points_trigger on public.challenges_completed;

create trigger award_season_points_trigger
after insert on public.challenges_completed
for each row
execute function public.award_season_points_trigger();
