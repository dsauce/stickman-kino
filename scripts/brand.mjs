// Render brand SVGs → PNG with headless Chrome (fonts from engine/fonts). Usage: node scripts/brand.mjs
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, findBrowsers, toolEnv } from "../lib/env.mjs";

const browser = findBrowsers()[0]; if (!browser) { console.error("no Chrome - run stickman setup"); process.exit(1); }
const jobs = [
  ["icon.svg", "icon.png", 512, 512, false], ["icon.svg", "icon-128.png", 128, 128, false],
  ["logo.svg", "logo.png", 1420, 300, true], ["logo-dark.svg", "logo-dark.png", 1420, 300, true]
];
const tmp = path.join(ROOT, ".stickman", "brand"); fs.mkdirSync(tmp, { recursive: true });
for (const [src, out, w, h, transparent] of jobs) {
  const svg = fs.readFileSync(path.join(ROOT, "assets/brand", src), "utf8");
  const fonts = path.join(ROOT, "engine/fonts").split(path.sep).join("/");
  const html = `<!doctype html><html><head><style>@font-face{font-family:Inter;src:url("file://${fonts}/inter-latin-800-normal.woff2");font-weight:800}html,body{margin:0;background:transparent;overflow:hidden}svg{width:${w}px;height:${h}px;display:block}</style></head><body>${svg}</body></html>`;
  const f = path.join(tmp, out + ".html"); fs.writeFileSync(f, html);
  const r = spawnSync(browser, ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", `--window-size=${w},${h}`, "--default-background-color=00000000", "--virtual-time-budget=1500", `--screenshot=${path.join(ROOT, "assets/brand", out)}`, "file://" + f], { env: toolEnv(), encoding: "utf8" });
  console.log(r.status === 0 ? "✓ " + out : "✗ " + out + " " + (r.stderr || "").slice(0, 300));
}
