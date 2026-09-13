const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const server = spawn("bun", ["mockups/serve.ts", "dist", "0"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let browser;
  try {
    const base = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Preview server did not start")),
        10000,
      );
      server.once("error", reject);
      server.once("exit", (code) =>
        reject(new Error(`Preview exited: ${code}`)),
      );
      server.stdout.on("data", (chunk) => {
        const match = chunk.toString().match(/http:\/\/localhost:\d+/);
        if (match) {
          clearTimeout(timeout);
          resolve(match[0]);
        }
      });
    });
    browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    });
    const page = await browser.newPage({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const settle = () =>
      page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
    const files = fs
      .readdirSync("site/pages")
      .filter((name) => name.endsWith(".json"))
      .sort();
    for (const file of files) {
      const url = file.replace(".json", ".html");
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`${base}/${url}`, { waitUntil: "domcontentloaded" });
      assert.equal(await page.locator("h1").count(), 1, `${url}: one h1`);
      assert.equal(await page.locator("main").count(), 1, `${url}: one main`);
      if (!url.startsWith("header-preview-"))
        assert.equal(await page.locator("footer").count(), 1, `${url}: footer`);
      const refs = await page
        .locator("[href], [src], [poster], [data-video-src]")
        .evaluateAll((nodes) =>
          nodes.flatMap((n) =>
            ["href", "src", "poster", "data-video-src"]
              .map((a) => n.getAttribute(a))
              .filter(Boolean),
          ),
        );
      for (const ref of refs) {
        if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
        assert.ok(!ref.startsWith("/"), `${url}: subpath-safe asset ${ref}`);
        const [target, hash] = ref.split("#");
        if (target)
          assert.ok(
            fs.existsSync(path.join("dist", target.split("?")[0])),
            `${url}: missing ${target}`,
          );
        else if (hash)
          assert.ok(
            await page.locator(`[id="${hash}"]`).count(),
            `${url}: missing anchor ${hash}`,
          );
      }
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await settle();
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${url}: overflow at ${width}`,
        );
      }
    }
    const componentFiles = fs
      .readdirSync("dist")
      .filter(
        (name) => name.startsWith("component--") && name.endsWith(".html"),
      );
    for (const file of componentFiles) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`${base}/${file}`, { waitUntil: "domcontentloaded" });
      const canvas = page.frameLocator(".component-canvas");
      await canvas.locator("main").waitFor({ state: "attached" });
      assert.ok(
        await canvas.locator("main > *").count(),
        `${file}: renders actual component content`,
      );
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await settle();
        assert.ok(
          await canvas
            .locator("html")
            .evaluate((el) => el.scrollWidth <= innerWidth),
          `${file}: canvas overflow at ${width}`,
        );
      }
    }
    await page.goto(`${base}/component-library.html`);
    await page.locator(".component-group").first().locator("summary").click();
    const [componentTab] = await Promise.all([
      page.waitForEvent("popup"),
      page.locator(".component-open").first().click(),
    ]);
    await componentTab.waitForURL("**/component--headers--*.html");
    assert.ok(componentTab.url().includes("component--headers--"));
    await componentTab.close();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/start-event.html`);
    assert.equal(await page.locator(".glass-edge").count(), 4);
    await page.getByRole("button", { name: "Play background video" }).click();
    await page.waitForFunction(
      () => !document.querySelector(".header-film").paused,
    );
    await page.getByRole("button", { name: "Pause background video" }).click();
    assert.equal(
      await page.locator(".header-film").evaluate((v) => v.paused),
      true,
    );
    await page.goto(`${base}/experience-design.html`);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await settle();
    await page.locator(".site-service-trigger").click();
    await page
      .locator('.site-submenu a[href="technical-production.html"]')
      .click();
    await page.waitForURL("**/technical-production.html");
    // Reduced motion must avoid even requesting the background video.
    assert.equal(await page.locator(".header-film").getAttribute("src"), null);
    await page.getByRole("button", { name: "Play background video" }).click();
    await page.waitForFunction(
      () => !document.querySelector(".header-film").paused,
    );
    await page.getByRole("button", { name: "Pause background video" }).click();
    assert.equal(
      await page.locator(".header-film").evaluate((v) => v.paused),
      true,
    );
    // A changed preference resumes autoplay; leaving and re-entering must retain user pause.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForFunction(
      () => !document.querySelector(".header-film").paused,
    );
    await page.getByRole("button", { name: "Pause background video" }).click();
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.locator("h1").scrollIntoViewIfNeeded();
    await settle();
    assert.equal(
      await page.locator(".header-film").evaluate((v) => v.paused),
      true,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${base}/start-event.html`);
    assert.equal(await page.locator("select[name=service] option").count(), 5);
    await page.locator("[name=name]").fill("Design Review");
    await page.locator("[name=email]").fill("review@example.com");
    await page.locator("[name=company]").fill("Prototype");
    await page
      .locator("[name=brief]")
      .fill("A sample brief for this local test.");
    await page.getByRole("button", { name: "Preview your brief" }).click();
    assert.ok(await page.locator("#form-status").isVisible());
    await page.getByRole("button", { name: "Edit brief" }).click();
    assert.equal(
      await page.locator("[name=name]").inputValue(),
      "Design Review",
    );
    await page.goto(`${base}/header-library.html`);
    await page.locator('[data-header-option="Background film"]').click();
    await page
      .frameLocator(".library-frame")
      .locator(".header-video")
      .waitFor();
    await page.locator("[data-preview-size=mobile]").click();
    await page.waitForFunction(
      () =>
        document.querySelector(".library-frame").getBoundingClientRect()
          .width <= 390,
    );
    // The content and navigation render without any client-side partial loader.
    const staticPage = await browser.newPage({ javaScriptEnabled: false });
    await staticPage.goto(`${base}/technical-production.html`);
    assert.equal(await staticPage.locator("h1").count(), 1);
    assert.ok(await staticPage.locator(".header-media").first().isVisible());
    assert.equal(
      await staticPage.locator(".header-film").getAttribute("src"),
      null,
    );
    await page.goto(`${base}/component-library.html`);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const replay = page.locator("[data-motion-replay]");
    await replay.click();
    await page.waitForFunction(() =>
      [...document.querySelectorAll("#reveal-examples [data-reveal]")].some(
        (el) => el.getAnimations().length,
      ),
    );
    await page.locator("#reveal-examples a").first().focus();
    assert.equal(
      await page
        .locator("#reveal-examples article")
        .first()
        .evaluate((el) => getComputedStyle(el).opacity),
      "1",
      "Focused content must never remain faded",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() =>
      [...document.querySelectorAll("#reveal-examples [data-reveal]")].every(
        (el) => el.getAnimations().length === 0,
      ),
    );
    await replay.click();
    assert.equal(
      await page
        .locator("#reveal-examples")
        .evaluate((el) => el.getAnimations({ subtree: true }).length),
      0,
      "Replay respects reduced motion",
    );
    await page.locator(".motion-card").hover();
    assert.equal(
      await page
        .locator(".motion-card img")
        .evaluate((el) => getComputedStyle(el).transform),
      "none",
    );
    assert.equal(
      await staticPage
        .locator("[data-reveal]")
        .first()
        .evaluate((el) => getComputedStyle(el).opacity),
      "1",
      "No-JS content remains visible",
    );
    assert.deepEqual(errors, []);
    console.log(
      `Passed: ${files.length} page compositions and ${componentFiles.length} isolated components, mobile layouts, glass video, navigation, form and motion preferences.`,
    );
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
