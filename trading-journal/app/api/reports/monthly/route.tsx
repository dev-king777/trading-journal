import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { NextResponse } from "next/server";

import { MonthlyReportDocument } from "@/lib/reports/monthly-report";
import { getCurrentAccount, getTrades } from "@/lib/trades/queries";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getRuleBasedInsight } from "@/lib/insights/rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [account, trades, user] = await Promise.all([getCurrentAccount(), getTrades(), getCurrentUser()]);

  if (!account) {
    return NextResponse.json({ error: "Create an account before exporting reports." }, { status: 400 });
  }

  const month = format(new Date(), "MMMM yyyy");
  const insight = getRuleBasedInsight(trades);

  const stream = await pdf(
    <MonthlyReportDocument month={month} name={user.name} account={account} trades={trades} insight={insight} />
  ).toBuffer();

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="edgejournal-${format(new Date(), "yyyy-MM")}.pdf"`
    }
  });
}
