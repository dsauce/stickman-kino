// Regenerate skills/stickman-animator/references/cookbook.md from samples/recipes/scenes.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "samples/recipes/scenes.js"), "utf8");
const blocks = [...src.matchAll(/\/\/ @recipe ([\w-]+) \| (.+)\n([\s\S]*?)\/\/ @end/g)];
let md = `# Stickman Kino cookbook\n\nCopy-paste recipes for common explainer moments. Every recipe is a real, tested scene in \`samples/recipes/\` (rendered by CI-free \`stickman check\`), so the code here is known to work. Times are local seconds; tweak positions with \`sc.W\`, \`sc.H\`, \`sc.groundY\`.\n\n`;
md += blocks.map(b => `- [${b[2]}](#${b[1]})`).join("\n") + "\n\n";
for (const b of blocks) md += `<a id="${b[1]}"></a>\n## ${b[2]}\n\n\`\`\`js\n${b[3].trim()}\n\`\`\`\n\n`;
md += `---\nRegenerate with \`node scripts/cookbook.mjs\` after editing samples/recipes/scenes.js.\n`;
fs.writeFileSync(path.join(ROOT, "skills/stickman-animator/references/cookbook.md"), md);
console.log("✓ cookbook.md - ", blocks.length, "recipes");
