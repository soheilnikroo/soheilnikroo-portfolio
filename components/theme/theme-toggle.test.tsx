import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactDom from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

const flushSyncMock = vi.hoisted(() => vi.fn((callback: () => void) => callback()));
const startViewTransitionMock = vi.hoisted(() =>
  vi.fn((callback: () => void) => {
    callback();
    return { finished: Promise.resolve() };
  }),
);

vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof ReactDom>("react-dom");
  return {
    ...actual,
    flushSync: flushSyncMock,
  };
});

beforeEach(() => {
  flushSyncMock.mockClear();
  startViewTransitionMock.mockClear();
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    writable: true,
    value: startViewTransitionMock,
  });
});

afterEach(() => {
  document.documentElement.className = "";
  document.documentElement.style.cssText = "";
});

describe("ThemeToggle", () => {
  it("cycles the theme onto the document element", async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ThemeToggle />
      </ThemeProvider>,
    );
    const button = await screen.findByRole("button");
    await userEvent.click(button);
    await userEvent.click(button);
    await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(true));
  });

  it("uses view transitions when supported", async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <ThemeToggle />
      </ThemeProvider>,
    );
    const button = await screen.findByRole("button");
    await userEvent.click(button);
    expect(startViewTransitionMock).toHaveBeenCalledTimes(1);
    expect(flushSyncMock).toHaveBeenCalledTimes(1);
  });
});
