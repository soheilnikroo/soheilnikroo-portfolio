export function AdminPanelSkeleton({ label = "Loading content…" }: { label?: string }) {
  return (
    <div className="mt-8 space-y-3" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="h-16 animate-pulse rounded-xl bg-muted/40" />
      <div className="h-16 animate-pulse rounded-xl bg-muted/40" />
      <div className="h-16 animate-pulse rounded-xl bg-muted/40" />
    </div>
  );
}
