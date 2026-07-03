# Site Analysis Tooling

This folder contains placeholder tooling for future automated website inspection. The current scripts use only `about:blank` or inline HTML smoke-test pages and do not analyze external websites.

## Commands

- `npm run capture:site` launches Chromium with Playwright, performs a minimal click, and writes `analysis-output/test/capture-site.png`.
- `npm run record:site` launches Chromium with video recording enabled, runs a short inline animation, and writes `analysis-output/test/record-site.webm`.
- `npm run inspect:site` launches Chromium, inspects a small inline DOM/CSS/JS page, and writes `analysis-output/test/inspect-site.json`.
- `npm run verify:site-tools` runs the broader smoke test for Playwright, Chromium, screenshots, recording, image tooling, CSS parsing, and JavaScript parsing. It writes `analysis-output/test/verify-tools.json` plus small image/video artifacts.

## Output Location

All setup-phase artifacts are stored under:

```text
analysis-output/test/
```

## Supporting Packages

- `playwright` provides browser automation, Chromium launching, screenshots, video capture, DOM inspection, and interaction primitives.
- `ffmpeg-static` provides a local FFmpeg binary path for future video processing workflows.
- `sharp` enables image generation, resizing, conversion, metadata reads, and screenshot post-processing.
- `pixelmatch` enables pixel-level image comparison for future visual regression checks.
- `pngjs` provides PNG encode/decode support for lightweight image fixtures and comparison buffers.
- `postcss` provides CSS parsing and transformation primitives.
- `postcss-safe-parser` helps parse imperfect CSS without failing hard.
- `css-tree` enables detailed CSS AST analysis and future selector/declaration inspection.
- `acorn` enables JavaScript parsing for future inline script and bundle inspection.

## Notes

These scripts are intentionally small placeholders. They verify local tooling only and are structured so real capture, recording, inspection, animation, and visual comparison workflows can be added later without changing the command surface.
