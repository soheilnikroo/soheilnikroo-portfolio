import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("blog list filters and opens a post", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Notes & essays" })).toBeVisible();
  await page.getByRole("searchbox").fill("motion");
  await expect(page.getByText("Clean architecture")).toHaveCount(0);
  await page.getByRole("searchbox").fill("");
  const firstPost = page.getByRole("link", { name: /respects reduced motion/i });
  await firstPost.click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
});
test("blog has no serious accessibility violations", async ({ page }) => {
  await page.goto("/blog");
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});
