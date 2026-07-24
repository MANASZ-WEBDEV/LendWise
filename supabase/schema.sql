-- LendWise PostgreSQL / Supabase Database Schema DDL
-- Run this script in your Supabase project's SQL Editor

-- 1. ENUMS
create type balance_direction as enum ('lent', 'borrowed');
create type transaction_type as enum ('loan', 'repayment', 'rate_change');

-- 2. TABLES

-- People table (supports soft-delete via archived_at)
create table people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  notes text,
  archived_at timestamptz default null,
  created_at timestamptz not null default now()
);

-- Balances table (1 row per person per direction)
create table balances (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  direction balance_direction not null,
  principal numeric(14,2) not null default 0,
  outstanding_interest numeric(14,2) not null default 0,
  current_rate numeric(6,3) not null, -- monthly % rate e.g. 1.500
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (person_id, direction)
);

-- Rate History table (denormalized user_id for faster RLS)
create table rate_history (
  id uuid primary key default gen_random_uuid(),
  balance_id uuid not null references balances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rate numeric(6,3) not null,
  effective_from date not null,
  created_at timestamptz not null default now()
);

-- Transactions table (immutable audit ledger)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  balance_id uuid not null references balances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type transaction_type not null,
  amount numeric(14,2), -- null for rate_change
  new_rate numeric(6,3), -- only for rate_change
  date date not null, -- effective date (supports backdating)
  interest_applied numeric(14,2), -- only for repayment
  principal_applied numeric(14,2), -- only for repayment
  notes text,
  created_at timestamptz not null default now()
);

-- 3. INDEXES
create index idx_people_user on people(user_id) where archived_at is null;
create index idx_balances_person on balances(person_id);
create index idx_balances_user on balances(user_id);
create index idx_transactions_balance_date on transactions(balance_id, date, created_at);
create index idx_rate_history_balance on rate_history(balance_id, effective_from);

-- 4. ROW-LEVEL SECURITY (RLS)
alter table people enable row level security;
alter table balances enable row level security;
alter table rate_history enable row level security;
alter table transactions enable row level security;

create policy "Users can manage their own people" on people
  for all using (auth.uid() = user_id);

create policy "Users can manage their own balances" on balances
  for all using (auth.uid() = user_id);

create policy "Users can manage their own rate history" on rate_history
  for all using (auth.uid() = user_id);

create policy "Users can manage their own transactions" on transactions
  for all using (auth.uid() = user_id);
