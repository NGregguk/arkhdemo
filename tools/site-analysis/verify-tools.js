const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const ffmpegPath = require("ffmpeg-static");
const sharp = require("sharp");
const { PNG } = require("pngjs");
const postcss = require("postcss");
const safeParser = require("postcss-safe-parser");
const csstree = require("css-tree");
const acorn = require("acorn");

const OUTPUT_DIR = path.resolve(__dirname, "../../analysis-output/test");
const SCREENSHOT_PATH = path.join(OUTPUT_DIR, "verify-screenshot.png");
const VIDEO_PATH = path.join(OUTPUT_DIR, "verify-recording.webm");
const IMAGE_PATH = path.join(OUTPUT_DIR, "verify-sharp.png");
const DIFF_PATH = path.join(OUTPUT_DIR, "verify-pixelmatch-diff.png");
const REPORT_PATH = path.join(OUTPUT_DIR, "verify-tools.json");

async function smokeTestPlaywright() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 640, height: 360 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 640, height: 360 },
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
            display: grid;
            place-items: center;
            min-height: 100vh;
            background: #eef3f0;
          }
          button {
            border: 0;
            padding: 12px 18px;
            background: #145c4a;
            color: white;
            font: 16px Arial, sans-serif;
          }
          .pulse {
            animation: fade 600ms ease-in-out alternate infinite;
          }
          @keyframes fade {
            from { opacity: 0.65; }
            to { opacity: 1; }
          }
        </style>
      </head>
      <body>
        <button class="pulse" type="button">Verify</button>
      </body>
    </html>
  `);
  await page.locator("button").click();
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  await page.waitForTimeout(800);

  const video = page.video();
  if (!video) {
    throw new Error("Playwright video handle was not created.");
  }

  await context.close();
  await browser.close();

  await fs.rm(VIDEO_PATH, { force: true });
  const generatedVideoPath = await video.path();
  await fs.copyFile(generatedVideoPath, VIDEO_PATH);
  if (path.resolve(generatedVideoPath) !== path.resolve(VIDEO_PATH)) {
    await fs.rm(generatedVideoPath, { force: true });
  }

  return {
    screenshot: SCREENSHOT_PATH,
    recording: VIDEO_PATH,
  };
}

async function smokeTestImages() {
  await sharp({
    create: {
      width: 8,
      height: 8,
      channels: 4,
      background: { r: 20, g: 92, b: 74, alpha: 1 },
    },
  }).png().toFile(IMAGE_PATH);

  const pixelmatch = (await import("pixelmatch")).default;
  const first = new PNG({ width: 2, height: 2 });
  const second = new PNG({ width: 2, height: 2 });
  const diff = new PNG({ width: 2, height: 2 });

  first.data.fill(255);
  second.data.fill(255);
  second.data[0] = 0;

  const diffPixels = pixelmatch(first.data, second.data, diff.data, 2, 2, { threshold: 0.1 });
  await fs.writeFile(DIFF_PATH, PNG.sync.write(diff));

  return {
    sharpImage: IMAGE_PATH,
    pixelmatchDiff: DIFF_PATH,
    diffPixels,
  };
}

function smokeTestParsing() {
  const css = ".box { color: #145c4a; transform: translateX(2px); }";
  const js = "const box = document.querySelector('.box');";
  const postcssRoot = postcss.parse(css, { parser: safeParser });
  const cssTreeAst = csstree.parse(css);
  const jsAst = acorn.parse(js, { ecmaVersion: "latest" });

  return {
    postcssRules: postcssRoot.nodes.length,
    cssTreeType: cssTreeAst.type,
    acornType: jsAst.type,
    acornStatements: jsAst.body.length,
  };
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const playwright = await smokeTestPlaywright();
  const images = await smokeTestImages();
  const parsing = smokeTestParsing();

  const report = {
    ok: true,
    generatedAt: new Date().toISOString(),
    chromium: "launched",
    playwright,
    ffmpegStatic: {
      imported: Boolean(ffmpegPath),
      path: ffmpegPath,
    },
    images,
    parsing,
  };

  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, report: REPORT_PATH }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
