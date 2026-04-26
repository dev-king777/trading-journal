import Link from "next/link";
import { Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function InsightBanner({ insight }: { insight: string }) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <div className="font-medium text-primary">Insight</div>
            <p className="mt-1 text-sm text-muted-foreground">{insight}</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/insights">Open insights</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
