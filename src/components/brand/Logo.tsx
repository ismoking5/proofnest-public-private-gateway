import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  // A nest-like rounded shield holding a check: proof + trust.
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="pn-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary-glow)" />
        </linearGradient>
      </defs>
      <path d="M16 2.5 27 7v8.2c0 6.9-4.6 12-11 14.3C9.6 27.2 5 22.1 5 15.2V7l11-4.5Z" fill="url(#pn-g)" />
      <path d="M8.5 17.5c2.2 3.6 4.7 5.4 7.5 5.4s5.3-1.8 7.5-5.4" fill="none" stroke="var(--primary-foreground)" strokeOpacity=".45" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m11 14.8 3.4 3.3 6.8-7" fill="none" stroke="var(--primary-foreground)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, to = "/" }: { className?: string; to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2 font-display text-lg font-bold tracking-tight", className)}>
      <LogoMark />
      <span>ProofNest</span>
    </Link>
  );
}
