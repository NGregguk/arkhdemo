const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const postcss = require("postcss");
const safeParser = require("postcss-safe-parser");
const csstree = require("css-tree");
const acorn = require("acorn");

const OUTPUT_DIR = path.resolve(__dirname, "../../analysis-output/test");
const REPORT_PATH = path.join(OUTPUT_DIR, "inspect-site.json");

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const css = `
    body { margin: 0; font-family: Arial, sans-serif; }
    .panel { display: grid; gap: 12px; color: #152238; }
  `;
  const script = "const status = 'ready'; document.body.dataset.status = status;";

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await page.goto("about:blank");
  await page.setContent(`
    <!doctype html>
    <html>
      <head><style>${css}</style></head>
      <body>
        <section class="panel" data-test-id="inspection-target">
          <h1>Inspection smoke test</h1>
          <button type="button">Inspect</button>
        </section>
        <script>${script}</script>
      </body>
    </html>
  `);
  await page.locator("button").click();

  const dom = await page.evaluate(() => ({
    title: document.querySelector("h1")?.textContent,
    bodyStatus: document.body.dataset.status,
    elements: [...document.querySelectorAll("*")].map((element) => ({
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: [...element.classList],
      testId: element.getAttribute("data-test-id"),
    })),
  }));

  const postcssRoot = postcss.parse(css, { parser: safeParser });
  const cssTreeAst = csstree.parse(css);
  const jsAst = acorn.parse(script, { ecmaVersion: "latest", sourceType: "script" });

  const report = {
    ok: true,
    generatedAt: new Date().toISOString(),
    dom,
    css: {
      postcssRuleCount: postcssRoot.nodes.filter((node) => node.type === "rule").length,
      cssTreeType: cssTreeAst.type,
    },
    javascript: {
      acornType: jsAst.type,
      statementCount: jsAst.body.length,
    },
  };

  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();

  console.log(JSON.stringify({ ok: true, report: REPORT_PATH }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
