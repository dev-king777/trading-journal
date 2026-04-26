import { create } from "zustand";

type AccountState = {
  activeAccountId: string | null;
  setActiveAccountId: (accountId: string) => void;
};

export const useAccountStore = create<AccountState>((set) => ({
  activeAccountId: null,
  setActiveAccountId: (accountId) => set({ activeAccountId: accountId })
}));
