import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoonPage({
  badge,
  title,
  description
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Badge>{badge}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-3">
          {["Data model ready", "Route scaffolded", "Polish pass queued"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="h-2 w-16 rounded-full bg-primary/40" />
              <div className="mt-6 font-medium">{item}</div>
              <p className="mt-2 text-sm text-muted-foreground">This section is part of the roadmap and has a stable placeholder in Phase 1.</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
