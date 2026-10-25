import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const cities = JSON.parse(readFileSync("assets/config/cities.json", "utf8"));
const projects = JSON.parse(readFileSync("assets/images/realisations/projects.json", "utf8"));
const services = JSON.parse(readFileSync("assets/config/services.json", "utf8"));
const pages = [
  "index.html",
  "realisations.html",
  "contact.html",
  "zones-intervention.html",
  "mentions-legales.html",
  ...cities.map((city) => city.file),
  ...services.map((service) => service.file),
  ...projects.map((project) => `realisation-${project.date}.html`),
  "questions-frequentes.html",
];

test.beforeEach(async ({ page }) => {
  // Remote city photos are outside the build. Keep UI checks deterministic/offline.
  await page.route("https://wsrv.nl/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"/>',
    }),
  );
});
for (const filename of pages) {
  test(`${filename}: valid static content, assets and navigation`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(`/${filename}`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#year")).toHaveText(String(new Date().getFullYear()));
    await expect(page.locator("body")).not.toContainText(/\{\{[A-Z_]+\}\}/);
    const localLinks = await page.locator("a[href]").evaluateAll((links) => [
      ...new Set(
        links
          .map((link) => link.getAttribute("href"))
          .filter((href) => !/^(https?:|mailto:|tel:|#)/.test(href))
          .map((href) => href.split("#")[0]),
      ),
    ]);
    for (const href of localLinks)
      expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBeTruthy();
    if (filename !== "mentions-legales.html")
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    // The legal page's pre-existing narrow nested footer remains unchanged.
    expect(errors).toEqual([]);
    expect(await page.locator('script[src*="cdn.tailwindcss.com"]').count()).toBe(0);
    expect(await page.locator('link[href*="cdn.jsdelivr.net"]').count()).toBe(0);
  });
}
test("menu closes with Escape, navigation and the desktop breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact.html");
  const button = page.locator("#menu-btn");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await button.click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("body")).not.toHaveClass(/no-scroll/);
  await page.setViewportSize({ width: 390, height: 844 });
  await button.click();
  await page.locator('#mobile-menu a[href="index.html#services"]').click();
  await expect(page).toHaveURL(/index.html#services$/);
  await expect(button).toHaveAttribute("aria-expanded", "false");
});
test("all project filters preserve cards and comparison positions", async ({ page }) => {
  await page.goto("/realisations.html");
  const cards = page.locator("#featured-projects [data-category]");
  await expect(cards).toHaveCount(projects.length);
  const slider = page.locator("[data-comparison] input").first();
  await slider.fill("75");
  for (const filter of [
    "all",
    "maconnerie",
    "interieur",
    "pierre",
    "facades",
    "terrasses",
    "finitions",
  ]) {
    const button = page.locator(`[data-filter="${filter}"]`);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#featured-projects [data-category]:not([hidden])")).toHaveCount(
      filter === "all"
        ? projects.length
        : projects.filter((project) => project.category === filter).length,
    );
  }
  await page.locator('[data-filter="all"]').click();
  await expect(slider).toHaveValue("75");
  await expect(page.locator("[data-comparison-before]").first()).toHaveCSS(
    "clip-path",
    "inset(0px 25% 0px 0px)",
  );
  await expect(page.locator("#projects-empty")).toBeHidden();
});
test("homepage slider can be used without opening the project link", async ({ page }) => {
  await page.goto("/index.html");
  const slider = page.locator("#home-project input");
  await slider.fill("20");
  await expect(page.locator("#home-project [data-comparison-before]")).toHaveCSS(
    "clip-path",
    "inset(0px 80% 0px 0px)",
  );
  await slider.click();
  await expect(page).toHaveURL(/index.html$/);
});
test("lightbox supports keyboard, focus restoration and background dismissal", async ({ page }) => {
  await page.goto("/realisations.html");
  const image = page.locator("img.awz-zoomable").first();
  await expect(image).toHaveAttribute("role", "button");
  await image.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#awz-lightbox")).toBeVisible();
  await expect(page.locator("#awz-lightbox-close")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#awz-lightbox-close")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#awz-lightbox")).toBeHidden();
  await expect(image).toBeFocused();
  await image.click();
  await page.locator("#awz-lightbox").click({ position: { x: 2, y: 2 } });
  await expect(page.locator("#awz-lightbox")).toBeHidden();
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
});
test("project pages remain complete with JavaScript disabled", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/realisations.html`);
  await expect(page.locator(".featured-shell")).toHaveCount(projects.length);
  await expect(page.locator(".featured-shell h2").first()).toBeVisible();
  await page.goto(`${baseURL}/index.html`);
  await expect(page.locator("#home-project h3")).toBeVisible();
  await page.goto(`${baseURL}/${services[0].file}`);
  const question = page.locator("details").first();
  await question.locator("summary").click();
  await expect(question.locator("p")).toBeVisible();
  await page.goto(`${baseURL}/realisation-${projects[0].date}.html`);
  await expect(page.getByRole("heading", { name: "Travaux réalisés" })).toBeVisible();
  await context.close();
});
