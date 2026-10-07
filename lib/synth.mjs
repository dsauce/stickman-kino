// Stickman Kino - procedural audio: music beds + sound effects, written as 16-bit WAV.
// Pure Node, deterministic (seeded), no samples → no licensing questions.
import fs from "node:fs";
import path from "node:path";

export const SR = 44100;

// ------------------------------------------------------------------ utils
function rng(seed) { let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const NOTE = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };

export function writeWav(file, L, R) {
  R = R || L; const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
}
function normalize(L, R, peak) {
  let m = 1e-9; for (let i = 0; i < L.length; i++) m = Math.max(m, Math.abs(L[i]), Math.abs(R ? R[i] : 0));
  const k = peak / m; for (let i = 0; i < L.length; i++) { L[i] *= k; if (R) R[i] *= k; }
}
function lowpass(x, cutoff) { const a = 1 - Math.exp(-2 * Math.PI * cutoff / SR); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; }
function highpass(x, cutoff) { const a = 1 - Math.exp(-2 * Math.PI * cutoff / SR); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = x[i] - y; } return x; }
function reverb(L, R, mix, size) {
  size = size || 1; const outL = new Float32Array(L.length), outR = new Float32Array(L.length);
  const combs = [1557, 1617, 1491, 1422].map(d => Math.round(d * size)), fb = 0.74, damp = 0.35;
  for (const [src, dst, off] of [[L, outL, 0], [R, outR, 23]]) {
    for (const d0 of combs) { const d = d0 + off, buf = new Float32Array(d); let idx = 0, lp = 0;
      for (let i = 0; i < src.length; i++) { const o = buf[idx]; lp = o * (1 - damp) + lp * damp; buf[idx] = src[i] + lp * fb; dst[i] += o * 0.25; idx = (idx + 1) % d; } }
  }
  for (let i = 0; i < L.length; i++) { L[i] = L[i] * (1 - mix) + outL[i] * mix; R[i] = R[i] * (1 - mix) + outR[i] * mix; }
}

// ------------------------------------------------------------------ voices
// each returns Float32Array mono for one note
const V = {
  piano(f, dur, amp) { const n = Math.floor((dur + 1.2) * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR, env = Math.exp(-t * 2.4) * (1 - Math.exp(-t * 600)); o[i] = amp * env * (Math.sin(2 * Math.PI * f * t) + 0.38 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 3) + 0.14 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 5) + 0.05 * Math.sin(8 * Math.PI * f * t) * Math.exp(-t * 7)); } return o; },
  rhodes(f, dur, amp) { const n = Math.floor((dur + 0.8) * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR, env = Math.exp(-t * 1.6) * (1 - Math.exp(-t * 300)) * (t > dur ? Math.exp(-(t - dur) * 6) : 1); o[i] = amp * env * (Math.sin(2 * Math.PI * f * t + 0.6 * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 4)) * (1 + 0.15 * Math.sin(2 * Math.PI * 4.5 * t))); } return o; },
  pad(f, dur, amp) { const n = Math.floor((dur + 1.5) * SR), o = new Float32Array(n), att = Math.min(1.2, dur * 0.4); for (let i = 0; i < n; i++) { const t = i / SR; let env = Math.min(1, t / att); if (t > dur) env *= Math.exp(-(t - dur) * 2.5); let s = 0; for (const dt of [1, 1.004, 0.996]) { const ph = (f * dt * t) % 1; s += 4 * Math.abs(ph - 0.5) - 1; } o[i] = amp * env * s / 3; } return lowpass(o, 1800); },
  pluck(f, dur, amp, rnd) { // Karplus-Strong
    const n = Math.floor((dur + 0.9) * SR), o = new Float32Array(n), p = Math.max(2, Math.round(SR / f)), buf = new Float32Array(p);
    for (let i = 0; i < p; i++) buf[i] = (rnd() * 2 - 1); let idx = 0;
    for (let i = 0; i < n; i++) { const nx = (idx + 1) % p, v = buf[idx]; buf[idx] = 0.996 * 0.5 * (v + buf[nx]); o[i] = amp * v; idx = nx; }
    return lowpass(o, 5000);
  },
  bell(f, dur, amp) { const n = Math.floor((dur + 1.5) * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR, a = 1 - Math.exp(-t * 900); o[i] = amp * a * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.2) + 0.5 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 4) + 0.25 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 7)); } return o; },
  bass(f, dur, amp) { const n = Math.floor((dur + 0.2) * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; let env = (1 - Math.exp(-t * 200)) * Math.exp(-t * 1.5); if (t > dur) env *= Math.exp(-(t - dur) * 30); o[i] = amp * env * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)); } return o; },
  pulse(f, dur, amp) { const n = Math.floor((dur + 0.15) * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; let env = (1 - Math.exp(-t * 400)) * Math.exp(-t * 6); if (t > dur) env *= Math.exp(-(t - dur) * 40); o[i] = amp * env * (((f * t) % 1) < 0.3 ? 1 : -1); } return lowpass(o, 2200); },
  strings(f, dur, amp) { const n = Math.floor((dur + 1.2) * SR), o = new Float32Array(n), att = Math.min(0.8, dur * 0.5); for (let i = 0; i < n; i++) { const t = i / SR; let env = Math.min(1, t / att); if (t > dur) env *= Math.exp(-(t - dur) * 3); let s = 0; for (const dt of [1, 1.003, 0.997, 2.001]) s += ((f * dt * t + 0.1 * Math.sin(2 * Math.PI * 5 * t) / f) % 1) * 2 - 1; o[i] = amp * env * s / 4 * (1 + 0.04 * Math.sin(2 * Math.PI * 5.5 * t)); } return lowpass(lowpass(o, 1600), 2400); },
  drone(f, dur, amp) { const n = Math.floor(dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR, env = Math.min(1, t / 2) * Math.min(1, (dur - t) / 2); o[i] = amp * env * (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.5 * t + Math.sin(t * 0.7))) * (0.8 + 0.2 * Math.sin(2 * Math.PI * 0.2 * t)); } return lowpass(o, 900); }
};
const D = {
  kick(amp) { const n = Math.floor(0.45 * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 45 + 95 * Math.exp(-t * 28); ph += 2 * Math.PI * f / SR; o[i] = amp * Math.sin(ph) * Math.exp(-t * 7); } return o; },
  snare(amp, rnd) { const n = Math.floor(0.25 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = amp * ((rnd() * 2 - 1) * 0.7 * Math.exp(-t * 18) + 0.4 * Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 25)); } return highpass(o, 400); },
  hat(amp, rnd, open) { const n = Math.floor((open ? 0.25 : 0.06) * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = amp * (rnd() * 2 - 1) * Math.exp(-t * (open ? 14 : 70)); } return highpass(highpass(o, 6000), 7000); },
  clap(amp, rnd) { const n = Math.floor(0.25 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR, b = [0, 0.012, 0.024].reduce((a, s) => a + (t >= s ? Math.exp(-(t - s) * 60) : 0), 0) + (t > 0.03 ? 0.5 * Math.exp(-(t - 0.03) * 16) : 0); o[i] = amp * (rnd() * 2 - 1) * b * 0.5; } return highpass(lowpass(o, 3000), 800); },
  snap(amp, rnd) { const n = Math.floor(0.08 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = amp * (rnd() * 2 - 1) * Math.exp(-t * 90); } return highpass(o, 2000); },
  tom(amp) { const n = Math.floor(0.6 * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 70 + 60 * Math.exp(-t * 10); ph += 2 * Math.PI * f / SR; o[i] = amp * Math.sin(ph) * Math.exp(-t * 4.5); } return o; },
  shaker(amp, rnd) { const n = Math.floor(0.09 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR, e = Math.sin(Math.PI * t / 0.09); o[i] = amp * (rnd() * 2 - 1) * e * e; } return highpass(o, 5000); },
  tick(amp) { const n = Math.floor(0.04 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = amp * Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 120); } return o; }
};

// ------------------------------------------------------------------ music styles
const CHORD = { maj: [0, 4, 7], min: [0, 3, 7], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], dom7: [0, 4, 7, 10], sus2: [0, 2, 7], sus4: [0, 5, 7] };
// progression entries: [semitones from key root, quality]
export const STYLES = {
  "calm-piano": { bpm: 84, key: "C", prog: [[0, "maj"], [9, "min"], [5, "maj"], [7, "maj"]], parts: ["pad", "pianoArp"], reverb: 0.28, desc: "Quiet, thoughtful piano + soft pad. Explainers, reflective stories." },
  uplifting:    { bpm: 112, key: "D", prog: [[0, "maj"], [7, "maj"], [9, "min"], [5, "maj"]], parts: ["pad", "pluckArp", "bass", "kick4", "clap24", "hat8"], reverb: 0.2, desc: "Bright plucks, steady kick. Product launches, wins, how-tos." },
  lofi:         { bpm: 78, key: "F", prog: [[0, "maj7"], [-1, "min7"], [-3, "min7"], [-5, "maj7"]], parts: ["rhodesChords", "bass", "lofiDrums", "crackle"], reverb: 0.22, desc: "Warm Rhodes + lazy drums. Study, productivity, chill essays." },
  corporate:    { bpm: 100, key: "G", prog: [[0, "maj"], [7, "maj"], [9, "min"], [5, "maj"]], parts: ["pulse8", "pianoChords", "bass", "kick4", "hat8"], reverb: 0.18, desc: "Driving pulse + piano. Business, B2B, data stories." },
  playful:      { bpm: 120, key: "C", prog: [[0, "maj"], [5, "maj"], [7, "maj"], [0, "maj"]], parts: ["ukulele", "glock", "pizzBass", "snap24", "shaker"], reverb: 0.15, desc: "Ukulele + glockenspiel + snaps. Comedy, kids, quirky explainers." },
  suspense:     { bpm: 70, key: "A", prog: [[0, "min"], [-4, "maj"], [5, "min"], [7, "maj"]], parts: ["drone", "pulseLow", "ticker", "strings"], reverb: 0.3, desc: "Low drone + ticking. Mysteries, risks, problem setups." },
  epic:         { bpm: 90, key: "D", prog: [[0, "min"], [-2, "maj"], [-4, "maj"], [-5, "maj"]], parts: ["strings", "pad", "taiko", "bass"], reverb: 0.3, desc: "Big strings + taiko. Climaxes, transformations, launches." },
  ambient:      { bpm: 60, key: "E", prog: [[0, "sus2"], [5, "sus2"], [-3, "min7"], [2, "sus4"]], parts: ["pad", "bellSparse"], reverb: 0.4, desc: "Airy pads + bells. Calm, wellness, space, intros." },
  pop:          { bpm: 116, key: "E", prog: [[0, "maj"], [7, "maj"], [9, "min"], [5, "maj"]], sections: true, reverb: 0.16, desc: "Catchy feel-good pop: whistle-pluck hook, claps, pumping bass. Product films, promos, social." }
};

export function music(file, o) {
  o = o || {}; const st = STYLES[o.style || "calm-piano"]; if (!st) throw new Error("unknown music style " + o.style + " (available: " + Object.keys(STYLES).join(", ") + ")");
  const dur = o.duration || 60, bpm = o.bpm || st.bpm, beat = 60 / bpm, bar = beat * 4, N = Math.ceil((dur + 2) * SR);
  const L = new Float32Array(N), R = new Float32Array(N), rnd = rng(o.seed || 7);
  const keyRoot = 48 + (NOTE[o.key || st.key] || 0);
  const mix = (buf, t0, amp, pan) => { const i0 = Math.floor(t0 * SR); pan = pan == null ? 0.5 : pan; const gl = Math.cos(pan * Math.PI / 2), gr = Math.sin(pan * Math.PI / 2); for (let i = 0; i < buf.length && i0 + i < N; i++) { if (i0 + i < 0) continue; L[i0 + i] += buf[i] * amp * gl * 1.41; R[i0 + i] += buf[i] * amp * gr * 1.41; } };
  const intro = 2 * bar, outroStart = dur - 2 * bar;
  const energy = t => t < intro ? 0.55 : t > outroStart ? 0.7 : 1;
  const hasFull = t => t >= intro && t < outroStart + bar;
  if (st.sections) { popArrangement(st, { mix, rnd, keyRoot, beat, bar, dur }); }
  let bi = st.sections ? 1e9 : 0;
  for (let t = 0; t < (st.sections ? -1 : dur + bar); t += bar, bi++) {
    const [deg, q] = st.prog[bi % st.prog.length], root = keyRoot + deg, notes = CHORD[q].map(n => root + n), e = energy(t);
    for (const part of st.parts) {
      switch (part) {
        case "pad": notes.forEach((m, k) => mix(V.pad(midi(m), bar + 0.3, 0.06), t, e, 0.35 + 0.1 * k)); mix(V.pad(midi(root - 12), bar + 0.3, 0.07), t, e, 0.5); break;
        case "pianoArp": { const arp = [notes[1], notes[2], (notes[3] || notes[0] + 12), notes[2] + 12, notes[1] + 12, notes[2], notes[0] + 12, notes[1]]; arp.forEach((m, j) => { if (t >= 4 || j % 2 === 0) mix(V.piano(midi(m + 12), 0.4, 0.09), t + j * beat / 2, e * (j % 2 ? 0.8 : 1), 0.3 + 0.4 * (j % 2)); }); if (hasFull(t)) mix(V.piano(midi(notes[2] + 24), 0.5, 0.04), t + 2 * beat, e, 0.6); break; }
        case "pianoChords": [0, 2.5].forEach(b => notes.forEach((m, k) => mix(V.piano(midi(m + 12), 0.6, 0.06), t + b * beat, e, 0.4 + 0.07 * k))); break;
        case "pluckArp": { const arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 24]; for (let j = 0; j < 8; j++) mix(V.pluck(midi(arp[j % 4]), 0.3, 0.16, rnd), t + j * beat / 2, e, 0.25 + 0.5 * (j % 2)); break; }
        case "rhodesChords": [0, 1.5, 3].forEach((b, j) => notes.forEach((m, k) => mix(V.rhodes(midi(m + 12), beat * (j === 1 ? 1.4 : 1.2), 0.06), t + b * beat + (k * 0.012), e, 0.4 + 0.06 * k))); break;
        case "bass": if (hasFull(t) || st.parts.includes("lofiDrums")) [0, 1.5, 2, 3.5].forEach((b, j) => mix(V.bass(midi(root - 12 + (j === 3 ? 7 : 0)), beat * 0.45, 0.22), t + b * beat, e, 0.5)); break;
        case "pizzBass": [0, 1, 2, 3].forEach(b => mix(V.pluck(midi(root - 12 + (b % 2 ? 7 : 0)), 0.2, 0.25, rnd), t + b * beat, e, 0.5)); break;
        case "pulse8": if (t >= bar) for (let j = 0; j < 8; j++) mix(V.pulse(midi(notes[j % 2 ? 2 : 0] + 12), beat * 0.3, 0.05), t + j * beat / 2, e, 0.5); break;
        case "pulseLow": for (let j = 0; j < 4; j++) mix(V.pulse(midi(root - 12), beat * 0.5, 0.06), t + j * beat, e, 0.5); break;
        case "ukulele": [0, 1, 1.5, 2.5, 3].forEach((b, j) => notes.forEach((m, k) => mix(V.pluck(midi(m + 12), 0.25, 0.08, rnd), t + b * beat + k * 0.015, e * (j % 2 ? 0.8 : 1), 0.35 + 0.1 * k))); break;
        case "glock": if (hasFull(t)) [0, 0.5, 1.5, 3].forEach((b, j) => mix(V.bell(midi(notes[(j + bi) % notes.length] + 24), 0.3, 0.05), t + b * beat, e, 0.7)); break;
        case "bellSparse": if (bi % 2 === 0) mix(V.bell(midi(notes[(bi / 2) % notes.length] + 24), 1, 0.05), t + beat, e, 0.6); break;
        case "strings": notes.forEach((m, k) => mix(V.strings(midi(m + (k === 0 ? 0 : 12)), bar + 0.2, 0.05), t, e, 0.3 + 0.15 * k)); break;
        case "drone": if (bi % 2 === 0) mix(V.drone(midi(keyRoot - 12), bar * 2 + 1, 0.12), t, 1, 0.5); break;
        case "ticker": for (let j = 0; j < 8; j++) mix(D.tick(0.12), t + j * beat / 2, e * (j % 2 ? 0.5 : 1), 0.65); break;
        case "kick4": if (hasFull(t)) for (let j = 0; j < 4; j++) mix(D.kick(0.5), t + j * beat, e, 0.5); break;
        case "clap24": if (hasFull(t)) [1, 3].forEach(b => mix(D.clap(0.3, rnd), t + b * beat, e, 0.5)); break;
        case "snap24": if (hasFull(t)) [1, 3].forEach(b => mix(D.snap(0.3, rnd), t + b * beat, e, 0.55)); break;
        case "hat8": if (hasFull(t)) for (let j = 0; j < 8; j++) mix(D.hat(j % 2 ? 0.12 : 0.07, rnd), t + j * beat / 2, e, 0.6); break;
        case "shaker": for (let j = 0; j < 8; j++) mix(D.shaker(0.08, rnd), t + j * beat / 2, e, 0.4); break;
        case "taiko": if (hasFull(t)) [0, 1.5, 2, 3].forEach((b, j) => mix(D.tom(j === 0 ? 0.6 : 0.4), t + b * beat, e, 0.5)); break;
        case "lofiDrums": { const sw = beat * 0.08; [0, 2.5].forEach(b => mix(D.kick(0.45), t + b * beat, e, 0.5)); [1, 3].forEach(b => mix(D.snare(0.22, rnd), t + b * beat, e, 0.5)); for (let j = 0; j < 8; j++) mix(D.hat(0.06, rnd), t + j * beat / 2 + (j % 2 ? sw : 0), e, 0.6); break; }
        case "crackle": for (let j = 0; j < 30; j++) mix(D.snap(0.03 * rnd(), rnd), t + rnd() * bar, 1, rnd()); break;
      }
    }
  }
  reverb(L, R, st.reverb, 1);
  // fades
  const fi = Math.floor((o.fadeIn == null ? 1.5 : o.fadeIn) * SR), fo = Math.floor((o.fadeOut == null ? 3 : o.fadeOut) * SR), n = Math.floor(dur * SR);
  for (let i = 0; i < fi; i++) { L[i] *= i / fi; R[i] *= i / fi; }
  for (let i = 0; i < fo; i++) { const k = i / fo, j = n - 1 - i; if (j >= 0) { L[j] *= k; R[j] *= k; } }
  const Ls = L.subarray(0, n), Rs = R.subarray(0, n);
  normalize(Ls, Rs, 0.6);
  writeWav(file, Ls, Rs);
  return { file, duration: dur, bpm, style: o.style || "calm-piano" };
}

// section-based pop arrangement: intro → verse → hook → break → hook → outro, scaled to the film length.
// The hook is a pentatonic whistle-pluck melody, so it sits on any chord of the I-V-vi-IV loop.
function popArrangement(st, a) {
  const { mix, rnd, keyRoot, beat, bar, dur } = a;
  const bars = Math.ceil((dur + 1) / bar);
  const PENT = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  // 2-bar phrases, 16 eighths each; numbers index PENT, null = rest, "-" = hold previous
  const A = [5, "-", 4, 3, 4, "-", 3, 2, 3, "-", 2, 1, 2, 1, 0, null];
  const B = [2, "-", 3, 4, 5, "-", 4, 3, 4, "-", 3, 2, 1, "-", "-", null];
  const C = [5, "-", 6, 7, 6, "-", 5, 4, 5, "-", 4, 3, 4, "-", "-", null];
  const hookPhrases = [A, B, A, C];
  // section map (in bars): intro 2, verse 4, hook 8, break 2, hook 8, outro rest - compressed/extended to fit
  const plan = []; const push = (name, n) => { for (let i = 0; i < n; i++) plan.push(name); };
  push("intro", 2); push("verse", 4); push("hook", 8); push("break", 2); push("hook", 8); push("verse", 4); push("hook", 8);
  while (plan.length < bars) plan.push("hook");
  plan.length = bars; plan[bars - 1] = "outro"; if (bars > 3) plan[bars - 2] = plan[bars - 2] === "hook" ? "hook" : "outro";
  let hookBar = 0;
  for (let b = 0; b < bars; b++) {
    const t = b * bar, sec = plan[b], [deg, q] = st.prog[b % st.prog.length], root = keyRoot + deg, notes = CHORD[q].map(n => root + n);
    const full = sec === "hook", e = sec === "intro" ? 0.6 : sec === "outro" ? 0.55 : sec === "break" ? 0.7 : 1;
    // chords: pad always, stabs on the off-beats in verse/hook
    notes.forEach((m, k) => mix(V.pad(midi(m), bar + 0.2, sec === "break" ? 0.07 : 0.045), t, e, 0.35 + 0.1 * k));
    if (sec === "verse" || full) [0.5, 1.5, 2.5, 3.5].forEach(x => notes.forEach((m, k) => mix(V.pluck(midi(m + 12), 0.12, 0.05, rnd), t + x * beat + k * 0.008, e, 0.4 + 0.08 * k)));
    // drums
    if (sec !== "intro" && sec !== "break") for (let j = 0; j < 4; j++) mix(D.kick(0.55), t + j * beat, e, 0.5);
    if (sec === "intro" || sec === "break") { mix(D.kick(0.45), t, e, 0.5); if (sec === "break") for (let j = 0; j < 8; j++) mix(D.snare(0.05 + j * 0.02, rnd), t + bar / 2 + j * beat / 4, 1, 0.5); }
    if (sec === "verse" || full) [1, 3].forEach(x => mix(D.clap(0.34, rnd), t + x * beat, e, 0.5));
    for (let j = 0; j < 8; j++) mix(D.hat(j % 2 ? (full ? 0.12 : 0.08) : 0.05, rnd, j % 2 === 1 && full), t + j * beat / 2, e, 0.62);
    if (full && b % 2 === 1) mix(D.shaker(0.07, rnd), t + 3.5 * beat, e, 0.3);
    // pumping octave bass (ducked on the kick)
    if (sec !== "intro") for (let j = 0; j < 8; j++) mix(V.bass(midi(root - 12 + (j % 2 ? 12 : 0)), beat * 0.32, j % 2 ? 0.14 : 0.2), t + j * beat / 2 + 0.03, e * (sec === "break" ? 0.5 : 1), 0.5);
    // the hook
    if (full) {
      const phrase = hookPhrases[Math.floor(hookBar / 2) % hookPhrases.length], half = hookBar % 2;
      for (let j = 0; j < 8; j++) {
        const step = phrase[half * 8 + j]; if (step == null || step === "-") continue;
        let len = 1; for (let k = half * 8 + j + 1; k < 16 && phrase[k] === "-"; k++) len++;
        const m = keyRoot + 24 + PENT[step], tt = t + j * beat / 2, d = len * beat / 2;
        mix(V.pluck(midi(m), d, 0.22, rnd), tt, e, 0.42);
        mix(V.bell(midi(m + 12), d, 0.045), tt, e, 0.6);
        mix(V.pluck(midi(m), d, 0.08, rnd), tt + beat * 0.75, e * 0.6, 0.7); // dotted-eighth echo
      }
      hookBar++;
    }
    if (sec === "verse" && b % 2 === 1) mix(V.bell(midi(keyRoot + 24 + PENT[(b * 3) % 6]), 0.4, 0.05), t + 3 * beat, e, 0.6);
  }
  // transition riser into each hook
  plan.forEach((sec, b) => { if (sec === "hook" && plan[b - 1] && plan[b - 1] !== "hook") { const r = sweepTone(bar * 0.9, 300, 1600, 0.08, rnd); mix(r, b * bar - bar * 0.9, 1, 0.5); } });
}
function sweepTone(dur, f0, f1, amp, r) { const n = Math.floor(dur * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = f0 * Math.pow(f1 / f0, t / dur); ph += 2 * Math.PI * f / SR; o[i] = amp * (0.5 * Math.sin(ph) + 0.5 * (r() * 2 - 1)) * (t / dur); } return lowpass(o, 5000); }

// ------------------------------------------------------------------ sound effects
const S = {
  pop: r => tone(0.12, t => Math.sin(2 * Math.PI * (300 + 900 * Math.exp(-t * 40)) * t) * Math.exp(-t * 30)),
  click: r => noiseBurst(0.03, 120, r, 3000),
  tap: r => tone(0.06, t => Math.sin(2 * Math.PI * 1100 * t) * Math.exp(-t * 80) + 0.4 * (r() * 2 - 1) * Math.exp(-t * 200)),
  whoosh: r => filteredNoise(0.55, r, t => Math.sin(Math.PI * t / 0.55) ** 2, 900),
  swoosh: r => filteredNoise(0.35, r, t => Math.sin(Math.PI * t / 0.35) ** 3, 1800),
  rise: r => sweep(1.4, 200, 1400, 0.7, r),
  drop: r => tone(0.5, t => Math.sin(2 * Math.PI * (900 * Math.exp(-t * 4)) * t) * Math.exp(-t * 4)),
  thud: r => tone(0.35, t => Math.sin(2 * Math.PI * (90 * Math.exp(-t * 6)) * t) * Math.exp(-t * 12) + 0.3 * (r() * 2 - 1) * Math.exp(-t * 60)),
  impact: r => { const a = tone(0.8, t => Math.sin(2 * Math.PI * (60 + 80 * Math.exp(-t * 20)) * t) * Math.exp(-t * 5)); const b = filteredNoise(0.4, r, t => Math.exp(-t * 14), 2500); return add(a, b, 0.6); },
  boom: r => { const a = tone(1.6, t => Math.sin(2 * Math.PI * (40 + 60 * Math.exp(-t * 8)) * t) * Math.exp(-t * 2.5)); const b = filteredNoise(1.2, r, t => Math.exp(-t * 4), 600); return add(a, b, 0.8); },
  ding: r => tone(1.2, t => bellT(1318, t)),
  chime: r => add(tone(1.4, t => bellT(1046, t)), shift(tone(1.4, t => bellT(1568, t)), 0.12), 0.8),
  success: r => add(tone(0.9, t => bellT(784, t)), shift(tone(1, t => bellT(1175, t)), 0.13), 1),
  error: r => tone(0.45, t => (((150 - 40 * t) * t) % 1 < 0.5 ? 0.5 : -0.5) * Math.exp(-t * 3) * (t < 0.18 || t > 0.24 ? 1 : 0)),
  notify: r => add(tone(0.5, t => bellT(1568, t) * 0.7), shift(tone(0.6, t => bellT(2093, t) * 0.7), 0.1), 1),
  sparkle: r => { let o = new Float32Array(Math.floor(1.0 * SR)); [2093, 2637, 3136, 3520, 4186].forEach((f, i) => { o = add(o, shift(tone(0.6, t => bellT(f, t) * 0.4), i * 0.06), 1); }); return o; },
  typewriter: r => add(noiseBurst(0.04, 150, r, 2500), shift(tone(0.05, t => Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-t * 90) * 0.4), 0.005), 1),
  keyboard: r => { let o = new Float32Array(Math.floor(0.6 * SR)); [0, 0.09, 0.2, 0.27, 0.38, 0.5].forEach(s => { o = add(o, shift(noiseBurst(0.035, 160, r, 2000 + r() * 1500), s), 0.7 + r() * 0.3); }); return o; },
  stamp: r => add(tone(0.3, t => Math.sin(2 * Math.PI * (120 * Math.exp(-t * 10)) * t) * Math.exp(-t * 18)), noiseBurst(0.08, 60, r, 1500), 0.7),
  boing: r => tone(0.7, t => Math.sin(2 * Math.PI * (220 + 160 * Math.sin(2 * Math.PI * 9 * t) * Math.exp(-t * 3)) * t) * Math.exp(-t * 4)),
  zip: r => sweep(0.25, 400, 2400, 0.5, r),
  slide: r => sweep(0.5, 900, 300, 0.4, r),
  coin: r => add(tone(0.12, t => Math.sin(2 * Math.PI * 1975 * t) * Math.exp(-t * 20) * 0.6), shift(tone(0.7, t => Math.sin(2 * Math.PI * 2637 * t) * Math.exp(-t * 6) * 0.6), 0.08), 1),
  cash: r => add(S.coin(r), shift(S.ding(r), 0.15), 0.8),
  camera: r => add(noiseBurst(0.05, 80, r, 3000), shift(noiseBurst(0.07, 60, r, 2000), 0.09), 1),
  page: r => filteredNoise(0.4, r, t => Math.sin(Math.PI * t / 0.4) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 30 * t)), 3500),
  magic: r => add(S.sparkle(r), sweep(0.8, 600, 1800, 0.25, r), 1),
  tick: r => tone(0.05, t => Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t * 110)),
  tock: r => tone(0.06, t => Math.sin(2 * Math.PI * 1500 * t) * Math.exp(-t * 90)),
  heartbeat: r => add(tone(0.2, t => Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t * 18)), shift(tone(0.2, t => Math.sin(2 * Math.PI * 50 * t) * Math.exp(-t * 18) * 0.7), 0.22), 1),
  pluck: r => V.pluck(660, 0.4, 0.8, r),
  bubble: r => tone(0.15, t => Math.sin(2 * Math.PI * (400 + 1400 * t * 6) * t) * Math.exp(-t * 25)),
  hit: r => add(S.impact(r), shift(S.whoosh(r), -0.0), 0.3),
  glitch: r => { const n = Math.floor(0.35 * SR), o = new Float32Array(n); let v = 0; for (let i = 0; i < n; i++) { if (i % 400 === 0) v = r() * 2 - 1; o[i] = v * 0.5 * (r() > 0.3 ? 1 : 0); } return o; },
  laugh: r => { let o = new Float32Array(Math.floor(0.9 * SR)); [0, 0.16, 0.32, 0.48].forEach((s, i) => { o = add(o, shift(tone(0.12, t => Math.sin(2 * Math.PI * (320 - i * 20) * t) * Math.sin(Math.PI * t / 0.12)), s), 0.6); }); return o; },
  applause: r => { const n = Math.floor(2.2 * SR), o = new Float32Array(n); for (let k = 0; k < 160; k++) { const s = Math.floor(r() * (n - 3000)); for (let i = 0; i < 1500; i++) o[s + i] += (r() * 2 - 1) * Math.exp(-i / 200) * 0.3; } for (let i = 0; i < n; i++) o[i] *= Math.min(1, i / (0.2 * SR)) * Math.min(1, (n - i) / (0.6 * SR)); return highpass(o, 900); },
  alarm: r => tone(1.0, t => (Math.sin(2 * Math.PI * (Math.floor(t * 6) % 2 ? 880 : 660) * t) > 0 ? 0.4 : -0.4)),
  riser: r => sweep(2.2, 150, 2000, 0.8, r),
  beep: r => tone(0.16, t => Math.sin(2 * Math.PI * 1000 * t) * (t < 0.13 ? 1 : Math.exp(-(t - 0.13) * 200)) * 0.6),
  sting: r => { let o = add(tone(1.6, t => bellT(1046, t) * 0.7), tone(1.6, t => bellT(1568, t) * 0.5), 1); o = add(o, tone(1.6, t => bellT(2093, t) * 0.35), 1); o = add(o, tone(0.5, t => Math.sin(2 * Math.PI * (70 + 90 * Math.exp(-t * 22)) * t) * Math.exp(-t * 7)), 0.9); return add(o, filteredNoise(0.35, r, t => Math.exp(-t * 12), 4000), 0.25); },
  projector: r => { const n = Math.floor(2.2 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR, ph = (t * 24) % 1; o[i] = (r() * 2 - 1) * (ph < 0.12 ? 0.6 * (1 - ph / 0.12) : 0.04) * Math.min(1, t / 0.2) * Math.min(1, (2.2 - t) / 0.3); } return lowpass(highpass(o, 600), 3500); }
};
function tone(dur, fn) { const n = Math.floor(dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = fn(i / SR); return o; }
function bellT(f, t) { return (1 - Math.exp(-t * 800)) * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 4) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 8)); }
function noiseBurst(dur, decay, r, hp) { const o = tone(dur, t => (r() * 2 - 1) * Math.exp(-t * decay)); return hp ? highpass(o, hp) : o; }
function filteredNoise(dur, r, env, cutoff) { const o = tone(dur, t => (r() * 2 - 1) * env(t)); return lowpass(highpass(o, cutoff * 0.3), cutoff); }
function sweep(dur, f0, f1, amp, r) { let ph = 0; return tone(dur, t => { const f = f0 * Math.pow(f1 / f0, t / dur); ph += 2 * Math.PI * f / SR; return amp * (Math.sin(ph) * 0.6 + 0.25 * (r() * 2 - 1)) * Math.sin(Math.PI * t / dur); }); }
function add(a, b, kb) { const n = Math.max(a.length, b.length), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (a[i] || 0) + (b[i] || 0) * (kb == null ? 1 : kb); return o; }
function shift(a, s) { const k = Math.max(0, Math.floor(s * SR)), o = new Float32Array(a.length + k); o.set(a, k); return o; }

export const SFX = Object.keys(S).sort();
export function sfx(name, file, o) {
  o = o || {}; const fn = S[name]; if (!fn) throw new Error("unknown sfx " + name + " (available: " + SFX.join(", ") + ")");
  const mono = fn(rng(o.seed || name.length * 97 + 13)); const tail = Math.floor(0.05 * SR), out = new Float32Array(mono.length + tail); out.set(mono);
  normalize(out, null, o.peak || 0.8);
  writeWav(file, out, out);
  return { file, duration: out.length / SR };
}
