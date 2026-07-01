import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("max-w-[var(--prose)]", className)}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-medium tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </Heading>
      {lead ? (
        <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">{lead}</p>
      ) : null}
    </div>
  );
}
