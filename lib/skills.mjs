// Stickman Kino - install the agent skills into Claude Code / Codex / generic agent folders
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { ROOT, ok, warn, log, c } from "./env.mjs";

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) { const s = path.join(src, f), d = path.join(dst, f); fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d); }
}
export function skillNames() { const d = path.join(ROOT, "skills"); return fs.readdirSync(d).filter(n => fs.existsSync(path.join(d, n, "SKILL.md"))); }
export function installSkills(o) {
  o = o || {}; const targets = [];
  const want = (o.target || "all").split(",");
  const has = t => want.includes("all") || want.includes(t);
  if (o.project) targets.push(["project (.claude/skills)", path.join(path.resolve(o.project), ".claude", "skills")]);
  else {
    if (has("claude")) targets.push(["Claude Code", path.join(os.homedir(), ".claude", "skills")]);
    if (has("codex")) targets.push(["Codex", path.join(process.env.CODEX_HOME || path.join(os.homedir(), ".codex"), "skills")]);
    if (has("agents")) targets.push(["generic agents (~/.agents/skills)", path.join(os.homedir(), ".agents", "skills")]);
  }
  const names = skillNames();
  for (const [label, dir] of targets) {
    for (const n of names) {
      const dst = path.join(dir, n); copyDir(path.join(ROOT, "skills", n), dst);
      fs.writeFileSync(path.join(dst, "STICKMAN_HOME"), ROOT + "\n"); // lets a globally-installed skill find the engine + CLI
    }
    ok(`${label}: ${names.length} skills → ${c.dim(dir)}`);
  }
  log(`\nRestart your agent, then ask: ${c.cy('"Make a 45-second stickman explainer about <topic>"')}\n`);
}
