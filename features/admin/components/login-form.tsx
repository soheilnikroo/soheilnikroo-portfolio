"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { safeAdminRedirectPath } from "@/lib/auth/paths";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorId = React.useId();
  const passwordId = React.useId();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push(safeAdminRedirectPath(searchParams.get("next")));
      router.refresh();
      return;
    }
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      setError(
        retryAfter
          ? `${data.error ?? "Too many attempts."} Retry in ${retryAfter}s.`
          : (data.error ?? "Too many login attempts. Try again later."),
      );
    } else {
      setError(data.error ?? "Login failed");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-24 w-full max-w-sm">
      <h1 className="font-heading text-2xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter your password to manage writing.</p>
      <label htmlFor={passwordId} className="mt-6 block text-sm font-medium">
        Password
      </label>
      <input
        id={passwordId}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={loading || password.length === 0} className="mt-4 w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
