// Stickman Kino - audio build: voice-over (Kokoro / say / espeak / your files), music bed, sound effects
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { hf, ffmpeg, probeDuration, which, ok, warn, log, c } from "./env.mjs";
import { loadFilm, readManifest, writeManifest, timings, voiceOf, voHash, titlePreset } from "./film.mjs";
import * as synth from "./synth.mjs";

function loudnorm(src, dst, lufs) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  ffmpeg(["-i", src, "-af", `highpass=f=60,loudnorm=I=${lufs}:TP=-1.5:LRA=11`, "-ar", "44100", "-ac", "2", dst]);
}

function tts(provider, text, voice, out, dir) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (provider === "kokoro") {
    const args = ["tts", text, "-v", voice.voice, "-s", String(voice.speed), "-o", out].concat(voice.lang ? ["-l", voice.lang] : []);
    let r = hf(args, dir, { capture: true });
    if (r.status !== 0 || !fs.existsSync(out)) r = hf(args, dir, { capture: true }); // one retry (first-run model download / file locks)
    if (r.status !== 0 || !fs.existsSync(out)) throw new Error("Kokoro TTS failed. Run `stickman setup` (installs the local voice model) or set voice.provider to \"say\", \"espeak\" or \"files\".\n" + (r.stderr || r.stdout || "").slice(-600));
    return;
  }
  if (provider === "say") { // macOS
    const aiff = out.replace(/\.wav$/, ".aiff"); const r = spawnSync("say", ["-v", voice.voice || "Samantha", "-r", String(Math.round(180 * voice.speed)), "-o", aiff, text]);
    if (r.status !== 0) throw new Error("`say` failed (macOS only)"); ffmpeg(["-i", aiff, out]); fs.unlinkSync(aiff); return;
  }
  if (provider === "espeak") {
    const bin = which("espeak-ng") || which("espeak"); if (!bin) throw new Error("espeak-ng not found");
    const r = spawnSync(bin, ["-v", voice.voice || "en-us", "-s", String(Math.round(165 * voice.speed)), "-w", out, text]); if (r.status !== 0) throw new Error("espeak failed"); return;
  }
  throw new Error("unknown voice provider " + provider);
}

export async function buildAudio(dir, o) {
  o = o || {}; const film = loadFilm(dir), manifest = readManifest(dir), voice = voiceOf(film);
  manifest.vo = manifest.vo || {};
  const provider = o.provider || voice.provider;
  // ---- voice-over
  if (provider === "none") { log(c.dim("voice: none (captions/text only)")); manifest.vo = {}; }
  else for (const clip of film.clips) {
    if (!clip.vo) { delete manifest.vo[clip.id]; continue; }
    const v = Object.assign({}, voice, clip.voice || {});
    const h = voHash(clip.vo, v), rel = `assets/vo/${clip.id}.wav`, abs = path.join(dir, rel);
    if (provider === "files") {
      if (!fs.existsSync(abs)) throw new Error(`voice.provider is "files" but ${rel} is missing`);
      manifest.vo[clip.id] = { file: rel, duration: probeDuration(abs), hash: "file" }; continue;
    }
    const cached = manifest.vo[clip.id];
    if (!o.force && cached && cached.hash === h && fs.existsSync(abs)) { log(c.dim(`vo ${clip.id}: cached (${cached.duration.toFixed(2)}s)`)); continue; }
    const raw = path.join(dir, "assets", "vo", "raw", clip.id + ".wav");
    process.stdout.write(`vo ${clip.id}: synthesising with ${provider}/${v.voice}… `);
    tts(provider, clip.vo, v, raw, dir);
    loudnorm(raw, abs, film.voice && film.voice.lufs || -16);
    const d = probeDuration(abs); manifest.vo[clip.id] = { file: rel, duration: +d.toFixed(3), hash: h };
    console.log(c.g(d.toFixed(2) + "s"));
  }
  writeManifest(dir, manifest);
  // ---- music (needs final length, which depends on VO durations)
  const { total, clips } = timings(film, manifest), mus = film.music || {};
  if (mus.file) { manifest.music = { file: mus.file, user: true }; log(c.dim("music: using " + mus.file)); }
  else if (mus.style && mus.style !== "none") {
    const rel = "assets/music/bed.wav", abs = path.join(dir, rel), key = JSON.stringify([mus.style, mus.bpm, mus.key, mus.seed, total]);
    if (o.force || !manifest.music || manifest.music.key !== key || !fs.existsSync(abs)) {
      const raw = path.join(dir, "assets", "music", "raw.wav");
      synth.music(raw, { style: mus.style, duration: total, bpm: mus.bpm, key: mus.key, seed: mus.seed });
      loudnorm(raw, abs, mus.lufs || -30); fs.unlinkSync(raw);
      manifest.music = { file: rel, style: mus.style, duration: total, key };
      ok(`music: ${mus.style} bed, ${total.toFixed(1)}s`);
    } else log(c.dim("music: cached"));
  } else delete manifest.music;
  // ---- sfx
  const names = new Set(); film.clips.forEach(cl => { (cl.sfx || []).forEach(s => names.add(s.name)); const p = titlePreset(cl); if (p) p.sfx.forEach(s => names.add(s.name)); }); (film.sfx || []).forEach(s => names.add(s.name));
  manifest.sfx = manifest.sfx || {};
  for (const n of names) { if (/[\/\\.]/.test(n)) continue; const rel = `assets/sfx/${n}.wav`; if (o.force || !fs.existsSync(path.join(dir, rel))) synth.sfx(n, path.join(dir, rel)); manifest.sfx[n] = { file: rel }; }
  if (names.size) ok(`sfx: ${[...names].join(", ")}`);
  writeManifest(dir, manifest);
  // ---- report
  const over = clips.filter(cl => !cl.voSpan && typeof cl.duration === "number" && film.clips.find(x => x.id === cl.id).duration !== "auto" && cl.voStart + cl.voDuration > cl.duration);
  over.forEach(cl => warn(`clip ${cl.id}: VO (${cl.voDuration.toFixed(2)}s from ${cl.voStart}s) runs past its ${cl.duration}s duration - use "auto" or lengthen it`));
  ok(`audio ready · film length ${total.toFixed(2)}s`);
  return { manifest, total };
}
