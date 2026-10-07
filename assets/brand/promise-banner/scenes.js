// README promise banner (1600x520). Render: stickman snapshot assets/brand/promise-banner --at 1.9
const film = SM.film();
film.scene("banner", sc => {
  sc.rect(800, 260, 1560, 480, { r: 44, fill: "#111111", stroke: false, layer: "back" });
  sc.text("One prompt in.", { x: 800, y: 110, size: 92, color: "#FFFFFF", visible: true, raw: true });
  sc.text("A finished [video] out.", { x: 800, y: 210, size: 92, color: "#FFFFFF", accent: "#FFC531", visible: true, raw: true });
  sc.text("written · voiced · scored · animated · rendered", { x: 800, y: 292, size: 34, font: "body", weight: 600, color: "#BDBDBD", visible: true, raw: true });
  const pills = ["No video model", "No API keys", "No credits", "No cloud"];
  pills.forEach((p, i) => {
    const x = 800 + (i - 1.5) * 330;
    const b = SM.pill(sc, "✕  " + p, x, 382, { fill: "#E63946", size: 30 / sc.u, w: 300 / sc.u });
    b.show();
  });
  sc.text("just your coding agent + your laptop", { x: 800, y: 460, size: 30, font: "body", weight: 700, color: "#7EE787", visible: true, raw: true });
});
