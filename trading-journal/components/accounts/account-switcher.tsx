"use client";

import { memo } from "react";

import type { AccountRecord } from "@/types/trading";
import { useAccountStore } from "@/stores/account-store";
import { formatCurrency } from "@/lib/utils";

export const AccountSwitcher = memo(function AccountSwitcher({ accounts, activeAccountId }: { accounts: AccountRecord[]; activeAccountId?: string }) {
  const setActiveAccountId = useAccountStore((state) => state.setActiveAccountId);

  if (!accounts.length) {
    return (
      <select disabled className="h-9 rounded-md border border-white/10 bg-[#0d0d14]/80 px-3 text-sm text-muted-foreground" aria-label="Active account">
        <option>No account</option>
      </select>
    );
  }

  return (
    <select
      defaultValue={activeAccountId}
      onChange={(event) => {
        setActiveAccountId(event.target.value);
        document.cookie = `active_account_id=${event.target.value}; path=/; max-age=31536000; SameSite=Lax`;
        window.location.reload();
      }}
      className="h-9 rounded-md border border-white/10 bg-[#0d0d14]/80 px-3 text-sm"
      aria-label="Active account"
    >
      {accounts.map((account) => (
        <option key={account.id} value={account.id}>{account.name} ({formatCurrency(account.currentBalance, account.currency)})</option>
      ))}
    </select>
  );
});
