import { expect, test } from "@playwright/test";

test("theme toggle changes the document theme", async ({ page }) => {
  await page.goto("/blog");
  const toggle = page.getByRole("button", { name: /Theme:/i });
  const before = await page.evaluate(() => document.documentElement.className);
  await toggle.click();
  await toggle.click();
  await expect.poll(() => page.evaluate(() => document.documentElement.className)).not.toBe(before);
});

test("theme toggle changes pixel shell colors", async ({ page }) => {
  await page.goto("/blog");
  const toggle = page.getByRole("button", { name: /Theme:/i });

  const lightShell = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--pixel-shell").trim(),
  );

  await toggle.click();
  await toggle.click();

  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("dark")))
    .toBe(true);

  const darkShell = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--pixel-shell").trim(),
  );

  expect(lightShell).not.toBe(darkShell);
});
