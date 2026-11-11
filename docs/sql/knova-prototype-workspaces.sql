-- Already applied and verified by the owner on CHG_Prevent.
-- Reference only: do NOT rerun against the existing table/policies.
create table public.knova_prototype_workspaces (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  state_version integer not null default 4 check (state_version = 4),
  updated_at timestamptz not null default now()
);
comment on table public.knova_prototype_workspaces is 'Account-owned fictional Knova prototype workspace only. Not a production clinical record.';
alter table public.knova_prototype_workspaces enable row level security;
revoke all on table public.knova_prototype_workspaces from anon;
grant select, insert, update on table public.knova_prototype_workspaces to authenticated;
create policy "Read own prototype workspace" on public.knova_prototype_workspaces for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own prototype workspace" on public.knova_prototype_workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own prototype workspace" on public.knova_prototype_workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);