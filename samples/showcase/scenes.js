// Stickman Kino - showcase film. Every clip uses LOCAL time; sc.cue("word") syncs to the voice-over.
const film = SM.film();

// 1 · GOLDEN HOOK - a clapper drops, a star is born
film.scene("hook", sc => {
  sc.ground();
  sc.env.stage({ x: sc.cx });
  const clap = sc.prop("clapper", { x: sc.cx + 330, y: sc.groundY - 70, size: 170, rotation: -8 });
  clap.dropIn(0.25, 0.6);
  const bob = sc.figure({ x: sc.cx, hidden: true, face: "dots" });
  bob.pop(1.0);
  bob.lookAt(sc.cx - 400, sc.groundY - 300, 1.6, 0.35);
  bob.lookAt(sc.cx + 400, sc.groundY - 300, 2.2, 0.35);
  const t = sc.cue("starring");
  bob.surprise(t);
  sc.camera.focus(sc.cx, sc.groundY - 200, 1.18, 1.0, 3.2, "sine.inOut");
  const a = sc.text("Directed by your [AI agent]", { x: sc.cx, y: 150, size: 76 }); a.in(sc.cue("direct") - 0.1, "words");
  const b = sc.text("starring… a stick figure", { x: sc.cx, y: 245, size: 54, font: "hand", color: "a1" }); b.in(t, "pop");
  sc.exit("iris", { x: sc.cx, y: sc.groundY - 260, d: 0.55 });
});

// 2 · DISRUPT - the old way buries you
film.scene("pain", sc => {
  sc.enter("iris", { x: sc.cx, y: sc.groundY - 260, d: 0.5 });
  sc.ground();
  const bob = sc.figure({ x: sc.cx, face: "dots", pose: "surprise" });
  bob.emote("worried", 0);
  bob.pose("scared", 0.5, 0.3);
  sc.fx.rain(["document", "clock", "filmstrip", "calendar"], 0.4, 4.6, { n: 26, pile: true, pileY: sc.groundY - 30, x0: sc.cx - 380, x1: sc.cx + 380, size: 90, layer: "front" });
  sc.camera.shake(1.0, 0.5, 8);
  [["video", "stock footage", 330, sc.cue("stock")], ["filmstrip", "timeline editor", sc.W - 330, sc.cue("timeline")], ["calendar", "a lost weekend", 380, sc.cue("weekend")]].forEach(([icon, txt, x, t], i) => {
    const y = 260 + (i === 2 ? 300 : 0);
    sc.prop(icon, { x, y, size: 130, layer: "ui", hidden: true }).pop(t);
    sc.text(txt, { x, y: y + 100, size: 46, font: "hand", color: "a1" }).in(t + 0.1, "pop");
  });
  bob.sad(sc.cue("keyframes"));
  sc.fx.sweat(sc.cx + 40, sc.groundY - 330, sc.cue("keyframes") + 0.2);
  const X = sc.prop("error", { x: sc.cx, y: sc.groundY - 160, size: 220, layer: "front", hidden: true });
  X.pop(5.4, 0.3); sc.fx.impact(sc.cx, sc.groundY - 160, 5.4, { r: 160 });
  sc.exit("wipe-left", { d: 0.5 });
});

// 3 · THE SECRET - you write the story, your agent writes the scenes
film.scene("flip", sc => {
  sc.enter("wipe-left", { d: 0.5 });
  sc.ground();
  const off = sc.env.office({ x: 520 });
  const bob = sc.figure({ x: off.seatX, character: "office" });
  bob.sit(0, off.seatY, { d: 0.01, pose: "typing" });
  bob.typing(0.4, 6.4);
  bob.blinks(0, 7);
  const fl = sc.flow({ nodes: [
    { id: "story", label: "story", x: 1120, y: 230, icon: "document" },
    { id: "code", label: "scenes.js", x: 1450, y: 230, icon: "code", w: 290 },
    { id: "film", label: "film", x: 1770, y: 230, icon: "play", color: "a3" }
  ], edges: [["story", "code"], ["code", "film"]], nodeW: 230 });
  fl.build(sc.cue("flips") - 0.2, 0.45);
  fl.pulse("story", sc.cue("story"), "a3");
  fl.pulse("code", sc.cue("scene"), "a3");
  const panel = sc.rect(1450, 560, 760, 300, { r: 22, fill: "#111111", stroke: false, layer: "back", hidden: true }); panel.pop(sc.cue("agent") - 0.4, 0.35, { sfx: false });
  const lines = ['bob.walkTo(900, 0.2)', 'sc.cue("story")', 'chart.grow(1.0)', 'sc.exit("iris")'];
  lines.forEach((l, i) => sc.text(l, { x: 1110, y: 470 + i * 62, size: 38, font: "mono", align: "left", color: i % 2 ? "#FFC531" : "#7EE787" }).in(sc.cue("agent") + i * 0.55, "type", 0.03));
  sc.exit("flash", { d: 0.25 });
});

// 4 · THE TRUTH - everything you need, built in
film.scene("power", sc => {
  sc.enter("flash", { d: 0.3 });
  sc.ground({ x0: -400, x1: 9000 });
  sc.env.road({ y: sc.groundY, x1: 9000, wide: true });
  sc.env.trees({ n: 14, x0: 0, x1: 6000, y: sc.groundY, size: 190 });
  sc.env.clouds({ n: 6, drift: false, y0: 70, spread: 40, size: 120 });
  const bob = sc.figure({ x: 300, character: "zeke" });
  bob.runTo(5200, 0.1, { d: 7.3, end: false });
  sc.camera.follow(bob, 0.1, 7.4, { lead: 250 });
  const items = [["chartup", "50+ poses", "poses"], ["box", "189 props", "props"], ["barchart", "charts & diagrams", "charts"], ["chat", "auto captions", "captions"], ["video", "camera moves", "camera"], ["mic", "a real voice", "voice"]];
  items.forEach(([icon, txt, word], i) => {
    const t = sc.cue(word) - 0.1, y = 250 + i * 104;
    sc.prop(icon, { x: 1180, y, size: 84, layer: "ui", hidden: true }).pop(t);
    const tx = sc.text(txt, { x: 1250, y, size: 54, align: "left" }); tx.in(t + 0.05, "slide");
    if (i === 1) tx.highlight("189", t + 0.4);
  });
  sc.exit("ink", { d: 0.45, color: "a2" });
});

// 5 · same scene, three themes - the film re-renders
const themeScene = (id, theme, label, enter, exit, character) => film.scene(id, sc => {
  if (enter) sc.enter(enter[0], enter[1]);
  sc.ground();
  const bob = sc.figure({ x: 520, character: character || "classic" });
  bob.present(0.15);
  const ch = sc.barChart({ x: 1300, y: 540, w: 660, h: 400, data: [{ label: "idea", value: 2, color: "a1" }, { label: "draft", value: 5, color: "a3" }, { label: "film", value: 9, color: "a2" }], values: false });
  ch.grow(0.1, 0.5, 0.08);
  sc.text("theme: " + label, { x: sc.cx, y: 130, size: 64 }).in(0.15, "pop");
  if (exit) sc.exit(exit[0], exit[1]);
}, { theme });
themeScene("themeA", "light", "light", ["ink", { d: 0.4, color: "a2" }], ["flash", { d: 0.15 }]);
themeScene("themeB", "chalkboard", "chalkboard", ["flash", { d: 0.2 }], ["flash", { d: 0.15 }]);
themeScene("themeC", "neon", "neon", ["flash", { d: 0.2 }], ["zoom", { d: 0.4 }], "agent");

// 6 · ELEVATION - logo, celebration, the question
film.scene("outro", sc => {
  sc.enter("zoom", { d: 0.45 });
  sc.ground();
  const logo = sc.image("assets/icon.svg", { x: sc.cx, y: 210, w: 210, layer: "ui", hidden: true }); logo.pop(0.3, 0.5);
  const title = sc.text("Stickman [Kino]", { x: sc.cx, y: 390, size: 128, accent: "a1" }); title.in(0.5, "rise");
  sc.text("Stickman films, directed by your AI agent, rendered as code.", { x: sc.cx, y: 490, size: 40, font: "body", weight: 600, color: "muted" }).in(1.0, "fade");
  const steps = ["clone", "ask", "ship"].map((w, i) => sc.text(["1 · clone it", "2 · ask your agent", "3 · ship the film"][i], { x: 620 + i * 340, y: 600, size: 40, color: i === 2 ? "a2" : "ink" }));
  steps.forEach((s, i) => s.in(sc.cue(["clone", "ask", "ship"][i]) - 0.1, "pop"));
  const bob = sc.figure({ x: -150, character: "zeke" });
  bob.walkTo(250, 0.2);
  bob.celebrate(sc.cue("ship"), { hold: true });
  const q = bob.hold("question", null, { size: 120, accent: "a3", dx: 18, dy: -70 }); q.hide();
  bob.pose("pointUp", sc.cue("explain") - 0.3, 0.3);
  q.pop(sc.cue("explain") - 0.1, 0.35);
  bob.emote("happy", sc.cue("explain"));
  const amy = sc.figure({ x: sc.W + 150, character: "dress", facing: -1 });
  amy.walkTo(sc.W - 260, 2.4);
  amy.think(sc.cue("explain"), 1.6);
});
