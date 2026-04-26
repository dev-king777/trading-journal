import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <Card className="max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-6 h-3 w-3 rounded-full bg-primary shadow-[0_0_30px_rgba(0,217,255,0.9)]" />
          <h1 className="text-3xl font-semibold tracking-tight">You are offline</h1>
          <p className="mt-3 text-muted-foreground">EdgeJournal is installed, but this screen needs a connection to sync fresh account and trade data.</p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Retry dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
