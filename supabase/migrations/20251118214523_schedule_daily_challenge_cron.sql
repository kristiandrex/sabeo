-- Enables HTTP + cron extensions so Postgres can call the edge function on a schedule.
create extension if not exists "pg_net" with schema "extensions";
create extension if not exists "pg_cron" with schema "extensions";

-- Namespace for cron helpers to avoid polluting public schema.
create schema if not exists "jobs";

create or replace function "jobs"."run_schedule_daily_challenge"()
returns void
language plpgsql
security definer
set search_path = extensions, public
as $$
declare
  project_url text;
  service_role_key text;
  function_url text;
begin
  select decrypted_secret
    into project_url
    from vault.decrypted_secrets
   where name = 'project_url';

  if coalesce(project_url, '') = '' then
    raise exception 'Missing vault secret project_url';
  end if;

  select decrypted_secret
    into service_role_key
    from vault.decrypted_secrets
   where name = 'service_role_key';

  if coalesce(service_role_key, '') = '' then
    raise exception 'Missing vault secret service_role_key';
  end if;

  function_url := rtrim(project_url, '/') || '/functions/v1/schedule-daily-challenge';

  perform net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object('source', 'pg_cron')
  );
end;
$$;

comment on function "jobs"."run_schedule_daily_challenge" is
  'Invokes the schedule-daily-challenge Edge Function via pg_net. Requires vault secrets project_url & service_role_key.';

-- Drop any existing cron job so re-running the migration is idempotent.
do $$
begin
  perform cron.unschedule('schedule-daily-challenge');
exception
  when undefined_function then
    -- pg_cron not available yet; ignore.
    null;
  when others then
    null;
end;
$$;

select
  cron.schedule(
    'schedule-daily-challenge',
    '0 12 * * *',
    $$ select jobs.run_schedule_daily_challenge(); $$
  );
