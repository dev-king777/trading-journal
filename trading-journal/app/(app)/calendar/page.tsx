import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateCalendarData } from "@/lib/stats/engine";
import { getTrades } from "@/lib/trades/queries";

export default async function CalendarPage() {
  const trades = await getTrades();
  const calendarData = calculateCalendarData(trades);

  return (
    <div className="space-y-6">
      <div>
        <Badge>Calendar</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Calendar heatmap</h1>
        <p className="mt-2 text-muted-foreground">Daily P&L by close date for the active account.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Monthly performance</CardTitle></CardHeader>
        <CardContent>
          <CalendarHeatmap data={calendarData} />
          <p className="mt-4 text-sm text-muted-foreground">Green profit, red loss, gold breakeven, gray no trades.</p>
        </CardContent>
      </Card>
    </div>
  );
}
