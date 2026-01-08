begin;

with recursive published as (
  select id, started_at::date as challenge_day
  from public.challenges
  where started_at is not null
    and id >= 74
),
calendar as (
  select
    p1.id,
    p1.challenge_day,
    (
      select max(p2.challenge_day)
      from published p2
      where p2.challenge_day < p1.challenge_day
    ) as prev_challenge_day
  from published p1
),
completions as (
  select
    cc.player,
    cc.challenge,
    cal.challenge_day,
    cal.prev_challenge_day,
    cc.created_at,
    co.opened_at
  from public.challenges_completed cc
  join calendar cal on cal.id = cc.challenge
  left join public.challenges_opened co
    on co.player = cc.player
   and co.challenge_id = cc.challenge
),
ordered as (
  select *,
    row_number() over (partition by player order by challenge_day, challenge) as rn
  from completions
),
recur as (
  select
    player,
    challenge,
    challenge_day,
    prev_challenge_day,
    created_at,
    opened_at,
    1 as current_streak,
    0 as streak_bonus,
    case
      when opened_at is not null
       and extract(epoch from (created_at - opened_at)) <= 60 then 1
      else 0
    end as fast_bonus,
    1 as base_points,
    1 +
    case
      when opened_at is not null
       and extract(epoch from (created_at - opened_at)) <= 60 then 1
      else 0
    end as points,
    rn
  from ordered
  where rn = 1

  union all

  select
    o.player,
    o.challenge,
    o.challenge_day,
    o.prev_challenge_day,
    o.created_at,
    o.opened_at,
    case
      when r.challenge_day = o.prev_challenge_day then r.current_streak + 1
      else 1
    end as current_streak,
    case
      when r.challenge_day = o.prev_challenge_day then 1
      else 0
    end as streak_bonus,
    case
      when o.opened_at is not null
       and extract(epoch from (o.created_at - o.opened_at)) <= 60 then 1
      else 0
    end as fast_bonus,
    1 as base_points,
    1 +
    case when r.challenge_day = o.prev_challenge_day then 1 else 0 end +
    case
      when o.opened_at is not null
       and extract(epoch from (o.created_at - o.opened_at)) <= 60 then 1
      else 0
    end as points,
    o.rn
  from ordered o
  join recur r
    on r.player = o.player
   and o.rn = r.rn + 1
),
expected as (
  select
    player,
    sum(points) as expected_points
  from recur
  group by player
),
last_state as (
  select distinct on (player)
    player,
    current_streak as expected_streak,
    challenge_day as last_played,
    created_at as updated_at,
    case
      when opened_at is not null
       and extract(epoch from (created_at - opened_at)) <= 60 then true
      else false
    end as fast_bonus_awarded
  from recur
  order by player, challenge_day desc, challenge desc
),
upsert as (
  insert into public.season_scores (
    player,
    season_points,
    current_streak,
    last_played,
    last_bonus_day,
    fast_bonus_awarded,
    missed_in_a_row,
    updated_at
  )
  select
    e.player,
    e.expected_points,
    ls.expected_streak,
    ls.last_played,
    case when ls.expected_streak > 1 then ls.expected_streak else 0 end,
    ls.fast_bonus_awarded,
    0,
    ls.updated_at
  from expected e
  join last_state ls on ls.player = e.player
  on conflict (player) do update
  set
    season_points = excluded.season_points,
    current_streak = excluded.current_streak,
    last_played = excluded.last_played,
    last_bonus_day = excluded.last_bonus_day,
    fast_bonus_awarded = excluded.fast_bonus_awarded,
    missed_in_a_row = 0,
    updated_at = excluded.updated_at
  returning player
)
update public.season_scores
set
  season_points = 0,
  current_streak = 0,
  last_played = null,
  last_bonus_day = 0,
  fast_bonus_awarded = false,
  missed_in_a_row = 0,
  updated_at = now()
where player not in (select player from expected);

commit;
