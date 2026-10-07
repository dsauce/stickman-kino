import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ENGINE_FILES } from "../lib/film.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => fs.readFileSync(path.join(ROOT, "engine", f), "utf8");

test("engine files parse", () => { for (const f of ENGINE_FILES) assert.doesNotThrow(() => new Function(read(f)), f); });
test("engine is seek-safe (no clocks / randomness / timers)", () => {
  for (const f of ENGINE_FILES) { const src = read(f); assert.ok(!/Math\.random|Date\.now|new Date|setTimeout|setInterval|requestAnimationFrame|fetch\(/.test(src), f); }
});
test("catalogue sizes", () => {
  const props = [...read("sm-props.js").matchAll(/def\("([\w-]+)"/g)].map(m => m[1]);
  assert.ok(props.length >= 180, "props " + props.length);
  assert.equal(new Set(props).size, props.length, "duplicate prop names");
  const poses = [...read("sm-rig.js").split("const POSES")[1].split("};")[0].matchAll(/^\s{4}(\w+):/gm)];
  assert.ok(poses.length >= 50, "poses " + poses.length);
});
test("recipe book and cookbook stay in sync", () => {
  const src = fs.readFileSync(path.join(ROOT, "samples/recipes/scenes.js"), "utf8");
  const md = fs.readFileSync(path.join(ROOT, "skills/stickman-animator/references/cookbook.md"), "utf8");
  for (const m of src.matchAll(/\/\/ @recipe ([\w-]+) \|/g)) assert.ok(md.includes(`id="${m[1]}"`), m[1]);
});
test("every sample film validates and has a scene per clip", async () => {
  const { loadFilm } = await import("../lib/film.mjs");
  for (const d of fs.readdirSync(path.join(ROOT, "samples"))) {
    const dir = path.join(ROOT, "samples", d); if (!fs.existsSync(path.join(dir, "film.json"))) continue;
    const film = loadFilm(dir), scenes = fs.readFileSync(path.join(dir, "scenes.js"), "utf8");
    const dynamic = /film\.scene\(\s*["'][\w-]*["']\s*\+/.test(scenes);
    for (const c of film.clips) assert.ok(dynamic || c.intro || c.outro || scenes.includes(`"${c.id}"`), `${d}: scene ${c.id}`);
  }
});
test("skills have valid frontmatter", () => {
  for (const s of fs.readdirSync(path.join(ROOT, "skills"))) {
    const md = fs.readFileSync(path.join(ROOT, "skills", s, "SKILL.md"), "utf8");
    assert.match(md, /^---\nname: [a-z-]+\ndescription: .{40,}\n---/, s);
  }
});
