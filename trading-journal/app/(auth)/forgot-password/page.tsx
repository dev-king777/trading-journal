import Link from "next/link";

import { resetPassword } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { GoldButton } from "@/components/auth/gold-button";
import { GoldInput } from "@/components/auth/gold-input";

export default function ForgotPasswordPage({ searchParams }: { searchParams: { error?: string; sent?: string } }) {
  return (
    <AuthCard
      title="Reset password"
      subtitle="Send a secure reset link to your email."
      error={searchParams.error}
      sent={Boolean(searchParams.sent)}
      footer={
        <Link href="/login" style={{ color: "#d4a017" }} className="hover:underline">
          Back to login
        </Link>
      }
    >
      <form action={resetPassword} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Email
          </label>
          <GoldInput id="email" name="email" type="email" placeholder="trader@example.com" required />
        </div>
        <GoldButton type="submit" className="w-full">
          Send reset link
        </GoldButton>
      </form>
    </AuthCard>
  );
}
