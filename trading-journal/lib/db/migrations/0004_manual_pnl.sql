ALTER TABLE trades ADD COLUMN IF NOT EXISTS calculated_pnl_amount DECIMAL(12, 2);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS manual_pnl_amount DECIMAL(12, 2);
