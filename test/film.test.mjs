import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { validate, timings, scaffold, compose, loadFilm, FORMATS } from "../lib/film.mjs";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "sk-"));

test("validate catches bad films", () => {
  assert.ok(validate({}).length > 0);
  assert.ok(validate({ clips: [{ id: "1bad" }] }).some(e => /id/.test(e)));
  assert.ok(validate({ clips: [{ id: "a" }, { id: "a" }] }).some(e => /duplicated/.test(e)));
  assert.ok(validate({ format: "3:2", clips: [{ id: "a" }] }).some(e => /format/.test(e)));
  assert.deepEqual(validate({ format: "9:16", clips: [{ id: "a", duration: 4, vo: "hi", sfx: [{ at: 1, name: "pop" }] }] }), []);
});

test("timings: auto durations follow VO length and accumulate", () => {
  const film = { clips: [{ id: "a", vo: "one two three four five six seven eight nine ten" }, { id: "b", duration: 2.5 }, { id: "c", vo: "x", duration: "auto" }] };
  const r = timings(film, { vo: { a: { duration: 4.2 }, c: { duration: 0.6 } } });
  assert.equal(r.clips[0].duration, 5.5);           // 0.4 + 4.2 + 0.6 → ceil to .5
  assert.equal(r.clips[1].start, 5.5);
  assert.equal(r.clips[2].duration, 3);             // minDuration
  assert.equal(r.total, 11);
  const est = timings({ clips: [{ id: "a", vo: "word ".repeat(25) }] });
  assert.ok(est.clips[0].voEstimated && est.clips[0].voDuration > 8);
});

test("formats cover the common aspect ratios", () => {
  assert.deepEqual(FORMATS["16:9"], [1920, 1080]);
  assert.deepEqual(FORMATS["9:16"], [1080, 1920]);
});

test("scaffold + compose produce a valid HyperFrames project", () => {
  const dir = path.join(tmp(), "film");
  scaffold(dir, { clips: 3, format: "9:16", theme: "dark" });
  const film = loadFilm(dir);
  assert.equal(film.clips.length, 5);              // intro + 3 + outro
  film.music.style = "none"; film.clips[0].sfx = [{ at: 0.5, name: "pop" }];
  fs.writeFileSync(path.join(dir, "film.json"), JSON.stringify(film));
  const r = compose(dir);
  const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  assert.match(html, /data-composition-id="stickman"/);
  assert.match(html, /data-width="1080" data-height="1920"/);
  assert.equal((html.match(/<section id="(c\d|intro|outro)" class="clip"/g) || []).length, 5);
  assert.match(html, /window\.__timelines/);
  assert.match(html, /film\.scene\("c1"/);                    // scenes.js inlined
  assert.match(html, /assets\/sfx\/pop\.wav/);
  assert.ok(fs.existsSync(path.join(dir, ".sm", "gsap.min.js")));
  assert.ok(fs.existsSync(path.join(dir, "assets", "sfx", "pop.wav")));
  const meta = fs.readFileSync(path.join(dir, "film.js"), "utf8");
  assert.match(meta, /window\.SM_FILM/);
  assert.equal(r.W, 1080);
});

test("intro/outro presets get default durations and sound effects", async () => {
  const { titlePreset } = await import("../lib/film.mjs");
  const r = timings({ clips: [{ id: "i", intro: { style: "countdown" } }, { id: "o", outro: { style: "kino" } }, { id: "c", intro: { style: "logo" }, duration: 5 }] });
  assert.ok(r.clips[0].duration > 3 && r.clips[0].duration < 5);
  assert.equal(r.clips[2].duration, 5);
  assert.ok(titlePreset({ intro: { style: "countdown" } }).sfx.some(s => s.name === "beep"));
  for (const style of ["countdown", "clapper", "logo", "spotlight"]) assert.ok(titlePreset({ intro: { style } }).duration > 2, style);
  for (const style of ["cta", "credits", "endcard", "kino"]) assert.ok(titlePreset({ outro: { style } }).duration > 2, style);
});
