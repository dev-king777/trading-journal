create type account_type as enum ('personal');
create type trade_direction as enum ('buy', 'sell');
create type trade_session as enum ('asian', 'london', 'ny', 'overlap');
create type trade_result as enum ('win', 'loss', 'breakeven', 'open');
create type goal_type as enum ('weekly', 'monthly');

create table users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique not null,
  password_hash varchar(255),
  name varchar(100) not null,
  avatar_url text,
  timezone varchar(50) not null default 'UTC',
  currency varchar(3) not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name varchar(100) not null,
  type account_type not null default 'personal',
  starting_balance numeric(12, 2) not null,
  current_balance numeric(12, 2) not null,
  currency varchar(3) not null default 'USD',
  max_drawdown_rule numeric(5, 2),
  daily_loss_rule numeric(5, 2),
  profit_target numeric(5, 2),
  created_at timestamptz not null default now()
);

create table trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  pair varchar(20) not null,
  direction trade_direction not null,
  entry_price numeric(18, 6) not null,
  exit_price numeric(18, 6),
  stop_loss numeric(18, 6) not null,
  take_profit numeric(18, 6) not null,
  lot_size numeric(12, 2) not null,
  risk_percent numeric(7, 2) not null,
  risk_reward_ratio numeric(7, 2) not null,
  open_time timestamptz not null,
  close_time timestamptz,
  session trade_session not null,
  result trade_result not null default 'open',
  pnl_amount numeric(12, 2) not null default 0,
  pnl_pips numeric(12, 2) not null default 0,
  pnl_percent numeric(7, 2) not null default 0,
  strategy_tags text[] not null default '{}',
  notes text,
  screenshot_url text,
  emotional_state varchar(50),
  mistakes text[] not null default '{}',
  checklist_passed boolean not null default false,
  is_backtest boolean not null default false,
  created_at timestamptz not null default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  type goal_type not null,
  target_amount numeric(12, 2),
  target_percent numeric(7, 2),
  period_start date not null,
  period_end date not null,
  achieved boolean not null default false
);

create table strategy_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name varchar(50) not null,
  color varchar(7) not null,
  description text
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label varchar(200) not null,
  "order" integer not null
);
