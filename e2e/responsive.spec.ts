import { expect, test } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

test.describe("mobile responsiveness", () => {
  test("blog index renders on a mobile viewport", async ({ browser }) => {
    const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
    const page = await context.newPage();
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Notes & essays" })).toBeVisible();
    await context.close();
  });

  test("mobile header menu exposes primary navigation", async ({ browser }) => {
    const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
    const page = await context.newPage();
    await page.goto("/blog");
    await page.getByRole("button", { name: "Open menu" }).click();
    const mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Projects" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Writing" })).toBeVisible();
    await context.close();
  });

  test("blog post shows collapsible TOC on mobile", async ({ browser }) => {
    const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
    const page = await context.newPage();
    await page.goto("/blog");
    const firstPost = page.getByRole("link", { name: /respects reduced motion/i });
    await firstPost.click();
    const toc = page.locator("details").filter({ hasText: "On this page" });
    await expect(toc).toBeVisible();
    await toc.locator("summary").click();
    await expect(toc.getByRole("link").first()).toBeVisible();
    await context.close();
  });

  test("homepage supports touch scrolling without treating drags as taps", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: MOBILE_VIEWPORT,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    const stage = page.getByRole("region", {
      name: "Interactive pixel-art journey — scroll or tap to play",
    });
    await expect(stage).toBeVisible({ timeout: 15000 });

    const startScroll = await page.evaluate(() => window.scrollY);
    const box = await stage.boundingBox();
    if (!box) throw new Error("stage bounding box missing");
    const startX = box.x + box.width * 0.5;
    const startY = box.y + box.height * 0.65;
    const endY = box.y + box.height * 0.25;

    await page.touchscreen.tap(startX, startY);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, endY, { steps: 12 });
    await page.mouse.up();

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(startScroll + 40);
    await context.close();
  });

  test("homepage tap advances scroll progress on mobile", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: MOBILE_VIEWPORT,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    const stage = page.getByRole("region", {
      name: "Interactive pixel-art journey — scroll or tap to play",
    });
    await expect(stage).toBeVisible({ timeout: 15000 });

    const box = await stage.boundingBox();
    if (!box) throw new Error("stage bounding box missing");
    const tapX = box.x + box.width * 0.72;
    const tapY = box.y + box.height * 0.55;
    const startScroll = await page.evaluate(() => window.scrollY);

    await page.touchscreen.tap(tapX, tapY);

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(startScroll + 10);
    await context.close();
  });

  test("homepage footer is hidden on mobile", async ({ browser }) => {
    const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await context.close();
  });
});
