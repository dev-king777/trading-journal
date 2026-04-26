import { Badge } from "@/components/ui/badge";
import { signOut } from "@/app/actions/auth";
import { createChecklistItem } from "@/app/actions/settings";
import { ClearTradesButton } from "@/components/settings/clear-trades-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getChecklistItems } from "@/lib/app-data/queries";

export default async function SettingsPage({ searchParams }: { searchParams: { error?: string } }) {
  const checklistItems = await getChecklistItems();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <Badge variant={searchParams.error ? "destructive" : "default"}>{searchParams.error ?? "Preferences"}</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Settings</h1>
            <p className="mt-2 text-muted-foreground">Trading defaults and pre-trade checklist rules.</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline">Logout</Button>
          </form>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Trading defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input defaultValue="USD" />
          </div>
          <div className="space-y-2">
            <Label>Default risk %</Label>
            <Input defaultValue="1.00" />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input defaultValue="UTC" />
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Input defaultValue="Dark default" disabled />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pre-trade checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {checklistItems.length ? checklistItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">{item.order}. {item.label}</div>
            )) : <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground">No checklist rules yet.</div>}
          </div>
          <form action={createChecklistItem} className="grid gap-3 sm:grid-cols-[80px_1fr_auto]">
            <Input name="order" type="number" defaultValue={checklistItems.length + 1} />
            <Input name="label" placeholder="Rule label" required />
            <Button type="submit">Add rule</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-loss">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <ClearTradesButton />
        </CardContent>
      </Card>
    </div>
  );
}
