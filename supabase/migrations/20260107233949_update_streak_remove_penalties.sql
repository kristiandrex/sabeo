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
  v_previous_published_date date;
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
  from public.challenges_opened
  where player = new.player
    and challenge_id = new.challenge;

  if v_opened_at is not null
     and extract(epoch from (new.created_at - v_opened_at)) <= 60 then
    v_fast_bonus := true;
    v_bonus := v_bonus + 1;
  end if;

  select max(started_at)::date
  into v_previous_published_date
  from public.challenges
  where started_at is not null
    and started_at::date < v_played_date;

  if v_season_row.last_played = v_previous_published_date then
    v_season_row.current_streak := v_season_row.current_streak + 1;
    if v_season_row.current_streak > 0
       and v_season_row.last_bonus_day <> v_season_row.current_streak then
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

comment on function public.award_season_points_trigger() is
  'Trigger that assigns points for the daily ranking and preserves streaks across missing challenge days.';

drop function if exists public.apply_inactivity_penalties(date);
