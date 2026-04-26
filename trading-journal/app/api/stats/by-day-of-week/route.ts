import { NextResponse } from "next/server";

import { calculateByDayOfWeek } from "@/lib/stats/engine";
import { getTrades } from "@/lib/trades/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(calculateByDayOfWeek(await getTrades()));
}
