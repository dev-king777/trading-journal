"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, FileText, Goal, Home, Lightbulb, LogOut, Menu, Plus, Settings, Table2, Upload, Wallet, X } from "lucide-react";
import { memo, useCallback, useState } from "react";

import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AccountSwitcher } from "@/components/accounts/account-switcher";
import type { AccountRecord } from "@/types/trading";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/trades", label: "Trades", icon: Table2 },
  { href: "/trades/new", label: "New trade", icon: Plus },
  { href: "/trades/import", label: "Import CSV", icon: Upload },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/goals", label: "Goals", icon: Goal },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/settings/strategies", label: "Strategies", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

const NavLinks = memo(function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition duration-200 hover:bg-white/[0.06] hover:text-white",
              active && "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(0,217,255,0.16)]"
            )}
          >
            <item.icon className={cn("h-4 w-4 transition group-hover:scale-110", active && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
});

export function AppShell({ children, accountName, accounts, activeAccountId }: { children: React.ReactNode; accountName: string; accounts: AccountRecord[]; activeAccountId?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasAccount = accounts.length > 0;
  const closeMobileNav = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#09090e]/90 p-4 backdrop-blur-xl lg:block">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_20px_rgba(0,217,255,0.9)]" />
          <div>
            <div className="font-semibold tracking-tight">EdgeJournal</div>
            <div className="text-xs text-muted-foreground">Performance tracker</div>
          </div>
        </Link>
        <div className="flex h-[calc(100%-88px)] flex-col justify-between">
          <NavLinks />
          <form action={signOut}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-zinc-400">
              <LogOut className="mr-3 h-4 w-4" /> Logout
            </Button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0f]/75 backdrop-blur-xl lg:ml-72">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Active account</div>
              <div className="flex items-center gap-2">
                <div className="hidden font-medium sm:block">{accountName}</div>
                <AccountSwitcher accounts={accounts} activeAccountId={activeAccountId} />
              </div>
            </div>
          </div>
          <Button asChild>
            <Link href={hasAccount ? "/trades/new" : "/accounts"}><Plus className="mr-2 h-4 w-4" /> {hasAccount ? "Log trade" : "Create account"}</Link>
          </Button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="h-full w-80 max-w-[85vw] border-r border-white/10 bg-[#09090e] p-4">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/dashboard" className="font-semibold text-primary" onClick={() => setMobileOpen(false)}>EdgeJournal</Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <NavLinks onNavigate={closeMobileNav} />
            <form action={signOut} className="mt-6">
              <Button type="submit" variant="ghost" className="w-full justify-start text-zinc-400">
                <LogOut className="mr-3 h-4 w-4" /> Logout
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-8">{children}</main>
    </div>
  );
}
