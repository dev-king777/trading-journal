"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function AuthCard({
  title,
  subtitle,
  footer,
  children,
  error,
  sent
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
  error?: string;
  sent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="w-[calc(100vw-2rem)] max-w-[343px] rounded-2xl border p-7 backdrop-blur-xl sm:max-w-[420px] sm:p-10 md:p-11"
      style={{
        background:
          "linear-gradient(145deg, rgba(20,20,24,0.78) 0%, rgba(12,12,16,0.72) 56%, rgba(8,8,10,0.66) 100%)",
        borderColor: "rgba(212, 160, 23, 0.26)",
        boxShadow: "0 18px 42px -22px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.04)"
      }}
    >
      {/* Logo */}
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white">
        <span
          className="h-2 w-2 animate-pulse rounded-full"
          style={{ background: "#d4a017", boxShadow: "0 0 16px rgba(212,160,23,0.8)" }}
        />
        <span>
          <span style={{ color: "#d4a017" }}>Edge</span> Journal
        </span>
      </Link>

      {/* Heading */}
      <h1
        className="text-3xl font-bold leading-tight tracking-wide text-white sm:text-4xl"
        style={{ color: "#d4a017", textShadow: "0 2px 8px rgba(212,160,23,0.22)" }}
      >
        {title}
      </h1>
      {/* Gold accent line */}
      <div className="mt-2 h-px w-12" style={{ background: "#d4a017" }} />
      <p className="mt-3 text-sm" style={{ color: "#a1a1aa" }}>
        {subtitle}
      </p>

      {/* Alerts */}
      {!process.env.NEXT_PUBLIC_SUPABASE_URL ? (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          Supabase env vars required
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      ) : null}
      {sent ? (
        <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-400">
          Reset email requested
        </div>
      ) : null}

      {/* Form area */}
      <div className="mt-6">{children}</div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm" style={{ color: "#a1a1aa" }}>
        {footer}
      </div>
    </motion.div>
  );
}
