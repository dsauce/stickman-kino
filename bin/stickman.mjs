#!/usr/bin/env node
// Stickman Kino CLI - stickman <command> [dir] [options]
import fs from "node:fs";
import path from "node:path";
import { ROOT, hf, ffmpeg, probeDuration, ok, warn, fail, log, c } from "../lib/env.mjs";

const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;
const argv = process.argv.slice(2);
const cmd = argv[0];
const pos = [], opt = {};
for (let i = 1; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) { const [k, v] = a.slice(2).split("="); if (v !== undefined) opt[k] = v; else if (argv[i + 1] && !argv[i + 1].startsWith("-")) opt[k] = argv[++i]; else opt[k] = true; }
  else if (a === "-o") opt.out = argv[++i];
  else pos.push(a);
}
const dirArg = () => path.resolve(pos[0] || ".");
const passthrough = () => { const i = argv.indexOf("--"); return i >= 0 ? argv.slice(i + 1) : []; };

const HELP = `
${c.b("Stickman Kino")} ${c.dim("v" + VERSION)} - stickman films, directed by your AI agent, rendered as code.

${c.b("Make a film")}
  stickman new <dir> [--format 16:9|9:16|1:1|4:5] [--theme light] [--clips 3] [--music pop] [--voice am_michael] [--intro countdown|clapper|logo|spotlight] [--outro cta|credits|endcard|kino]
  stickman build <dir> [--quality draft|looks|delivery] [--no-render]   audio → compose → check → render
  stickman audio <dir> [--force] [--provider kokoro|say|espeak|files|none]
  stickman compose <dir>                         write index.html + film.js + engine copy
  stickman check <dir>                           lint + runtime + layout checks (HyperFrames)
  stickman snapshot <dir> [--at 1,4.5,9]         PNG frames + contact sheet for visual review
  stickman preview <dir>                         live studio in the browser
  stickman render <dir> [--quality draft|looks|delivery] [--out file.mp4] [--format mp4|webm|gif] [--fps 30]
  stickman gif <dir> [--from 0 --to 8 --width 640 --fps 12]   README-ready GIF from the render
  stickman poster <dir> [--at 3]                 JPG still from the render
  stickman prompts <dir>                         export text-to-video prompts (Gemini/Veo/Sora/Kling)

${c.b("Assets & catalogue")}
  stickman list props|poses|characters|themes|transitions|intros|outros|music|sfx
  stickman music --style uplifting --duration 30 -o bed.wav
  stickman sfx pop -o pop.wav

${c.b("Setup")}
  stickman setup [--no-tts]                      Chrome libs, Kokoro voice, config
  stickman doctor                                check the toolchain
  stickman install-skills [--target all|claude|codex|agents] [--project <dir>]
`;

async function main() {
  switch (cmd) {
    case undefined: case "help": case "--help": case "-h": log(HELP); return 0;
    case "version": case "--version": case "-v": log(VERSION); return 0;
    case "setup": { const { setup } = await import("../lib/setup.mjs"); return setup({ tts: !opt["no-tts"] }); }
    case "doctor": { const { doctor } = await import("../lib/setup.mjs"); return doctor(); }
    case "install-skills": { const { installSkills } = await import("../lib/skills.mjs"); installSkills({ target: opt.target, project: opt.project }); return 0; }
    case "new": {
      const { scaffold } = await import("../lib/film.mjs"); const dir = dirArg();
      scaffold(dir, { format: opt.format, theme: opt.theme, clips: opt.clips ? +opt.clips : 3, music: opt.music, voice: opt.voice, title: opt.title, intro: opt.intro, outro: opt.outro, force: !!opt.force });
      ok(`created ${path.relative(process.cwd(), dir) || "."}/ (film.json, scenes.js, storyboard.md)`);
      log(`next: edit film.json + scenes.js, then ${c.cy("stickman build " + (pos[0] || "."))}`); return 0;
    }
    case "audio": { const { buildAudio } = await import("../lib/audio.mjs"); await buildAudio(dirArg(), { force: !!opt.force, provider: opt.provider }); return 0; }
    case "compose": { const { compose } = await import("../lib/film.mjs"); const r = compose(dirArg()); ok(`composed ${r.clips.length} clips · ${r.total.toFixed(2)}s · ${r.W}×${r.H} · ${r.audioTags} audio tracks`); return 0; }
    case "check": { const { compose } = await import("../lib/film.mjs"); compose(dirArg()); return hf(["check", ...passthrough()], dirArg()); }
    case "snapshot": {
      const { compose } = await import("../lib/film.mjs"); const r = compose(dirArg());
      let at = opt.at; if (!at) { at = r.clips.flatMap(cl => [cl.start + Math.min(1.2, cl.duration * 0.3), cl.start + cl.duration * 0.75]).map(v => v.toFixed(2)).join(","); }
      return hf(["snapshot", "--at", String(at), ...passthrough()], dirArg());
    }
    case "preview": { const { compose } = await import("../lib/film.mjs"); compose(dirArg()); return hf(["preview", ...passthrough()], dirArg()); }
    case "render": {
      const { compose, loadFilm } = await import("../lib/film.mjs"); const dir = dirArg(); compose(dir);
      const film = loadFilm(dir), fmt = opt.format || "mp4", slug = path.basename(dir);
      const out = path.resolve(opt.out || path.join(dir, "renders", `${slug}.${fmt === "gif" ? "gif" : fmt}`)); fs.mkdirSync(path.dirname(out), { recursive: true });
      const args = ["render", "--quality", opt.quality || "looks", "--output", out, "--fps", String(opt.fps || film.fps || 30)];
      if (fmt !== "mp4") args.push("--format", fmt); if (opt.workers) args.push("--workers", String(opt.workers));
      const code = await hf(args.concat(passthrough()), dir);
      if (code === 0) ok(`rendered ${path.relative(process.cwd(), out)}`); return code;
    }
    case "build": {
      const dir = dirArg(); const { buildAudio } = await import("../lib/audio.mjs"); const { compose } = await import("../lib/film.mjs");
      await buildAudio(dir, { force: !!opt.force, provider: opt.provider });
      const r = compose(dir); ok(`composed ${r.clips.length} clips · ${r.total.toFixed(2)}s`);
      const chk = await hf(["check"], dir); if (chk !== 0 && !opt["ignore-check"]) { fail("check failed - fix the errors above (or pass --ignore-check)"); return chk; }
      if (opt["no-render"]) return 0;
      const slug = path.basename(dir), out = path.join(dir, "renders", `${slug}.mp4`); fs.mkdirSync(path.dirname(out), { recursive: true });
      const code = await hf(["render", "--quality", opt.quality || "looks", "--output", out, "--fps", String(opt.fps || 30)], dir);
      if (code === 0) ok(`film ready → ${path.relative(process.cwd(), out)}`); return code;
    }
    case "gif": {
      const dir = dirArg(), src = opt.src || path.join(dir, "renders", path.basename(dir) + ".mp4"); if (!fs.existsSync(src)) { fail("render the film first: " + src); return 1; }
      const out = path.resolve(opt.out || src.replace(/\.mp4$/, ".gif")), from = +(opt.from || 0), to = opt.to ? +opt.to : Math.min(probeDuration(src), from + 10), w = opt.width || 640, fps = opt.fps || 12;
      const pal = out + ".palette.png";
      ffmpeg(["-ss", String(from), "-t", String(to - from), "-i", src, "-vf", `fps=${fps},scale=${w}:-1:flags=lanczos,palettegen=stats_mode=diff`, pal]);
      ffmpeg(["-ss", String(from), "-t", String(to - from), "-i", src, "-i", pal, "-lavfi", `fps=${fps},scale=${w}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4`, out]);
      fs.unlinkSync(pal); ok(`gif → ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)`); return 0;
    }
    case "poster": {
      const dir = dirArg(), src = path.join(dir, "renders", path.basename(dir) + ".mp4"); if (!fs.existsSync(src)) { fail("render the film first"); return 1; }
      const out = path.resolve(opt.out || src.replace(/\.mp4$/, ".jpg")); ffmpeg(["-ss", String(opt.at || 3), "-i", src, "-frames:v", "1", "-q:v", "2", out]); ok("poster → " + path.relative(process.cwd(), out)); return 0;
    }
    case "prompts": { const { exportPrompts } = await import("../lib/prompts.mjs"); const f = exportPrompts(dirArg(), { out: opt.out }); ok("prompts → " + path.relative(process.cwd(), f)); return 0; }
    case "music": {
      const synth = await import("../lib/synth.mjs");
      if (opt.list || !opt.style) { for (const [k, v] of Object.entries(synth.STYLES)) log(`  ${c.b(k.padEnd(12))} ${v.bpm} bpm  ${c.dim(v.desc)}`); return 0; }
      const out = path.resolve(opt.out || `${opt.style}.wav`); synth.music(out, { style: opt.style, duration: +(opt.duration || 30), bpm: opt.bpm ? +opt.bpm : undefined, key: opt.key, seed: opt.seed ? +opt.seed : undefined }); ok("music → " + out); return 0;
    }
    case "sfx": {
      const synth = await import("../lib/synth.mjs");
      if (!pos[0] || opt.list) { log("  " + synth.SFX.join(", ")); return 0; }
      const out = path.resolve(opt.out || `${pos[0]}.wav`); synth.sfx(pos[0], out); ok("sfx → " + out); return 0;
    }
    case "list": {
      const what = pos[0] || "props", eng = f => fs.readFileSync(path.join(ROOT, "engine", f), "utf8");
      const grab = (src, re) => [...src.matchAll(re)].map(m => m[1]);
      if (what === "props") { const n = grab(eng("sm-props.js"), /def\("([\w-]+)"/g).sort(); log(`${n.length} props:\n  ` + n.join(", ")); }
      else if (what === "poses") { const blk = eng("sm-rig.js").split("const POSES")[1].split("};")[0]; const n = grab(blk, /^\s{4}(\w+):/gm); log(`${n.length} poses:\n  ` + n.join(", ")); }
      else if (what === "characters") { const blk = eng("sm-rig.js").split("SM.characters = {")[1].split("};")[0]; log("  " + grab(blk, /^\s{4}(\w+):/gm).join(", ")); }
      else if (what === "themes") { const blk = eng("sm-core.js").split("SM.themes = {")[1].split("};")[0]; log("  " + grab(blk, /^\s{4}(\w+):/gm).join(", ")); }
      else if (what === "intros" || what === "outros") { const m = new RegExp(`SM\\.${what} = \\[([^\\]]+)\\]`).exec(eng("sm-titles.js")); log("  " + m[1].replace(/"/g, "")); }
      else if (what === "transitions") { const m = /SM\.transitions = \[([^\]]+)\]/.exec(eng("sm-fx.js")); log("  " + m[1].replace(/"/g, "")); }
      else if (what === "music") { const synth = await import("../lib/synth.mjs"); for (const [k, v] of Object.entries(synth.STYLES)) log(`  ${c.b(k.padEnd(12))} ${c.dim(v.desc)}`); }
      else if (what === "sfx") { const synth = await import("../lib/synth.mjs"); log("  " + synth.SFX.join(", ")); }
      else { fail("list what? props | poses | characters | themes | transitions | intros | outros | music | sfx"); return 1; }
      return 0;
    }
    default: fail(`unknown command "${cmd}"`); log(HELP); return 1;
  }
}
main().then(code => process.exit(code || 0)).catch(e => { fail(e.message); if (process.env.STICKMAN_DEBUG) console.error(e); process.exit(1); });
