"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-[#0a0a0f] px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 h-3 w-3 rounded-full bg-[#ff4d6d] shadow-[0_0_30px_rgba(255,77,109,0.9)]" />
          <h1 className="text-3xl font-semibold">Something broke</h1>
          <p className="mt-3 text-zinc-400">Retry the screen or return to the dashboard.</p>
          <Button className="mt-6" onClick={reset}>Retry</Button>
        </div>
      </body>
    </html>
  );
}
