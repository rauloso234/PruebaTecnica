create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 120 and name ~ '[^[:space:]]'),
  company text check (char_length(company) <= 120),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 30),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  unique (user_id, id)
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id uuid not null,
  title text not null check (char_length(title) <= 160 and title ~ '[^[:space:]]'),
  description text check (char_length(description) <= 2000),
  amount numeric(12, 2) not null check (amount between 0 and 999999999.99),
  status text not null check (status in ('new', 'qualified', 'proposal', 'won', 'lost')),
  expected_close_date date check (isfinite(expected_close_date)),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint opportunities_owned_client_fk
    foreign key (user_id, client_id) references public.clients(user_id, id)
    on delete restrict on update restrict
);

create index opportunities_user_client_idx on public.opportunities (user_id, client_id);
create index opportunities_user_status_idx on public.opportunities (user_id, status);

create function public.crm_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := greatest(clock_timestamp(), old.updated_at + interval '1 microsecond');
  return new;
end;
$$;

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.crm_set_updated_at();

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.crm_set_updated_at();

revoke all on function public.crm_set_updated_at() from public, anon, authenticated;

alter table public.clients enable row level security;
alter table public.opportunities enable row level security;

revoke all on public.clients, public.opportunities from public, anon, authenticated;
grant select, delete on public.clients, public.opportunities to authenticated;
grant insert (name, company, email, phone, notes),
      update (name, company, email, phone, notes)
on public.clients to authenticated;
grant insert (client_id, title, description, amount, status, expected_close_date),
      update (client_id, title, description, amount, status, expected_close_date)
on public.opportunities to authenticated;

create policy clients_select_own on public.clients
for select to authenticated using ((select auth.uid()) = user_id);
create policy clients_insert_own on public.clients
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy clients_update_own on public.clients
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy clients_delete_own on public.clients
for delete to authenticated using ((select auth.uid()) = user_id);

create policy opportunities_select_own on public.opportunities
for select to authenticated using ((select auth.uid()) = user_id);
create policy opportunities_insert_own on public.opportunities
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy opportunities_update_own on public.opportunities
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy opportunities_delete_own on public.opportunities
for delete to authenticated using ((select auth.uid()) = user_id);
