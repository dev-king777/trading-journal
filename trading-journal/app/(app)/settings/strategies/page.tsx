import { createStrategyTag } from "@/app/actions/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStrategyTags } from "@/lib/app-data/queries";

export default async function StrategiesSettingsPage({ searchParams }: { searchParams: { error?: string } }) {
  const tags = await getStrategyTags();

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Badge variant={searchParams.error ? "destructive" : "default"}>{searchParams.error ?? "Strategy tags"}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Strategies</h1>
        <p className="mt-2 text-muted-foreground">Define custom setups so analytics reveal which edges are worth scaling.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {tags.length ? tags.map((tag) => (
            <Card key={tag.id}>
              <CardHeader><CardTitle className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} /> {tag.name}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">{tag.description ?? "No description."}</CardContent>
            </Card>
          )) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">No strategy tags yet.</CardContent>
            </Card>
          )}
        </div>
        <Card>
          <CardHeader><CardTitle>Add strategy</CardTitle></CardHeader>
          <CardContent>
            <form action={createStrategyTag} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input name="name" placeholder="Order Block" required /></div>
              <div className="space-y-2"><Label>Color</Label><Input name="color" type="color" defaultValue="#00d9ff" /></div>
              <div className="space-y-2"><Label>Description</Label><Input name="description" placeholder="Setup definition" /></div>
              <Button type="submit" className="w-full">Create tag</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
