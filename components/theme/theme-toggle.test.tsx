import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

afterEach(() => {
  document.documentElement.className = "";
});
describe("ThemeToggle", () => {
  it("cycles the theme onto the document element", async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemeToggle />
      </ThemeProvider>,
    );
    const button = await screen.findByRole("button");
    await userEvent.click(button);
    await userEvent.click(button);
    await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(true));
  });
});
