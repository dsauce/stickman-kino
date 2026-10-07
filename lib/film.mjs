// Stickman Kino - film.json loading, timing, composition (index.html + film.js + engine copy)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { ROOT } from "./env.mjs";
import * as synth from "./synth.mjs";

export const FORMATS = { "16:9": [1920, 1080], "9:16": [1080, 1920], "1:1": [1080, 1080], "4:5": [1080, 1350], "4:3": [1440, 1080] };
export const WPS = 2.55; // words per second estimate for un-synthesised VO

export function loadFilm(dir) {
  const f = path.join(dir, "film.json");
  if (!fs.existsSync(f)) throw new Error(`No film.json in ${dir}. Create one with: stickman new <name>`);
  let film; try { film = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { throw new Error("film.json is not valid JSON: " + e.message); }
  const errs = validate(film); if (errs.length) throw new Error("film.json problems:\n  - " + errs.join("\n  - "));
  return film;
}
export function validate(film) {
  const e = [];
  if (!film || typeof film !== "object") return ["film.json must be an object"];
  if (!Array.isArray(film.clips) || !film.clips.length) e.push("`clips` must be a non-empty array");
  if (film.format && !FORMATS[film.format]) e.push("`format` must be one of " + Object.keys(FORMATS).join(", "));
  if (film.size && !(Array.isArray(film.size) && film.size.length === 2 && film.size.every(n => n > 0))) e.push("`size` must be [width, height]");
  const ids = new Set();
  (film.clips || []).forEach((c, i) => {
    if (!c.id || !/^[A-Za-z][\w-]*$/.test(c.id)) e.push(`clip #${i + 1}: \`id\` must start with a letter (letters, digits, - or _)`);
    if (ids.has(c.id)) e.push(`clip id "${c.id}" is duplicated`); ids.add(c.id);
    if (c.duration != null && c.duration !== "auto" && !(c.duration > 0)) e.push(`clip ${c.id}: duration must be a positive number or "auto"`);
    if (c.vo != null && typeof c.vo !== "string") e.push(`clip ${c.id}: vo must be a string`);
    (c.sfx || []).forEach((s, k) => { if (s.at == null || !s.name) e.push(`clip ${c.id}: sfx #${k + 1} needs { at, name }`); });
  });
  return e;
}
export const voHash = (text, voice) => crypto.createHash("sha1").update(JSON.stringify([text, voice.voice, voice.speed, voice.provider])).digest("hex").slice(0, 12);
export function voiceOf(film) { const v = film.voice || {}; return { provider: v.provider || "kokoro", voice: v.voice || "am_michael", speed: v.speed || 1, lang: v.lang }; }
export function readManifest(dir) { try { return JSON.parse(fs.readFileSync(path.join(dir, "assets", "audio.json"), "utf8")); } catch { return { vo: {}, sfx: {} }; } }
export function writeManifest(dir, m) { fs.mkdirSync(path.join(dir, "assets"), { recursive: true }); fs.writeFileSync(path.join(dir, "assets", "audio.json"), JSON.stringify(m, null, 2)); }

// default lengths + sound effects for intro/outro presets (seconds are local to the clip)
export const TITLE_PRESETS = {
  intro: {
    countdown: o => { const per = o.per || 0.62, n = o.from || 3, end = n * per; return { duration: end + 1.9, sfx: [...Array(n)].map((_, i) => ({ at: i * per, name: "beep", volume: 0.35 })).concat([{ at: 0, name: "projector", volume: 0.25 }, { at: end, name: "sting", volume: 0.5 }]) }; },
    clapper: o => ({ duration: (o.snapAt || 1.0) + 2.2, sfx: [{ at: 0.05, name: "whoosh", volume: 0.35 }, { at: o.snapAt || 1.0, name: "stamp", volume: 0.6 }, { at: (o.snapAt || 1.0) + 0.85, name: "sting", volume: 0.45 }] }),
    logo: () => ({ duration: 3.2, sfx: [{ at: 0.15, name: "sting", volume: 0.5 }, { at: 0.75, name: "sparkle", volume: 0.3 }] }),
    spotlight: () => ({ duration: 3.8, sfx: [{ at: 0.2, name: "whoosh", volume: 0.3 }, { at: 2.35, name: "riser", volume: 0.3 }, { at: 3.05, name: "sting", volume: 0.45 }] })
  },
  outro: {
    cta: o => ({ duration: 4.2, sfx: [{ at: 0, name: "chime", volume: 0.4 }].concat(o.cta ? [{ at: 0.85, name: "pop", volume: 0.45 }] : []) }),
    credits: o => ({ duration: (o.d || 6) + 0.8, sfx: [] }),
    endcard: () => ({ duration: 4.5, sfx: [{ at: 0.3, name: "swoosh", volume: 0.35 }, { at: 0.8, name: "pop", volume: 0.45 }] }),
    kino: o => ({ duration: 4.6, sfx: [{ at: 0, name: "sting", volume: 0.45 }].concat(o.cta === false ? [] : [{ at: 1.0, name: "pop", volume: 0.45 }]) })
  }
};
export function titlePreset(c) {
  for (const kind of ["intro", "outro"]) if (c[kind]) { const f = TITLE_PRESETS[kind][c[kind].style || (kind === "intro" ? "logo" : "cta")]; if (f) return f(c[kind]); }
  return null;
}

// resolve start/duration/vo timing for every clip
export function timings(film, manifest) {
  manifest = manifest || { vo: {} }; let t = 0;
  const clips = film.clips.map(c => {
    const voStart = c.voStart == null ? 0.4 : c.voStart;
    const m = manifest.vo && manifest.vo[c.id];
    const voDuration = c.vo ? (m && m.duration ? m.duration : c.vo.split(/\s+/).filter(Boolean).length / WPS) : 0;
    let duration = c.duration;
    const preset = titlePreset(c);
    if ((duration == null || duration === "auto") && preset && !c.vo) duration = preset.duration;
    if (duration == null || duration === "auto") duration = Math.max(c.minDuration || 3, Math.ceil((voStart + voDuration + (c.tail == null ? 0.6 : c.tail)) * 2) / 2);
    const out = Object.assign({}, c, { start: +t.toFixed(3), duration: +(+duration).toFixed(3), voStart, voDuration: +voDuration.toFixed(3), voEstimated: !(m && m.duration) });
    t += out.duration; return out;
  });
  return { clips, total: +t.toFixed(3) };
}

export function copyEngine(dir) {
  const dst = path.join(dir, ".sm"); fs.mkdirSync(path.join(dst, "fonts"), { recursive: true });
  const eng = path.join(ROOT, "engine");
  for (const f of fs.readdirSync(eng)) { const p = path.join(eng, f); if (fs.statSync(p).isFile()) fs.copyFileSync(p, path.join(dst, f)); }
  for (const f of fs.readdirSync(path.join(eng, "fonts"))) fs.copyFileSync(path.join(eng, "fonts", f), path.join(dst, "fonts", f));
  const gsap = path.join(ROOT, "node_modules", "gsap", "dist", "gsap.min.js");
  if (!fs.existsSync(gsap)) throw new Error("GSAP not found - run `npm install` in the Stickman Kino folder.");
  fs.copyFileSync(gsap, path.join(dst, "gsap.min.js"));
  return dst;
}
export const ENGINE_FILES = ["sm-core.js", "sm-rig.js", "sm-props.js", "sm-type.js", "sm-charts.js", "sm-fx.js", "sm-world.js", "sm-titles.js"];

function ensureSfx(dir, names, manifest) {
  manifest.sfx = manifest.sfx || {};
  for (const n of names) {
    if (/[\/\\.]/.test(n)) continue; // user file path
    const rel = `assets/sfx/${n}.wav`, abs = path.join(dir, rel);
    if (!fs.existsSync(abs)) synth.sfx(n, abs);
    manifest.sfx[n] = { file: rel, duration: synth.SR ? null : null };
  }
}
const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function compose(dir, o) {
  o = o || {}; const film = loadFilm(dir), manifest = readManifest(dir), { clips, total } = timings(film, manifest);
  const [W, H] = Array.isArray(film.size) ? film.size : FORMATS[film.format || "16:9"];
  copyEngine(dir);
  // sound effects (synthesised on demand)
  clips.forEach(c => { const p = titlePreset(c), t = c.intro || c.outro; if (p && !(t && t.sfx === false)) c.sfx = (c.sfx || []).concat(p.sfx); });
  const sfxNames = new Set(); clips.forEach(c => (c.sfx || []).forEach(s => sfxNames.add(s.name))); (film.sfx || []).forEach(s => sfxNames.add(s.name));
  ensureSfx(dir, sfxNames, manifest); writeManifest(dir, manifest);
  // film.js - runtime metadata for the engine (theme, timings, VO text for cue/captions)
  const meta = { title: film.title, format: film.format || "16:9", theme: film.theme || "light", captions: film.captions || false, total, clips: clips.map(c => ({ id: c.id, start: c.start, duration: c.duration, vo: c.vo || "", voStart: c.voStart, voDuration: c.voDuration, label: c.label || "", intro: c.intro, outro: c.outro })) };
  fs.writeFileSync(path.join(dir, "film.js"), "/* generated by `stickman compose` - do not edit */\nwindow.SM_FILM = " + JSON.stringify(meta, null, 1) + ";\n");
  // audio tags
  const audio = []; const tracks = {};
  const place = (id, src, start, dur, vol, group) => {
    let tr = group === "music" ? 20 : group === "vo" ? 21 : 22;
    if (group === "sfx") { while (tracks[tr] != null && tracks[tr] > start - 0.001) tr++; tracks[tr] = start + dur; }
    audio.push(`    <audio id="${esc(id)}" src="${esc(src)}" data-start="${start.toFixed(3)}" data-duration="${dur.toFixed(3)}" data-track-index="${tr}" data-volume="${vol}" preload="auto"></audio>`);
  };
  const mus = film.music || {};
  const musicFile = mus.file || (manifest.music && manifest.music.file);
  if (musicFile && mus.style !== "none" && fs.existsSync(path.join(dir, musicFile))) place("music-bed", musicFile, 0, total, mus.volume == null ? 1 : mus.volume, "music");
  clips.forEach(c => { const m = manifest.vo && manifest.vo[c.id]; if (c.vo && m && m.file && fs.existsSync(path.join(dir, m.file))) place("vo-" + c.id, m.file, c.start + c.voStart, m.duration, film.voice && film.voice.volume != null ? film.voice.volume : 1, "vo"); });
  const sfxDur = n => { const f = /[\/\\.]/.test(n) ? n : `assets/sfx/${n}.wav`; const st = fs.existsSync(path.join(dir, f)) ? fs.statSync(path.join(dir, f)).size : 0; return { f, d: Math.max(0.05, (st - 44) / (44100 * 4)) }; };
  let k = 0;
  clips.forEach(c => (c.sfx || []).forEach(s => { const { f, d } = sfxDur(s.name); place(`sfx-${c.id}-${k++}`, f, c.start + s.at, d, s.volume == null ? 0.5 : s.volume, "sfx"); }));
  (film.sfx || []).forEach(s => { const { f, d } = sfxDur(s.name); place(`sfx-g-${k++}`, f, s.at, d, s.volume == null ? 0.5 : s.volume, "sfx"); });
  const sections = clips.map(c => `    <section id="${esc(c.id)}" class="clip" data-start="${c.start}" data-duration="${c.duration}" data-track-index="1" data-label="${esc(c.label || c.beat || c.id)}"></section>`).join("\n");
  const scenesPath = path.join(dir, "scenes.js");
  if (!fs.existsSync(scenesPath)) throw new Error("scenes.js is missing in " + dir);
  const scenesSrc = fs.readFileSync(scenesPath, "utf8").replace(/<\/script/gi, "<\\/script");
  const scripts = ENGINE_FILES.map(f => `  <script src=".sm/${f}"></script>`).join("\n");
  const html = `<!DOCTYPE html>
<!-- generated by \`stickman compose\` from film.json - edit film.json / scenes.js, not this file -->
<html lang="${esc(film.lang || "en")}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${W}, height=${H}">
  <title>${esc(film.title || "Stickman Kino film")}</title>
  <link rel="stylesheet" href=".sm/sm.css">
  <script src=".sm/gsap.min.js"></script>
${scripts}
  <script src="film.js"></script>
</head>
<body>
  <div id="root" data-composition-id="stickman" data-start="0" data-width="${W}" data-height="${H}" data-duration="${total}" style="width:${W}px;height:${H}px">
${sections}
${audio.join("\n")}
  </div>
  <script>
/* ---- scenes.js (inlined by stickman compose; edit scenes.js, not this block) ---- */
${scenesSrc}
  </script>
  <script>
    // HyperFrames contract: the film timeline is registered on window.__timelines[compositionId]
    window.__timelines = window.__timelines || {};
    if (window.SM && !SM.current && (window.SM_FILM.clips || []).some(c => c.intro || c.outro)) SM.film();
    if (window.SM && SM.current) { SM.current.finish(); window.__timelines["stickman"] = SM.current.tl; }
  </script>
</body>
</html>
`;
  fs.writeFileSync(path.join(dir, "index.html"), html);
  return { film, clips, total, W, H, audioTags: audio.length };
}

// --------------------------------------------------------------- project scaffold
export function scaffold(dir, o) {
  o = o || {}; if (fs.existsSync(path.join(dir, "film.json")) && !o.force) throw new Error(`${dir} already has a film.json (use --force to overwrite)`);
  fs.mkdirSync(dir, { recursive: true });
  const n = o.clips || 3, fmt = o.format || "16:9";
  const film = {
    $schema: path.relative(dir, path.join(ROOT, "schema", "film.schema.json")).split(path.sep).join("/"),
    title: o.title || path.basename(dir),
    format: fmt, theme: o.theme || "light",
    voice: { provider: "kokoro", voice: o.voice || "am_michael", speed: 1 },
    music: { style: o.music || "calm-piano", volume: 1 },
    captions: false,
    clips: [{ id: "intro", label: "Intro", intro: { style: o.intro || "logo", title: o.title || path.basename(dir), subtitle: "a Stickman Kino film" } }]
      .concat(Array.from({ length: n }, (_, i) => ({ id: "c" + (i + 1), label: ["Hook", "Problem", "Turn", "Payoff", "Close"][i] || "Beat " + (i + 1), duration: "auto", vo: i === 0 ? "Here is a stick figure with a big idea." : i === n - 1 ? "And that is how one small step changes everything." : "It walks, it points, it thinks, and the story moves on.", sfx: [] })))
      .concat([{ id: "outro", label: "Outro", outro: { style: o.outro || "cta", title: "Thanks for [watching]", tagline: "made with Stickman Kino", cta: "Subscribe" } }])
  };
  fs.writeFileSync(path.join(dir, "film.json"), JSON.stringify(film, null, 2) + "\n");
  const scenes = `// scenes.js - choreography for each clip in film.json. Times are LOCAL to the clip (seconds).
// Engine reference: docs/engine-api.md · Recipes: skills/stickman-animator/references/cookbook.md
// The "intro" and "outro" clips are presets declared in film.json - no code needed (override with film.scene("intro", …)).
const film = SM.film();

film.scene("c1", sc => {
  sc.ground();
  const bob = sc.figure({ x: -150, character: "classic" });
  const t = bob.walkTo(sc.W * 0.4, 0.2);          // returns the time the walk ends
  bob.wave(t);
  const idea = sc.prop("lightbulb", { x: sc.W * 0.4 + 40, y: sc.groundY - 420, size: 130, hidden: true });
  idea.pop(sc.cue("idea"));                        // pops when the narrator says "idea"
  idea.glow(sc.cue("idea") + 0.4);
  sc.text("A big idea", { x: sc.W * 0.72, y: sc.H * 0.3, size: 84 }).in(1.0, "words");
  sc.exit("wipe-left");
});

film.scene("c2", sc => {
  sc.enter("wipe-left");
  sc.ground();
  const bob = sc.figure({ x: sc.W * 0.3 });
  bob.point(sc.W * 0.7, sc.H * 0.4, 0.8);
  const chart = sc.barChart({ x: sc.W * 0.68, y: sc.H * 0.45, w: 700, h: 420, data: [{ label: "A", value: 3 }, { label: "B", value: 5 }, { label: "C", value: 9 }] });
  chart.grow(1.0);
  bob.think(3.4);
});
${n > 2 ? Array.from({ length: n - 2 }, (_, i) => `
film.scene("c${i + 3}", sc => {
  sc.ground();
  const bob = sc.figure({ x: sc.W * 0.5, character: "zeke" });
  bob.celebrate(0.6);
  sc.title("${i + 3 === n ? "The end" : "Next beat"}", { y: sc.H * 0.28 }).in(0.4);
});
`).join("") : ""}`;
  fs.writeFileSync(path.join(dir, "scenes.js"), scenes);
  fs.writeFileSync(path.join(dir, "storyboard.md"), `# ${film.title} - storyboard\n\n| Clip | Beat | On screen | VO | SFX / music |\n|---|---|---|---|---|\n${film.clips.map(c => `| ${c.id} | ${c.label} | ${c.intro ? "intro preset: " + c.intro.style : c.outro ? "outro preset: " + c.outro.style : ""} | ${c.vo || ""} | |`).join("\n")}\n`);
  fs.writeFileSync(path.join(dir, ".gitignore"), ".sm/\nindex.html\nfilm.js\nrenders/\nsnapshots/\nassets/vo/\nassets/music/\nassets/sfx/\nassets/audio.json\n");
  return film;
}
