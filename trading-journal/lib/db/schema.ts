import {
  boolean,
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", ["personal"]);
export const tradeDirectionEnum = pgEnum("trade_direction", ["buy", "sell"]);
export const tradeSessionEnum = pgEnum("trade_session", ["asian", "london", "ny", "overlap"]);
export const tradeResultEnum = pgEnum("trade_result", ["win", "loss", "breakeven", "open"]);
export const goalTypeEnum = pgEnum("goal_type", ["daily", "weekly", "monthly"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  name: varchar("name", { length: 100 }).notNull(),
  avatarUrl: text("avatar_url"),
  timezone: varchar("timezone", { length: 50 }).notNull().default("UTC"),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  approved: boolean("approved").notNull().default(false),
  approvalToken: text("approval_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  type: accountTypeEnum("type").notNull().default("personal"),
  startingBalance: decimal("starting_balance", { precision: 12, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  maxDrawdownRule: decimal("max_drawdown_rule", { precision: 5, scale: 2 }),
  dailyLossRule: decimal("daily_loss_rule", { precision: 5, scale: 2 }),
  profitTarget: decimal("profit_target", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id"),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  pair: varchar("pair", { length: 20 }).notNull(),
  direction: tradeDirectionEnum("direction").notNull(),
  entryPrice: decimal("entry_price", { precision: 18, scale: 6 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 18, scale: 6 }),
  stopLoss: decimal("stop_loss", { precision: 18, scale: 6 }),
  takeProfit: decimal("take_profit", { precision: 18, scale: 6 }),
  lotSize: decimal("lot_size", { precision: 12, scale: 2 }).notNull(),
  riskPercent: decimal("risk_percent", { precision: 7, scale: 2 }).notNull(),
  riskRewardRatio: decimal("risk_reward_ratio", { precision: 7, scale: 2 }).notNull(),
  openTime: timestamp("open_time", { withTimezone: true }).notNull(),
  closeTime: timestamp("close_time", { withTimezone: true }),
  session: tradeSessionEnum("session").notNull(),
  result: tradeResultEnum("result").notNull().default("open"),
  pnlAmount: decimal("pnl_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  calculatedPnlAmount: decimal("calculated_pnl_amount", { precision: 12, scale: 2 }),
  manualPnlAmount: decimal("manual_pnl_amount", { precision: 12, scale: 2 }),
  pnlPips: decimal("pnl_pips", { precision: 12, scale: 2 }).notNull().default("0"),
  pnlPercent: decimal("pnl_percent", { precision: 7, scale: 2 }).notNull().default("0"),
  commission: decimal("commission", { precision: 12, scale: 4 }).default("0"),
  swap: decimal("swap", { precision: 12, scale: 4 }).default("0"),
  strategyTags: text("strategy_tags").array().notNull().default([]),
  notes: text("notes"),
  screenshotUrl: text("screenshot_url"),
  emotionalState: varchar("emotional_state", { length: 50 }),
  mistakes: text("mistakes").array().notNull().default([]),
  checklistPassed: boolean("checklist_passed").notNull().default(false),
  isBacktest: boolean("is_backtest").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  type: goalTypeEnum("type").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }),
  lossLimitAmount: decimal("loss_limit_amount", { precision: 12, scale: 2 }),
  targetPercent: decimal("target_percent", { precision: 7, scale: 2 }),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  achieved: boolean("achieved").notNull().default(false)
});

export const strategyTags = pgTable("strategy_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  description: text("description")
});

export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 200 }).notNull(),
  order: integer("order").notNull()
});

export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
