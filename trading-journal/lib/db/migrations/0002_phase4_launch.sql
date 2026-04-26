alter table users add column if not exists onboarded_at timestamptz;

alter table users enable row level security;
alter table accounts enable row level security;
alter table trades enable row level security;
alter table goals enable row level security;
alter table strategy_tags enable row level security;
alter table checklist_items enable row level security;

create policy "Users can read own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Users can manage own accounts" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own trades" on trades
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own goals" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own strategy tags" on strategy_tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own checklist" on checklist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
