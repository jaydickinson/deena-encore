const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
const { spawn } = require("node:child_process");
const fs = require("node:fs");

(async () => {
  const server = spawn("bun", ["mockups/serve.ts", "dist", "0"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let browser;
  const results = [];
  try {
    const base = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Preview server did not start")),
        10000,
      );
      server.once("error", reject);
      server.stdout.on("data", (chunk) => {
        const match = String(chunk).match(/http:\/\/localhost:\d+/);
        if (match) {
          clearTimeout(timeout);
          resolve(match[0]);
        }
      });
    });
    browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    });
    const selected = process.env.A11Y_PAGES?.split(",");
    const files = fs
      .readdirSync("site/pages")
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ".html"))
      .filter((file) => !selected || selected.includes(file));
    async function scanState(page, file, width, state) {
      const scan = await new AxeBuilder({ page })
        .withTags([
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22aa",
          "best-practice",
        ])
        .analyze();
      const compact = (issue) => ({
        id: issue.id,
        impact: issue.impact,
        help: issue.help,
        helpUrl: issue.helpUrl,
        nodes: issue.nodes.map((n) => ({
          target: n.target,
          html: n.html,
          summary: n.failureSummary,
          checks: [...n.any, ...n.all, ...n.none].map((c) => ({
            id: c.id,
            data: c.data,
            message: c.message,
          })),
        })),
      });
      results.push({
        page: file,
        width,
        state,
        violations: scan.violations.map(compact),
        incomplete: scan.incomplete.map(compact),
      });
    }
    let index = 0;
    await Promise.all(
      Array.from({ length: 3 }, async () => {
        const context = await browser.newContext({ reducedMotion: "reduce" });
        const page = await context.newPage();
        while (index < files.length) {
          const file = files[index++];
          for (const width of [1440, 390]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.goto(`${base}/${file}`, {
              waitUntil: "domcontentloaded",
            });
            await page
              .locator("img[loading=lazy]")
              .evaluateAll((images) =>
                images.forEach((image) => (image.loading = "eager")),
              );
            await page
              .waitForFunction(
                () => [...document.images].every((image) => image.complete),
                {},
                { timeout: 6000 },
              )
              .catch(() => {});
            await scanState(page, file, width, "default");
          }
          console.log(`Scanned ${file}`);
        }
        await context.close();
      }),
    );
    await require("./accessibility-interactions.cjs")(
      browser,
      base,
      files,
      scanState,
    );
    results.sort((a, b) => a.page.localeCompare(b.page) || b.width - a.width);
    fs.mkdirSync(".cache", { recursive: true });
    fs.writeFileSync(
      ".cache/accessibility-results.json",
      JSON.stringify(
        { engine: require("axe-core/package.json").version, results },
        null,
        2,
      ),
    );
    const failures = results.flatMap((result) =>
      result.violations.map((issue) => ({
        page: result.page,
        width: result.width,
        id: issue.id,
        nodes: issue.nodes.length,
      })),
    );
    console.log(
      JSON.stringify(
        {
          scans: results.length,
          failures,
          manualReviewChecks: results.reduce(
            (n, r) => n + r.incomplete.length,
            0,
          ),
        },
        null,
        2,
      ),
    );
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
