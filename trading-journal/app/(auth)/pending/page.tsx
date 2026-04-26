import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { GoldButton } from "@/components/auth/gold-button";

export default function PendingPage({ searchParams }: { searchParams: { approved?: string } }) {
  if (searchParams.approved === "1") {
    return (
      <AuthCard
        title="You're approved!"
        subtitle="Welcome to the Brotherhood. You can now access your journal."
        footer={null}
      >
        <div className="text-center space-y-4">
          <p className="text-green-400 text-2xl">Approved</p>
          <Link href="/dashboard">
            <GoldButton className="w-full">Enter the Journal</GoldButton>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Pending approval"
      subtitle="Your account is waiting for admin approval."
      footer={
        <p className="text-white/40 text-xs">
          Already approved?{" "}
          <Link href="/login" className="text-yellow-500 hover:underline">
            Sign in again
          </Link>
        </p>
      }
    >
      <div className="space-y-6 text-center">
        <p className="text-white/60 text-sm leading-relaxed">
          The admin has been notified. You will gain access once your account is approved.
          Check back here after you receive confirmation.
        </p>
        <Link href="/dashboard">
          <GoldButton className="w-full">Check if I&apos;m approved</GoldButton>
        </Link>
      </div>
    </AuthCard>
  );
}
