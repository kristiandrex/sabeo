-- Enables HTTP + cron extensions so Postgres can call the edge function on a schedule.
create extension if not exists "pg_net" with schema "extensions";
create extension if not exists "pg_cron";

create table if not exists "public"."daily_challenge_schedule" (
  "challenge_day" date primary key,
  "scheduled_run_at" timestamptz not null,
  "triggered_at" timestamptz,
  "challenge_id" bigint references public.challenges(id)
);

create or replace function "public"."run_schedule_daily_challenge"()
returns void
language plpgsql
security definer
set search_path = extensions, public
as $$
declare
  EDGE_FUNCTION_URL text;
  SERVICE_ROLE_KEY text;
begin
  select decrypted_secret
    into EDGE_FUNCTION_URL
    from vault.decrypted_secrets
   where name = 'EDGE_FUNCTION_URL';

  select decrypted_secret
    into SERVICE_ROLE_KEY
    from vault.decrypted_secrets
   where name = 'SERVICE_ROLE_KEY';

  perform net.http_post(
    url := EDGE_FUNCTION_URL,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || SERVICE_ROLE_KEY
    )
  );
end;
$$;

comment on function "public"."run_schedule_daily_challenge" is
  'Invokes the schedule-daily-challenge Edge Function via pg_net. Requires vault secrets EDGE_FUNCTION_URL & SERVICE_ROLE_KEY.';

do $$
begin
  perform cron.unschedule('schedule-daily-challenge');
exception
  when others then
    null;
end;
$$;

select cron.schedule(
  'schedule-daily-challenge',
  '*/10 13-21 * * *',
  $$ select public.run_schedule_daily_challenge(); $$
);
