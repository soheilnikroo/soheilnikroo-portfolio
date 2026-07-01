import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing wakes on interaction and reveals the name", async ({ page }) => {
  await page.goto("/");
  await page.mouse.click(640, 400);
  await expect(page.getByRole("heading", { name: "Soheil Nikroo", level: 1 })).toBeVisible({
    timeout: 6000,
  });
});
test("reduced-motion landing has no serious accessibility violations", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
  await context.close();
});
