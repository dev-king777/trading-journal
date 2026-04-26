import Image from "next/image";

const sparks = [
  { left: "8%", top: "78%", animationDelay: "0s", animationDuration: "8s" },
  { left: "17%", top: "62%", animationDelay: "1.4s", animationDuration: "10s" },
  { left: "29%", top: "84%", animationDelay: "2.6s", animationDuration: "9s" },
  { left: "43%", top: "70%", animationDelay: "0.8s", animationDuration: "11s" },
  { left: "58%", top: "82%", animationDelay: "3.2s", animationDuration: "8.5s" },
  { left: "72%", top: "68%", animationDelay: "1.9s", animationDuration: "10.5s" },
  { left: "86%", top: "78%", animationDelay: "4.1s", animationDuration: "9.5s" }
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/brotherhood-bg.png"
          alt="Brotherhood"
          fill
          sizes="100vw"
          className="object-cover object-[38%_top] md:object-[center_top]"
          priority
        />
      </div>

      <div
        className="fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 74% 48%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.34) 100%), linear-gradient(to right, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.72) 100%)"
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
        {sparks.map((spark, index) => (
          <span
            key={index}
            className="auth-spark absolute h-1 w-1 rounded-full bg-[#d4a017]/50 shadow-[0_0_12px_rgba(212,160,23,0.65)]"
            style={spark}
          />
        ))}
      </div>

      <main className="relative z-[3] h-screen min-h-screen overflow-y-auto">
        <div className="flex min-h-screen w-full items-center justify-start px-4 py-8 sm:px-6 md:justify-center md:px-8 lg:justify-end lg:pr-[8%]">
          {children}
        </div>
      </main>
    </div>
  );
}
