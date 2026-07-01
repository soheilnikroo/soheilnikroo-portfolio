import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("work index lists projects", async ({ page }) => {
  await page.goto("/work");
  await expect(page.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /enter/i }).first()).toBeVisible();
});

test("work index has no serious accessibility violations", async ({ page }) => {
  await page.goto("/work");
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});

test("read page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/read");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});

test("blog post has no serious accessibility violations", async ({ page }) => {
  await page.goto("/blog");
  await page.getByRole("link", { name: /respects reduced motion/i }).click();
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});
