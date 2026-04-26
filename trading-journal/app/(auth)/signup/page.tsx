import Link from "next/link";

import { signUp } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { GoldButton } from "@/components/auth/gold-button";
import { GoldInput } from "@/components/auth/gold-input";

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <AuthCard
      title="Join the brotherhood."
      subtitle="Create your private trading journal."
      error={searchParams.error}
      footer={
        <span style={{ color: "#a1a1aa" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#d4a017" }} className="hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form action={signUp} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-white/80">
            Name
          </label>
          <GoldInput id="name" name="name" placeholder="Your name" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Email
          </label>
          <GoldInput id="email" name="email" type="email" placeholder="trader@example.com" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-white/80">
            Password
          </label>
          <GoldInput id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
        </div>
        <GoldButton type="submit" className="w-full">
          Create account
        </GoldButton>
      </form>
    </AuthCard>
  );
}
