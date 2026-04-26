import { z } from "zod";

export const tradeFormSchema = z.object({
  pair: z.string().min(1, "Select an asset."),
  direction: z.enum(["buy", "sell"]),
  entryPrice: z.coerce.number().positive("Entry must be positive."),
  exitPrice: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.number().positive().optional()),
  manualPnlAmount: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.number().optional()),
  screenshotUrl: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  stopLoss: z.coerce.number().positive("Stop loss must be positive."),
  takeProfit: z.coerce.number().positive("Take profit must be positive."),
  lotSize: z.coerce.number().positive("Position size must be positive."),
  openTime: z.string().min(1, "Open time is required."),
  closeTime: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  strategyTags: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  notes: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  emotionalState: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  mistakes: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  checklistPassed: z.coerce.boolean().optional(),
  isBacktest: z.coerce.boolean().optional()
}).superRefine((value, context) => {
  const closingTrade = value.exitPrice !== undefined || value.closeTime !== undefined;
  if (closingTrade && value.manualPnlAmount === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["manualPnlAmount"],
      message: "Enter the broker P&L manually for closed trades."
    });
  }
});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;
export type TradeFormInput = z.input<typeof tradeFormSchema>;

export const assets = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD", "ETHUSD", "NAS100", "US30"];
export const emotions = ["confident", "anxious", "greedy", "fearful", "calm", "focused"];
export const strategyTagOptions = ["Breakout", "FVG", "Liquidity Grab", "Order Block", "Reversal", "NY Continuation"];
export const mistakeOptions = ["FOMO", "moved SL", "no plan", "overleveraged", "revenge trade", "late entry"];
