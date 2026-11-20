-- Applied to the connected HMS Pro Supabase project.
-- Daily bazar purchase ledger and resident meal advance ledger.
create table if not exists public.daily_bazar (
 id uuid primary key default gen_random_uuid(), hostel_id uuid not null references public.hostels(id) on delete cascade,
 bazar_date date not null default current_date, item_name text not null check(length(trim(item_name)) between 2 and 160),
 category text not null default 'Groceries', quantity numeric(12,2) not null default 1 check(quantity > 0),
 unit text not null default 'pcs', amount numeric(12,2) not null check(amount > 0), purchased_by text, notes text,
 created_by uuid references auth.users(id), created_at timestamptz not null default now());
create table if not exists public.meal_advances (
 id uuid primary key default gen_random_uuid(), hostel_id uuid not null references public.hostels(id) on delete cascade,
 resident_id uuid not null, payment_date date not null default current_date, amount numeric(12,2) not null check(amount > 0),
 payment_method text not null default 'Cash', reference text, notes text, received_by uuid references auth.users(id), created_at timestamptz not null default now(),
 constraint meal_advances_resident_hostel_fk foreign key(resident_id,hostel_id) references public.residents(id,hostel_id) on delete cascade);
create index if not exists daily_bazar_hostel_date_idx on public.daily_bazar(hostel_id,bazar_date desc);
create index if not exists meal_advances_hostel_resident_date_idx on public.meal_advances(hostel_id,resident_id,payment_date desc);
alter table public.daily_bazar enable row level security; alter table public.meal_advances enable row level security;
grant select,insert,update,delete on public.daily_bazar,public.meal_advances to authenticated;
create policy "members read bazar" on public.daily_bazar for select to authenticated using(private.is_hostel_member(hostel_id));
create policy "managers insert bazar" on public.daily_bazar for insert to authenticated with check(private.has_hostel_role(hostel_id,array['owner'::public.member_role,'manager'::public.member_role,'accountant'::public.member_role]));
create policy "managers update bazar" on public.daily_bazar for update to authenticated using(private.has_hostel_role(hostel_id,array['owner'::public.member_role,'manager'::public.member_role,'accountant'::public.member_role])) with check(private.has_hostel_role(hostel_id,array['owner'::public.member_role,'manager'::public.member_role,'accountant'::public.member_role]));
create policy "managers delete bazar" on public.daily_bazar for delete to authenticated using(private.has_hostel_role(hostel_id,array['owner'::public.member_role,'manager'::public.member_role]));
create policy "members read meal advances" on public.meal_advances for select to authenticated using(private.is_hostel_member(hostel_id));
create policy "finance roles insert meal advances" on public.meal_advances for insert to authenticated with check(private.has_hostel_role(hostel_id,array['owner'::public.member_role,'manager'::public.member_role,'accountant'::public.member_role]));
create policy "finance roles update meal advances" on public.meal_advances for update to authenticated using(private.has_hostel_role(hostel_id,array['owner'::public.member_role,'manager'::public.member_role,'accountant'::public.member_role])) with check(private.has_hostel_role(hostel_id,array['owner'::public.member_role,'manager'::public.member_role,'accountant'::public.member_role]));
create policy "finance roles delete meal advances" on public.meal_advances for delete to authenticated using(private.has_hostel_role(hostel_id,array['owner'::public.member_role,'manager'::public.member_role]));
