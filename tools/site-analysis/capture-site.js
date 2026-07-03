const path = require("node:path");
const { chromium } = require("playwright");

const OUTPUT_DIR = path.resolve(__dirname, "../../analysis-output/test");
const SCREENSHOT_PATH = path.join(OUTPUT_DIR, "capture-site.png");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto("about:blank");
  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: Arial, sans-serif;
            background: #f7f5ef;
            color: #152238;
          }
          main {
            border: 1px solid #d7d1c2;
            padding: 32px;
            background: white;
          }
        </style>
      </head>
      <body>
        <main data-test-id="capture-target">Playwright capture smoke test</main>
      </body>
    </html>
  `);
  await page.locator("[data-test-id='capture-target']").click();
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  await browser.close();

  console.log(JSON.stringify({ ok: true, screenshot: SCREENSHOT_PATH }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
