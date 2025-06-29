import { cn } from "@/lib/utils";

export function HandshakeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
    >
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-2.5-2.5" />
      <path d="M10 14 7.5 11.5a1 1 0 1 0-3 3L7 17" />
      <path d="M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
      <path d="M10 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
      <path d="m17 11 2.5-2.5a1 1 0 1 0-3-3L14 8" />
      <path d="m14 8-1.5 1.5" />
    </svg>
  );
}
