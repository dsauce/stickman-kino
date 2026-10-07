import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { music, sfx, SFX, STYLES, SR } from "../lib/synth.mjs";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sk-audio-"));
const wavSeconds = f => (fs.statSync(f).size - 44) / (SR * 4);

test("every music style renders to the requested length", () => {
  for (const style of Object.keys(STYLES)) {
    const f = path.join(dir, style + ".wav");
    music(f, { style, duration: 6 });
    const buf = fs.readFileSync(f);
    assert.equal(buf.toString("ascii", 0, 4), "RIFF");
    assert.ok(Math.abs(wavSeconds(f) - 6) < 0.02, style);
  }
});

test("every sfx renders and is short", () => {
  assert.ok(SFX.length >= 35);
  for (const name of SFX) { const f = path.join(dir, name + ".wav"); sfx(name, f); const s = wavSeconds(f); assert.ok(s > 0.02 && s < 3, name + " " + s); }
});

test("synthesis is deterministic", () => {
  const a = path.join(dir, "a.wav"), b = path.join(dir, "b.wav");
  music(a, { style: "lofi", duration: 3, seed: 5 }); music(b, { style: "lofi", duration: 3, seed: 5 });
  assert.ok(fs.readFileSync(a).equals(fs.readFileSync(b)));
});

test("unknown names throw helpful errors", () => {
  assert.throws(() => sfx("nope", path.join(dir, "x.wav")), /available/);
  assert.throws(() => music(path.join(dir, "x.wav"), { style: "nope" }), /available/);
});
