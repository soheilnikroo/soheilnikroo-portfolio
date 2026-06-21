import { cn } from "@/lib/utils";

/** The "SN" personal brand monogram — molten gold, optional blink. */
export function SnMark({ className, blink = false }: { className?: string; blink?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block bg-gradient-to-br from-[#fbe9a6] via-[#e6c463] to-[#9a7726] bg-clip-text font-heading font-black tracking-tight text-transparent",
        blink && "sn-blink",
        className,
      )}
    >
      SN
    </span>
  );
}
