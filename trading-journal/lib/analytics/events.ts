export const analyticsEvents = {
  signup: "signup",
  firstTrade: "first_trade",
  goalSet: "goal_set",
  aiInsightViewed: "ai_insight_viewed",
  upgradeClicked: "upgrade_clicked"
} as const;

export type AnalyticsEvent = (typeof analyticsEvents)[keyof typeof analyticsEvents];
