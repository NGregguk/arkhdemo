const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

const OUTPUT_DIR = path.resolve(__dirname, "../../analysis-output/test");
const VIDEO_PATH = path.join(OUTPUT_DIR, "record-site.webm");

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.rm(VIDEO_PATH, { force: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 800, height: 450 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 800, height: 450 },
    },
  });
  const page = await context.newPage();

  await page.goto("about:blank");
  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            height: 100vh;
            overflow: hidden;
            background: #102033;
          }
          .marker {
            width: 72px;
            height: 72px;
            background: #f5c542;
            position: absolute;
            top: 188px;
            left: 40px;
            animation: slide 900ms linear forwards;
          }
          @keyframes slide {
            to { transform: translateX(640px); }
          }
        </style>
      </head>
      <body>
        <div class="marker" data-test-id="moving-marker"></div>
      </body>
    </html>
  `);
  await page.locator("[data-test-id='moving-marker']").click();
  await page.waitForTimeout(1200);

  const video = page.video();
  if (!video) {
    throw new Error("Playwright did not create a video handle.");
  }

  await context.close();
  await browser.close();

  const generatedVideoPath = await video.path();
  await fs.copyFile(generatedVideoPath, VIDEO_PATH);
  if (path.resolve(generatedVideoPath) !== path.resolve(VIDEO_PATH)) {
    await fs.rm(generatedVideoPath, { force: true });
  }

  console.log(JSON.stringify({ ok: true, video: VIDEO_PATH }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
