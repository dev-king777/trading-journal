import Link from "next/link";

import { signIn } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { GoldButton } from "@/components/auth/gold-button";
import { GoldInput } from "@/components/auth/gold-input";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <AuthCard
      title="Welcome back, brother."
      subtitle="Sign in to your trading journal."
      error={searchParams.error}
      footer={
        <span style={{ color: "#a1a1aa" }}>
          No account?{" "}
          <Link href="/signup" style={{ color: "#d4a017" }} className="hover:underline">
            Join the brotherhood
          </Link>
        </span>
      }
    >
      <form action={signIn} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Email
          </label>
          <GoldInput id="email" name="email" type="email" placeholder="trader@example.com" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-white/80">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: "#d4a017" }}>
              Forgot?
            </Link>
          </div>
          <GoldInput id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <GoldButton type="submit" className="w-full">
          Sign in
        </GoldButton>
      </form>
    </AuthCard>
  );
}
