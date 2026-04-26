import { NextResponse } from "next/server";

import { calculateProjection } from "@/lib/stats/projections";
import { getTrades } from "@/lib/trades/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(calculateProjection(await getTrades(), 30));
}
