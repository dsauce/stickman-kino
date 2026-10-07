import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exportPrompts } from "../lib/prompts.mjs";

test("prompt package has one self-contained prompt per clip", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sk-p-"));
  fs.writeFileSync(path.join(dir, "film.json"), JSON.stringify({ title: "T", format: "9:16", theme: "dark", clips: [{ id: "a", vo: "Hello there.", visual: "A figure waves." }, { id: "b", vo: "Bye." }] }));
  const f = exportPrompts(dir), md = fs.readFileSync(f, "utf8");
  assert.equal((md.match(/```text/g) || []).length, 2);
  assert.match(md, /9:16/); assert.match(md, /pitch-black/); assert.match(md, /"Hello there\."/); assert.match(md, /A figure waves/);
  assert.ok(!/#[0-9A-Fa-f]{6}/.test(md), "no hex colours inside prompts");
});
