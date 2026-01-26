create or replace function get_challenge_number(challenge_started_at timestamptz)
returns integer as $$
  select count(*)::integer
  from challenges
  where started_at is not null
    and started_at <= challenge_started_at;
$$ language sql stable;

comment on function get_challenge_number is
  'Returns the sequential challenge number based on started_at timestamp.';

create or replace function get_user_challenge_history(
  p_player uuid,
  p_offset integer,
  p_limit integer
)
returns table (
  challenge_id bigint,
  started_at timestamptz,
  status text,
  challenge_number bigint,
  total_count bigint
)
language sql
stable
as $$
  with all_challenges_numbered as (
    select
      id,
      started_at,
      row_number() over (order by started_at asc, created_at asc) as challenge_number
    from challenges
    where started_at is not null
  ),
  user_challenges as (
    select challenge, true as completed
    from challenges_completed
    where player = p_player

    union

    select challenge, false as completed
    from attempts
    where player = p_player
  ),
  dedup as (
    select challenge, bool_or(completed) as completed
    from user_challenges
    group by challenge
  ),
  ordered as (
    select
      acn.id as challenge_id,
      acn.started_at,
      case
        when dedup.completed then 'completed'
        else 'played'
      end as status,
      acn.challenge_number
    from dedup
    join all_challenges_numbered acn on acn.id = dedup.challenge
    order by acn.started_at desc
  )
  select
    ordered.challenge_id,
    ordered.started_at,
    ordered.status,
    ordered.challenge_number,
    count(*) over () as total_count
  from ordered
  offset p_offset
  limit p_limit;
$$;

comment on function get_user_challenge_history is
  'Returns paginated challenge history for a player with status and number.';
