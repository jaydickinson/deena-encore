const assert = require("node:assert/strict");

module.exports = async function checkInteractions(
  browser,
  base,
  files,
  scanState,
) {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 320, height: 900 },
  });
  const page = await context.newPage();
  try {
    for (const file of files) {
      await page.goto(`${base}/${file}`, { waitUntil: "domcontentloaded" });
      const excess = await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      );
      assert.ok(
        excess <= 1,
        `${file}: 320px reflow exceeds viewport by ${excess}px`,
      );
    }
    // Exercise actual focus movement, rather than relying on ARIA attributes alone.
    for (const file of ["news.html", "homepage-option-1-updated.html"]) {
      const home = file.startsWith("homepage");
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(`${base}/${file}`, { waitUntil: "domcontentloaded" });
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .locator(".skip-link")
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await page.keyboard.press("Enter");
      assert.equal(
        await page
          .locator("main")
          .evaluate((el) => el === document.activeElement),
        true,
      );
      const toggle = page.locator(home ? "#hamb" : ".site-menu-toggle");
      await toggle.focus();
      await page.keyboard.press("Enter");
      assert.equal(await toggle.getAttribute("aria-expanded"), "true");
      await scanState(page, file, 390, "mobile menu open");
      if (home) {
        assert.equal(
          await page
            .locator("#mobmenu a")
            .first()
            .evaluate((el) => el === document.activeElement),
          true,
        );
        await page.locator("#mobmenu a").last().focus();
        await page.keyboard.press("Tab");
        assert.equal(
          await page
            .locator("#nav .brand")
            .evaluate((el) => el === document.activeElement),
          true,
        );
        await page.keyboard.press("Shift+Tab");
        assert.equal(
          await page
            .locator("#mobmenu a")
            .last()
            .evaluate((el) => el === document.activeElement),
          true,
        );
      }
      await page.keyboard.press("Escape");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      assert.equal(
        await toggle.evaluate((el) => el === document.activeElement),
        true,
      );
      assert.equal(
        await page.locator("main").evaluate((el) => el.inert),
        false,
      );
      if (!home) {
        await toggle.press("Enter");
        await page.locator(".site-nav > a").last().focus();
        await page.keyboard.press("Tab");
        assert.equal(
          await toggle.getAttribute("aria-expanded"),
          "false",
          "Mobile disclosure closes when focus leaves",
        );
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      const service = page.locator(
        home ? ".service-trigger" : ".site-service-trigger",
      );
      await service.focus();
      await page.keyboard.press("ArrowDown");
      assert.equal(
        await page
          .locator(home ? ".submenu a" : ".site-submenu a")
          .first()
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await scanState(page, file, 1440, "services menu open");
      await page.keyboard.press("Escape");
      assert.equal(
        await service.evaluate((el) => el === document.activeElement),
        true,
      );
      assert.equal(await service.getAttribute("aria-expanded"), "false");
    }
    await page.goto(`${base}/homepage-option-1-updated.html`, {
      waitUntil: "domcontentloaded",
    });
    const submit = page.locator("#brief [type=submit]");
    await submit.click();
    assert.equal(
      await page
        .locator("#bf-type")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await page
      .locator("#bf-type")
      .selectOption({ label: "a meeting or conference" });
    await page.locator("#bf-name").fill("Design Review");
    await page.locator("#bf-email").fill("not-an-email");
    await submit.click();
    assert.equal(
      await page
        .locator("#bf-email")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    assert.equal(await page.locator("#brief .ok").isVisible(), false);
    await page.locator("#bf-email").fill("review@example.com");
    await submit.click();
    assert.equal(
      await page
        .locator("#brief .ok")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await scanState(
      page,
      "homepage-option-1-updated.html",
      1440,
      "valid brief preview",
    );
    await page.locator("#bf-name").fill("Updated Review");
    assert.equal(await page.locator("#brief .ok").isVisible(), false);
    const finale = page.locator(".finale video");
    await finale.scrollIntoViewIfNeeded();
    assert.equal(
      await finale.evaluate((el) => el.paused && !el.hasAttribute("src")),
      true,
      "Reduced motion leaves finale on poster",
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForFunction(
      () => !document.querySelector(".finale video").paused,
    );
    const videoToggle = page.locator(".finale .header-video-toggle");
    await videoToggle.focus();
    await page.keyboard.press("Enter");
    assert.equal(await finale.evaluate((el) => el.paused), true);
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () => !document.querySelector(".finale video").paused,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () => document.querySelector(".finale video").paused,
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const row = page.locator(".quote-row").first();
    await row.focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page
        .locator("[data-testimonials]")
        .evaluate((el) => el.classList.contains("is-paused")),
      true,
    );
    await page.keyboard.press("Space");
    assert.equal(
      await page
        .locator("[data-testimonials]")
        .evaluate((el) => el.classList.contains("is-paused")),
      false,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector(".quote-track"))
          .animationName === "none",
    );
    // WCAG text-spacing values applied together on representative page patterns.
    for (const file of [
      "news.html",
      "start-event.html",
      "homepage-option-1-updated.html",
    ]) {
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(`${base}/${file}`, { waitUntil: "domcontentloaded" });
      await page.addStyleTag({
        content:
          "*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important}p{margin-bottom:2em !important}",
      });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${file}: text spacing must reflow`,
      );
    }
    console.log(
      `Passed keyboard navigation, form validation, motion controls, ${files.length} pages at 320px, and representative text-spacing checks.`,
    );
  } finally {
    await context.close();
  }
};
