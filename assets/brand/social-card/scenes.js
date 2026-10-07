// GitHub social preview (1280×640). Render: stickman snapshot assets/brand/social-card --at 1.9
const film = SM.film();
film.scene("card", sc => {
  sc.ground({ y: 560 });
  sc.image("icon.svg", { x: 150, y: 150, w: 150, layer: "ui" });
  sc.text("Stickman [Kino]", { x: 250, y: 150, size: 92, align: "left", accent: "a1", visible: true, raw: true });
  sc.text("Stickman films, directed by your AI agent,", { x: 82, y: 270, size: 36, align: "left", font: "body", weight: 600, color: "muted", visible: true, raw: true });
  sc.text("rendered as code.", { x: 82, y: 318, size: 36, align: "left", font: "body", weight: 600, color: "muted", visible: true, raw: true });
  sc.text("Claude Code · Codex · Cursor · Gemini CLI", { x: 82, y: 400, size: 26, align: "left", font: "body", weight: 700, color: "a2", visible: true, raw: true });
  const a = sc.figure({ x: 820, y: 560, size: 210, pose: "pointUp", face: "dots" });
  const b = sc.character("zeke", { x: 1170, y: 560, size: 210, facing: -1, pose: "thumbsUp" });
  const ch = sc.barChart({ x: 1050, y: 262, w: 420, h: 240, data: [{ label: "", value: 2, color: "a1" }, { label: "", value: 5, color: "a3" }, { label: "", value: 9, color: "a2" }], values: false });
  gsap.set(ch.bars, { scaleY: 1 }); ch.el.querySelectorAll("path").forEach(p => gsap.set(p, { opacity: 1, strokeDasharray: "none" }));
  sc.prop("lightbulb", { x: 855, y: 255, size: 70 });
  sc.prop("clapper", { x: 1225, y: 120, size: 80, rotation: 10 });
});
