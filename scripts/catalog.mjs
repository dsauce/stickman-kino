// Regenerate docs/props.md, docs/characters-and-poses.md and docs/engine-api.md from the engine source.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

// ---- props, grouped by the section comments in sm-props.js
const src = read("engine/sm-props.js");
const sections = []; let cur = null;
for (const line of src.split("\n")) {
  const sec = /\/\/ =+ (.+)$/.exec(line); if (sec) { cur = { title: sec[1].trim(), items: [] }; sections.push(cur); continue; }
  const m = /def\("([\w-]+)",.*\}, ("[^"]*"|null|undefined)?,? ?"([^"]*)"\);\s*$/.exec(line) || /def\("([\w-]+)",.*\}, ("[^"]*"|null), "([^"]*)"\);/.exec(line);
  if (m && cur) cur.items.push({ name: m[1], accent: (m[2] || "").replace(/"/g, "").replace("null", ""), tags: m[3] });
}
const total = sections.reduce((a, s) => a + s.items.length, 0);
let md = `# Props\n\n${total} line-art props, theme-aware, with constant line weight at any size. Generated from \`engine/sm-props.js\` by \`node scripts/catalog.mjs\`.\n\n![Props 1](images/catalog-props-1.png)\n![Props 2](images/catalog-props-2.png)\n\n`;
md += "```js\nsc.prop(\"rocket\", { x: 960, y: 500, size: 160, accent: \"a1\", layer: \"front\", hidden: true }).pop(1.2);\nbob.hold(\"coffee\", 0.5);            // in hand, stays upright\nbob.throw(\"coin\", 1200, 600, 2.0);   // arcs to a target\nsc.fx.rain([\"document\", \"clock\"], 0, 3, { pile: true });\n```\n\n";
md += "`accent` = default colour slot (`a1` alert · `a2` hero · `a3` reward); override with `accent: \"a2\"` or any colour. Add your own with `SM.defineProp(name, c => { c.P(pathData); c.C(x, y, r); … }, \"a2\", \"tags\")`: see the existing definitions for the drawing helpers (`P` path, `C` circle, `E` ellipse, `R` rect, `L` line, `T` text, `lines`).\n\n";
for (const s of sections) { if (!s.items.length) continue; md += `## ${s.title[0].toUpperCase() + s.title.slice(1)}\n\n| Prop | Accent | Tags |\n|---|---|---|\n` + s.items.map(i => `| \`${i.name}\` | ${i.accent || "-"} | ${i.tags} |`).join("\n") + "\n\n"; }
fs.writeFileSync(path.join(ROOT, "docs/props.md"), md);

// ---- poses + characters
const rig = read("engine/sm-rig.js");
const poses = [...rig.split("const POSES")[1].split("};")[0].matchAll(/^\s{4}(\w+):\s+(\{[^}]+\})/gm)].map(m => m[1]);
const chars = [...rig.split("SM.characters = {")[1].split("};")[0].matchAll(/^\s{4}(\w+):\s+(\{[^}]*\})/gm)].map(m => [m[1], m[2]]);
let pm = `# Characters & poses\n\n![Characters](images/catalog-characters.png)\n\n## Characters (${chars.length})\n\n\`\`\`js\nsc.character("zeke", { x: 600 })        // preset\nsc.figure({ x: 600, hat: "cap", hatColor: "#1D7FE0", shirt: "#FFC531", face: "dots", glasses: true })\n\`\`\`\n\n| Preset | Options |\n|---|---|\n` + chars.map(([n, o]) => `| \`${n}\` | \`${o.replace(/\s+/g, " ")}\` |`).join("\n");
pm += `\n\n**Build-your-own options**: \`size\` (px, default 300 at 1080p), \`height\` (multiplier), \`color\` (ink), \`face: "dots"\`, \`head: "filled" | "square"\`, \`antenna\`, \`hat: "beanie" | "cap" | "hardhat" | "tophat" | "crown" | "grad" | "chef" | "beret" | "party"\`, \`hatColor\`, \`hair: "bun" | "ponytail" | "spiky" | "bob"\`, \`glasses\`, \`shirt\`, \`shorts\`, \`dress\`, \`tie\` (colours or \`"ink"\`), \`facing: 1 | -1\`, \`pose\`, \`z\`.\n\nFaces (\`face: "dots"\`): \`emote("happy" | "grin" | "neutral" | "surprised" | "worried" | "sad", t)\`, \`blink(t)\`, \`blinks(t0, t1)\`.\n\n## Poses (${poses.length})\n\n![Poses](images/catalog-poses.png)\n\n${poses.map(p => "`" + p + "`").join(" · ")}\n\n\`\`\`js\nbob.pose("think", 1.2);                        // tween to a named pose (0.3 s)\nbob.pose("stand", 2, 0.5, "back.out", { H: -110 });  // with overrides (look up)\nbob.pose({ T: -80, H: -60, uaL: 100, faL: 92, uaR: -40, faR: -80, thL: 94, shL: 92, thR: 86, shR: 88 }, 3);\n\`\`\`\n\nPose objects are **absolute angles** for a right-facing figure: \`0\` forward, \`90\` down, \`-90\` up, \`180\` back. Keys: \`T\` torso, \`H\` head, \`uaL/faL\` back upper/fore-arm, \`uaR/faR\` front arm, \`thL/shL\` back thigh/shin, \`thR/shR\` front leg. \`SM.poses.myPose = {…}\` registers a new one.\n\n## Actions\n\nSee [engine-api.md → Figures](engine-api.md#figures).\n`;
fs.writeFileSync(path.join(ROOT, "docs/characters-and-poses.md"), pm);

// ---- engine API = the animator cheat-sheet with a doc header
const api = read("skills/stickman-animator/references/api.md").replace(/^# .+\n/, "");
fs.writeFileSync(path.join(ROOT, "docs/engine-api.md"), `# Engine API\n\n> This page mirrors \`skills/stickman-animator/references/api.md\` (the copy agents read). Regenerate with \`node scripts/catalog.mjs\`. For worked examples see the [cookbook](../skills/stickman-animator/references/cookbook.md) and [samples](../samples).\n\nEvery scene function receives \`sc\`. Load order and contract: see [how-it-works.md](how-it-works.md).\n${api}`);
console.log(`✓ props.md (${total}) · characters-and-poses.md (${chars.length} characters, ${poses.length} poses) · engine-api.md`);
