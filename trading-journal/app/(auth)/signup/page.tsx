"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { signUp } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { GoldButton } from "@/components/auth/gold-button";
import { GoldInput } from "@/components/auth/gold-input";

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="relative">
            <GoldInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={8}
              autoComplete="new-password"
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <GoldButton type="submit" className="w-full">
          Create account
        </GoldButton>
      </form>
    </AuthCard>
  );
}
