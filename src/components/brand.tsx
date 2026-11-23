import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 rounded-md text-inherit", className)}>
      <svg aria-hidden="true" viewBox="0 0 36 36" width="36" height="36" className="shrink-0">
        <rect width="36" height="36" rx="9" fill="#2563EB" />
        <path d="m8 24 8-8 5 3 7-8" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="24" r="2.5" fill="white" />
        <circle cx="16" cy="16" r="2.5" fill="white" />
        <circle cx="21" cy="19" r="2.5" fill="white" />
        <circle cx="28" cy="11" r="2.8" fill="#5EEAD4" />
      </svg>
      <span className="font-display text-[1.2rem] font-extrabold tracking-[-0.055em]">ClientFlow</span>
    </Link>
  );
}
