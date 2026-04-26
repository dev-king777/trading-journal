import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function RouteLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-6 w-28 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mt-3 h-4 w-[460px] max-w-full animate-pulse rounded bg-white/[0.04]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 animate-pulse rounded bg-white/[0.08]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-[320px] animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
        <div className="h-[320px] animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
      </div>
    </div>
  );
}
