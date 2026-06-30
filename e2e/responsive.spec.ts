import { expect, test } from "@playwright/test";

test("blog renders on a mobile viewport", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Notes & essays" })).toBeVisible();
  await context.close();
});
