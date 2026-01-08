-- Updates the cron helper to schedule and start the daily challenge in one run.
create or replace function "public"."run_schedule_daily_challenge"()
returns void
language plpgsql
security definer
set search_path = extensions, public
as $$
declare
  SCHEDULE_DAILY_CHALLENGE_URL text;
  START_CHALLENGE_URL text;
  SUPABASE_SERVICE_ROLE_KEY text;
  schedule_row record;
begin
  select decrypted_secret
    into SCHEDULE_DAILY_CHALLENGE_URL
    from vault.decrypted_secrets
   where name = 'SCHEDULE_DAILY_CHALLENGE_URL';

  select decrypted_secret
    into START_CHALLENGE_URL
    from vault.decrypted_secrets
   where name = 'START_CHALLENGE_URL';

  select decrypted_secret
    into SUPABASE_SERVICE_ROLE_KEY
    from vault.decrypted_secrets
   where name = 'SUPABASE_SERVICE_ROLE_KEY';

  select
    challenge_day,
    scheduled_run_at,
    triggered_at
    into schedule_row
    from public.daily_challenge_schedule
   where challenge_day = current_date;

  if schedule_row is null then
    perform net.http_post(
      url := SCHEDULE_DAILY_CHALLENGE_URL,
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type', 'application/json'
      )
    );
  else
    if schedule_row.scheduled_run_at is not null
      and schedule_row.triggered_at is null
      and schedule_row.scheduled_run_at <= now() then
      perform net.http_post(
        url := START_CHALLENGE_URL,
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type', 'application/json'
        )
      );
    end if;
  end if;
end;
$$;

comment on function "public"."run_schedule_daily_challenge" is
  'Invokes schedule-daily-challenge then start-challenge via pg_net. Requires vault secrets SCHEDULE_DAILY_CHALLENGE_URL, START_CHALLENGE_URL & SUPABASE_SERVICE_ROLE_KEY.';
