// Stickman Kino - environment + tool resolution (ffmpeg, ffprobe, Chrome, Kokoro venv, HyperFrames)
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const HOME_DIR = path.join(ROOT, ".stickman");          // per-clone tool cache (gitignored)
export const CONFIG = path.join(HOME_DIR, "config.json");
export const isWin = process.platform === "win32";

export function readConfig() { try { return JSON.parse(fs.readFileSync(CONFIG, "utf8")); } catch { return {}; } }
export function writeConfig(c) { fs.mkdirSync(HOME_DIR, { recursive: true }); fs.writeFileSync(CONFIG, JSON.stringify(c, null, 2)); }

export function ffmpegPath() { try { const p = require("ffmpeg-static"); if (p && fs.existsSync(p)) return p; } catch {} return which("ffmpeg"); }
export function ffprobePath() { try { const p = require("@ffprobe-installer/ffprobe").path; if (p && fs.existsSync(p)) return p; } catch {} return which("ffprobe"); }
export function hyperframesBin() {
  const local = path.join(ROOT, "node_modules", ".bin", isWin ? "hyperframes.cmd" : "hyperframes");
  if (fs.existsSync(local)) return local;
  // installed from npm: the dependency may be hoisted next to this package
  try {
    const pj = require.resolve("hyperframes/package.json"), meta = JSON.parse(fs.readFileSync(pj, "utf8"));
    const rel = typeof meta.bin === "string" ? meta.bin : (meta.bin && (meta.bin.hyperframes || Object.values(meta.bin)[0]));
    if (rel) { const js = path.join(path.dirname(pj), rel); if (fs.existsSync(js)) return js; }
  } catch {}
  const hoisted = path.join(ROOT, "..", ".bin", isWin ? "hyperframes.cmd" : "hyperframes");
  return fs.existsSync(hoisted) ? hoisted : null;
}
export function gsapPath() {
  try { return require.resolve("gsap/dist/gsap.min.js"); } catch { return null; }
}
export function which(cmd) {
  const r = spawnSync(isWin ? "where" : "which", [cmd], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.split(/\r?\n/)[0].trim() : null;
}
export function venvBin() { return path.join(HOME_DIR, "venv", isWin ? "Scripts" : "bin"); }
export function libsDir() { return path.join(HOME_DIR, "libs", "usr", "lib", "x86_64-linux-gnu"); }

// candidate Chrome executables, best first
export function findBrowsers() {
  const out = [], cfg = readConfig();
  if (process.env.HYPERFRAMES_BROWSER_PATH) out.push(process.env.HYPERFRAMES_BROWSER_PATH);
  if (cfg.browserPath) out.push(cfg.browserPath);
  const pw = path.join(os.homedir(), isWin ? "AppData/Local/ms-playwright" : process.platform === "darwin" ? "Library/Caches/ms-playwright" : ".cache/ms-playwright");
  try {
    for (const d of fs.readdirSync(pw).sort().reverse()) {
      for (const rel of ["chrome-linux64/chrome", "chrome-linux/chrome", "chrome-headless-shell-linux64/chrome-headless-shell", "chrome-win64/chrome.exe", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"]) {
        const p = path.join(pw, d, rel); if (fs.existsSync(p)) out.push(p);
      }
    }
  } catch {}
  return [...new Set(out)].filter(p => fs.existsSync(p));
}

export function toolEnv(extra) {
  const env = Object.assign({}, process.env, {
    HYPERFRAMES_NO_TELEMETRY: "1", HYPERFRAMES_SKIP_SKILLS: "1", DO_NOT_TRACK: "1"
  }, extra || {});
  const ff = ffmpegPath(), fp = ffprobePath();
  if (ff && !env.HYPERFRAMES_FFMPEG_PATH) env.HYPERFRAMES_FFMPEG_PATH = ff;
  if (fp && !env.HYPERFRAMES_FFPROBE_PATH) env.HYPERFRAMES_FFPROBE_PATH = fp;
  const cfg = readConfig();
  if (!env.HYPERFRAMES_BROWSER_PATH && cfg.browserPath && fs.existsSync(cfg.browserPath)) env.HYPERFRAMES_BROWSER_PATH = cfg.browserPath;
  const sep = isWin ? ";" : ":";
  const pathAdd = [venvBin(), ff && path.dirname(ff), fp && path.dirname(fp)].filter(p => p && fs.existsSync(p));
  env.PATH = pathAdd.join(sep) + sep + (env.PATH || "");
  if (fs.existsSync(libsDir())) env.LD_LIBRARY_PATH = libsDir() + (env.LD_LIBRARY_PATH ? ":" + env.LD_LIBRARY_PATH : "");
  return env;
}

// run HyperFrames CLI inside a project folder; inherits stdio unless capture
export function hf(args, cwd, o) {
  o = o || {}; const bin = hyperframesBin();
  if (!bin) throw new Error("HyperFrames is not installed. Run `npm install` in the Stickman Kino folder.");
  const isJs = /\.(c|m)?js$/.test(bin), cmd = isJs ? process.execPath : bin, full = isJs ? [bin, ...args] : args;
  if (o.capture) return spawnSync(cmd, full, { cwd, env: toolEnv(), encoding: "utf8", shell: isWin && !isJs, maxBuffer: 64 * 1024 * 1024 });
  return new Promise((resolve) => {
    const p = spawn(cmd, full, { cwd, env: toolEnv(), stdio: o.stdio || "inherit", shell: isWin && !isJs });
    p.on("close", code => resolve(code));
  });
}

export function probeDuration(file) {
  const fp = ffprobePath(); if (!fp) throw new Error("ffprobe not found");
  const r = spawnSync(fp, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  return parseFloat(r.stdout) || 0;
}
export function ffmpeg(args) {
  const ff = ffmpegPath(); if (!ff) throw new Error("ffmpeg not found");
  const r = spawnSync(ff, ["-hide_banner", "-loglevel", "error", "-y", ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error("ffmpeg failed: " + (r.stderr || "").slice(0, 800));
  return r;
}
export const c = {
  b: s => `\x1b[1m${s}\x1b[0m`, dim: s => `\x1b[2m${s}\x1b[0m`, g: s => `\x1b[32m${s}\x1b[0m`, r: s => `\x1b[31m${s}\x1b[0m`, y: s => `\x1b[33m${s}\x1b[0m`, cy: s => `\x1b[36m${s}\x1b[0m`
};
export const log = (...a) => console.log(...a);
export const ok = s => console.log(c.g("✓ ") + s);
export const warn = s => console.log(c.y("! ") + s);
export const fail = s => console.log(c.r("✗ ") + s);
