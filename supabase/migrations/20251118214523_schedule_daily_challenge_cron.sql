-- Enables HTTP + cron extensions so Postgres can call the edge function on a schedule.
create extension if not exists "pg_net" with schema "extensions";
create extension if not exists "pg_cron";

create table if not exists "public"."daily_challenge_schedule" (
  "challenge_day" date primary key,
  "scheduled_run_at" timestamptz,
  "triggered_at" timestamptz,
  "challenge_id" bigint references public.challenges(id) on delete cascade
);

create or replace function "public"."run_schedule_daily_challenge"()
returns void
language plpgsql
security definer
set search_path = extensions, public
as $$
declare
  SCHEDULE_DAILY_CHALLENGE_URL text;
  SUPABASE_SERVICE_ROLE_KEY text;
begin
  select decrypted_secret
    into SCHEDULE_DAILY_CHALLENGE_URL
    from vault.decrypted_secrets
   where name = 'SCHEDULE_DAILY_CHALLENGE_URL';

  select decrypted_secret
    into SUPABASE_SERVICE_ROLE_KEY
    from vault.decrypted_secrets
   where name = 'SUPABASE_SERVICE_ROLE_KEY';

   perform net.http_post(
     url := SCHEDULE_DAILY_CHALLENGE_URL,
     headers := jsonb_build_object(
       'Authorization', 'Bearer ' || SUPABASE_SERVICE_ROLE_KEY,
       'Content-Type', 'application/json'
     )
   );
end;
$$;

comment on function "public"."run_schedule_daily_challenge" is
  'Invokes the schedule-daily-challenge Next API route via pg_net. Requires vault secrets SCHEDULE_DAILY_CHALLENGE_URL & SUPABASE_SERVICE_ROLE_KEY.';

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
