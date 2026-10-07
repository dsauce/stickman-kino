// README promise banner (1600x560). Render: stickman snapshot assets/brand/promise-banner --at 1.9
const film = SM.film();
film.scene("banner", sc => {
  const k = 1 / sc.u;   // sizes below are in real pixels
  sc.rect(800, 280, 1560, 520, { r: 44, fill: "#111111", stroke: false, layer: "back" });
  sc.text("One prompt in.", { x: 800, y: 100, size: 88, color: "#FFFFFF", visible: true, raw: true });
  sc.text("A finished [video] out.", { x: 800, y: 196, size: 88, color: "#FFFFFF", accent: "#FFC531", visible: true, raw: true });
  sc.text("written · voiced · scored · animated · rendered", { x: 800, y: 276, size: 32, font: "body", weight: 600, color: "#BDBDBD", visible: true, raw: true });
  const pills = [["✕  No video-gen model", "#E63946"], ["✕  No video API", "#E63946"], ["✕  No per-video credits", "#E63946"], ["✓  Renders locally", "#1F9D55"]];
  pills.forEach(([label, fill], i) => SM.pill(sc, label, 800 + (i - 1.5) * 365, 366, { fill, size: 25 * k, w: 345 * k }).show());
  sc.text("Powered by the coding agent you already use", { x: 800, y: 452, size: 30, font: "body", weight: 700, color: "#7EE787", visible: true, raw: true });
  sc.text("Claude Code · Codex · Cursor · Gemini CLI · Copilot · Windsurf", { x: 800, y: 500, size: 26, font: "body", weight: 500, color: "#BDBDBD", visible: true, raw: true });
});
