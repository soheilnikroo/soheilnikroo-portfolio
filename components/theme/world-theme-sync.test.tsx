import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WorldThemeSync } from "./world-theme-sync";

const pathnameRef = vi.hoisted(() => ({ current: "/blog" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
}));

afterEach(() => {
  pathnameRef.current = "/blog";
  document.documentElement.removeAttribute("data-pixel-world");
  document.documentElement.style.colorScheme = "";
  document.documentElement.className = "";
});

describe("WorldThemeSync", () => {
  it("marks the game route without overriding theme classes", async () => {
    pathnameRef.current = "/";
    document.documentElement.classList.add("light");
    render(<WorldThemeSync />);
    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-pixel-world")).toBe("true"),
    );
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("clears the game override when leaving the play route", async () => {
    pathnameRef.current = "/";
    const { rerender } = render(<WorldThemeSync />);
    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-pixel-world")).toBe("true"),
    );

    pathnameRef.current = "/blog";
    rerender(<WorldThemeSync />);

    await waitFor(() =>
      expect(document.documentElement.hasAttribute("data-pixel-world")).toBe(false),
    );
    expect(document.documentElement.style.colorScheme).toBe("");
  });
});
