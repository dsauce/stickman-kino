// Stickman Kino - `stickman setup` and `stickman doctor`
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { ROOT, HOME_DIR, isWin, readConfig, writeConfig, ffmpegPath, ffprobePath, hyperframesBin, gsapPath, which, venvBin, libsDir, findBrowsers, hf, toolEnv, ok, warn, fail, log, c } from "./env.mjs";

// shared libs Chrome needs on Debian/Ubuntu → candidate packages (t64 names first for 24.04+)
const LIBMAP = {
  "libnss3.so": ["libnss3"], "libnssutil3.so": ["libnss3"], "libsmime3.so": ["libnss3"], "libnspr4.so": ["libnspr4"], "libplc4.so": ["libnspr4"], "libplds4.so": ["libnspr4"],
  "libasound.so.2": ["libasound2t64", "libasound2"], "libatk-1.0.so.0": ["libatk1.0-0t64", "libatk1.0-0"], "libatk-bridge-2.0.so.0": ["libatk-bridge2.0-0t64", "libatk-bridge2.0-0"],
  "libcups.so.2": ["libcups2t64", "libcups2"], "libdrm.so.2": ["libdrm2"], "libxkbcommon.so.0": ["libxkbcommon0"], "libatspi.so.0": ["libatspi2.0-0t64", "libatspi2.0-0"],
  "libXcomposite.so.1": ["libxcomposite1"], "libXdamage.so.1": ["libxdamage1"], "libXfixes.so.3": ["libxfixes3"], "libXrandr.so.2": ["libxrandr2"], "libgbm.so.1": ["libgbm1"],
  "libpango-1.0.so.0": ["libpango-1.0-0"], "libcairo.so.2": ["libcairo2"], "libxshmfence.so.1": ["libxshmfence1"], "libwayland-server.so.0": ["libwayland-server0"], "libavahi-common.so.3": ["libavahi-common3"], "libavahi-client.so.3": ["libavahi-client3"]
};
function missingLibs(bin) {
  if (process.platform !== "linux") return [];
  const env = toolEnv(); const r = spawnSync("ldd", [bin], { encoding: "utf8", env });
  return (r.stdout || "").split("\n").filter(l => /not found/.test(l)).map(l => l.trim().split(/\s+/)[0]);
}
function extractLibs(libs) {
  const debs = path.join(HOME_DIR, "debs"), out = path.join(HOME_DIR, "libs"); fs.mkdirSync(debs, { recursive: true }); fs.mkdirSync(out, { recursive: true });
  const pkgs = new Set(); libs.forEach(l => (LIBMAP[l] || []).forEach(p => pkgs.add(p)));
  for (const group of new Set(libs.map(l => (LIBMAP[l] || []).join("|")))) {
    if (!group) continue;
    for (const p of group.split("|")) { const r = spawnSync("apt-get", ["download", p], { cwd: debs, encoding: "utf8" }); if (r.status === 0) break; }
  }
  for (const f of fs.readdirSync(debs).filter(f => f.endsWith(".deb"))) spawnSync("dpkg-deb", ["-x", path.join(debs, f), out]);
}

export async function setup(o) {
  o = o || {}; const cfg = readConfig();
  log(c.b("\nStickman Kino setup\n"));
  // 1. node + deps
  const major = +process.versions.node.split(".")[0]; if (major < 18) { fail(`Node ${process.versions.node} - need 18+`); return 1; } ok(`Node ${process.versions.node}`);
  if (!hyperframesBin()) { warn("node_modules missing - running npm install…"); spawnSync(isWin ? "npm.cmd" : "npm", ["install"], { cwd: ROOT, stdio: "inherit" }); }
  hyperframesBin() ? ok("HyperFrames renderer installed") : fail("HyperFrames not installed (npm install failed?)");
  ffmpegPath() ? ok("ffmpeg " + c.dim(ffmpegPath())) : fail("ffmpeg not found");
  ffprobePath() ? ok("ffprobe " + c.dim(ffprobePath())) : fail("ffprobe not found");
  // 2. browser
  let browser = findBrowsers()[0];
  if (!browser) {
    log(c.dim("No Chrome found - asking HyperFrames to download one…"));
    const r = hf(["browser", "ensure"], ROOT, { capture: true });
    const m = /(\/[^\s'"]+chrome[^\s'"]*)/i.exec((r.stdout || "") + (r.stderr || ""));
    if (m && fs.existsSync(m[1])) browser = m[1];
    else { const p = hf(["browser", "path"], ROOT, { capture: true }); const line = (p.stdout || "").trim().split("\n").pop(); if (line && fs.existsSync(line)) browser = line; }
  }
  if (browser) { cfg.browserPath = browser; ok("Chrome " + c.dim(browser)); }
  else warn("No Chrome yet. Install one (e.g. `npx playwright install chromium`) or set HYPERFRAMES_BROWSER_PATH, then re-run setup.");
  writeConfig(cfg);
  // 3. Linux: missing shared libs → extract locally without sudo
  if (browser && process.platform === "linux") {
    let miss = missingLibs(browser);
    if (miss.length && which("apt-get") && which("dpkg-deb")) {
      log(c.dim(`Chrome is missing ${miss.length} system libraries; extracting them into .stickman/libs (no sudo)…`));
      for (let pass = 0; pass < 3 && miss.length; pass++) { extractLibs(miss); miss = missingLibs(browser); }
    }
    miss.length ? warn("Chrome still misses: " + miss.join(", ") + "\n  Install with: sudo apt-get install -y libnss3 libnspr4 libasound2 libatk-bridge2.0-0 libgbm1 libxkbcommon0") : ok("Chrome shared libraries OK");
  }
  // 4. Kokoro TTS (local, free voice model)
  if (o.tts === false) log(c.dim("skipping voice setup (--no-tts)"));
  else {
    const py = path.join(venvBin(), isWin ? "python.exe" : "python");
    const haveKokoro = () => fs.existsSync(py) && spawnSync(py, ["-c", "import kokoro_onnx, soundfile"], { encoding: "utf8" }).status === 0;
    if (haveKokoro()) ok("Kokoro voice engine ready");
    else {
      const uv = which("uv") || [path.join(os.homedir(), ".local", "bin", isWin ? "uv.exe" : "uv"), path.join(os.homedir(), ".cargo", "bin", "uv")].find(p => fs.existsSync(p));
      const venv = path.join(HOME_DIR, "venv");
      log(c.dim("Installing the Kokoro voice engine into .stickman/venv (one-off, ~200 MB)…"));
      if (uv) { spawnSync(uv, ["venv", "-q", "-p", "3.12", venv], { stdio: "inherit" }); spawnSync(uv, ["pip", "install", "-q", "kokoro-onnx", "soundfile"], { stdio: "inherit", env: Object.assign({}, process.env, { VIRTUAL_ENV: venv }) }); }
      else { const sys = which("python3") || which("python"); if (sys) { spawnSync(sys, ["-m", "venv", venv], { stdio: "inherit" }); spawnSync(path.join(venvBin(), isWin ? "pip.exe" : "pip"), ["install", "-q", "kokoro-onnx", "soundfile"], { stdio: "inherit" }); } }
      haveKokoro() ? ok("Kokoro voice engine ready") : warn("Kokoro could not be installed. Install `uv` (https://docs.astral.sh/uv/) and re-run, or use voice.provider \"say\" / \"espeak\" / \"files\" / \"none\".");
    }
  }
  log(c.b("\nDone.") + " Try: " + c.cy(fs.existsSync(path.join(process.cwd(), "samples", "hello-stickman")) ? "stickman build samples/hello-stickman" : "stickman new my-film && stickman build my-film") + "\n");
  return 0;
}

export function doctor() {
  log(c.b("\nStickman Kino doctor\n")); let bad = 0;
  const chk = (cond, good, badMsg) => { if (cond) ok(good); else { fail(badMsg); bad++; } };
  chk(+process.versions.node.split(".")[0] >= 18, `Node ${process.versions.node}`, `Node ${process.versions.node} (need 18+)`);
  chk(hyperframesBin(), "HyperFrames installed", "HyperFrames missing → npm install");
  chk(gsapPath(), "GSAP installed", "GSAP missing → npm install");
  chk(ffmpegPath(), "ffmpeg", "ffmpeg missing");
  chk(ffprobePath(), "ffprobe", "ffprobe missing");
  const b = findBrowsers()[0]; chk(b, "Chrome " + c.dim(b || ""), "Chrome not found → stickman setup");
  if (b && process.platform === "linux") { const m = missingLibs(b); chk(!m.length, "Chrome libraries", "Chrome missing libs: " + m.join(", ") + " → stickman setup"); }
  const py = path.join(venvBin(), isWin ? "python.exe" : "python");
  const tts = fs.existsSync(py) && spawnSync(py, ["-c", "import kokoro_onnx"], { encoding: "utf8" }).status === 0;
  tts ? ok("Kokoro TTS") : warn("Kokoro TTS not installed (optional) → stickman setup");
  log(""); return bad ? 1 : 0;
}
