// Gallery - renders the whole catalogue as stills for the docs (stickman snapshot samples/gallery).
const film = SM.film();
const label = (sc, s, x, y, size) => sc.text(s, { x, y, size: size || 20, font: "body", weight: 600, color: "muted", visible: true });

film.scene("poses", sc => {
  const names = Object.keys(SM.poses).filter(n => !/^(walkPA|walkPB|runPA|runPB)$/.test(n));
  const cols = 11, cw = sc.W / cols, rows = Math.ceil(names.length / cols), rh = (sc.H - 60) / rows;
  sc.text("Poses · " + names.length, { x: 40, y: 34, size: 30, align: "left", visible: true });
  names.forEach((n, i) => {
    const cx = cw * (i % cols) + cw / 2, gy = 70 + rh * Math.floor(i / cols) + rh * 0.78;
    const f = sc.figure({ x: cx - 10, y: gy, size: rh * 0.58, pose: n });
    if (/^(sit|sitEdge|slump|relax|typing)$/.test(n)) { f.place(cx - 10, gy); gsap.set(f.el, { y: gy - f.L.shin * 0.98 - f.S * 0.6 }); }
    if (/^(lie|lieFront|sitFloor)$/.test(n)) gsap.set(f.el, { y: gy - f.S * 0.8 });
    if (n === "kneel") gsap.set(f.el, { y: gy - f.L.th * 0.98 });
    if (/^(crouch|tuck|sneakA|sneakB)$/.test(n)) gsap.set(f.el, { y: gy - f.legLen * ({ crouch: 0.72, tuck: 0.8 }[n] || 0.82) });
    label(sc, n, cx, gy + 18, 17);
  });
});

function propsGrid(sc, names, title) {
  const cols = 15, cw = sc.W / cols, rows = Math.ceil(names.length / cols), rh = (sc.H - 70) / rows;
  sc.text(title, { x: 40, y: 34, size: 30, align: "left", visible: true });
  names.forEach((n, i) => {
    const cx = cw * (i % cols) + cw / 2, cy = 74 + rh * Math.floor(i / cols) + rh * 0.42;
    sc.prop(n, { x: cx, y: cy, size: Math.min(cw, rh) * 0.58 });
    label(sc, n, cx, cy + rh * 0.42, 16);
  });
}
const ALL = SM.propNames();
film.scene("props1", sc => propsGrid(sc, ALL.slice(0, 90), "Props · " + ALL.length + " (1/2)"));
film.scene("props2", sc => propsGrid(sc, ALL.slice(90), "Props (2/2)"));

film.scene("characters", sc => {
  sc.ground({ y: 760 });
  const names = Object.keys(SM.characters), cw = sc.W / names.length;
  sc.text("Characters", { x: 40, y: 40, size: 34, align: "left", visible: true });
  names.forEach((n, i) => { const f = sc.character(n, { x: cw * i + cw / 2, y: 760, size: 300 }); f.emote(["happy", "grin", "neutral", "surprised", "worried", "sad"][i % 6]); label(sc, n, cw * i + cw / 2, 800, 24); });
  const poses = ["stand", "walkA", "runA", "cheer", "think", "point", "sit"];
  sc.text("faces: happy · grin · neutral · surprised · worried · sad", { x: sc.cx, y: 900, size: 26, font: "body", color: "muted", visible: true });
});

film.scene("charts", sc => {
  sc.text("Charts", { x: 40, y: 40, size: 34, align: "left", visible: true });
  sc.barChart({ x: 330, y: 330, w: 520, h: 330, data: [{ label: "Q1", value: 12 }, { label: "Q2", value: 19 }, { label: "Q3", value: 27 }, { label: "Q4", value: 41 }] }).grow(0, 0.6, 0.1);
  sc.lineChart({ x: 960, y: 330, w: 540, h: 330, series: [{ values: [3, 5, 4, 8, 7, 12], label: "us" }, { values: [4, 4, 5, 5, 6, 6], label: "them" }], labels: ["J", "F", "M", "A", "M", "J"], grid: true, area: true }).draw(0, 1.2);
  sc.pieChart({ x: 1600, y: 330, r: 150, donut: true, center: "62%", data: [{ value: 62, label: "yes" }, { value: 28, label: "no" }, { value: 10, label: "?" }] }).grow(0, 1);
  sc.hbarChart({ x: 380, y: 800, w: 640, h: 300, data: [{ label: "Kino", value: 92 }, { label: "Manual", value: 41 }, { label: "Stock", value: 23 }], suffix: "%" }).grow(0, 0.8);
  const st = sc.stat(86400, "seconds in a day", { x: 1000, y: 780, size: 130 }); st.in(0, 1.2);
  sc.progress({ x: 1560, y: 700, w: 440, from: 0 }).to(72, 0, 1.2);
  sc.gauge({ x: 1540, y: 930, r: 130 }).to(80, 0, 1.2);
});

film.scene("diagrams", sc => {
  sc.text("Diagrams", { x: 40, y: 40, size: 34, align: "left", visible: true });
  const fl = sc.flow({ nodes: [{ id: "a", label: "Ask", x: 200, y: 230, icon: "chat" }, { id: "b", label: "Search", x: 560, y: 230, icon: "magnifier" }, { id: "c", label: "Answer", x: 920, y: 230, icon: "document", color: "a3" }], edges: [["a", "b"], ["b", "c"]] }); fl.build(0, 0.25);
  sc.timeline({ x: 560, y: 560, w: 860, items: [{ date: "2023", label: "idea" }, { date: "2024", label: "beta" }, { date: "2025", label: "launch", color: "a3" }, { date: "2026", label: "scale", color: "a1" }] }).build(0, 0.2);
  sc.venn({ x: 1470, y: 270, r: 130, sets: ["Fast", "Cheap", "Good"], center: "Kino" }).build(0, 0.15);
  sc.cycle({ x: 1500, y: 720, r: 170, steps: [{ icon: "pencil", label: "write" }, { icon: "gear", label: "build" }, { icon: "play", label: "render" }, { icon: "chartup", label: "share" }] }).build(0, 0.2);
  sc.pyramid({ x: 250, y: 860, w: 380, h: 300, levels: ["Vision", "Strategy", "Tactics", "Tasks"] }).build(0, 0.15);
  sc.matrix({ x: 720, y: 880, size: 340, quadrants: ["Quick wins", "Big bets", "Fill-ins", "Money pits"], xLabel: "effort", yLabel: "impact" }).build(0, 0.1);
  sc.funnelStages({ x: 1080, y: 880, w: 300, h: 300, stages: ["Visit", "Try", "Buy"] }).build(0, 0.1);
});

film.scene("type", sc => {
  sc.text("Typography", { x: 40, y: 40, size: 34, align: "left", visible: true });
  const a = sc.text("Words that [move.]", { x: 480, y: 200, size: 90 }); a.in(0, "words");
  const b = sc.text("Highlight the key word", { x: 480, y: 360, size: 64 }); b.in(0, "fade"); b.highlight("key", 0.4);
  const c = sc.text("Circle what matters", { x: 480, y: 500, size: 64 }); c.in(0, "fade"); c.circle("matters", 0.4);
  const d = sc.text("Strike the old way", { x: 480, y: 640, size: 64 }); d.in(0, "fade"); d.strike("old", 0.4);
  const e = sc.text("Typewriter for code & UI", { x: 480, y: 780, size: 56, font: "mono" }); e.in(0, "type", 0.02);
  const f = sc.text("hand-written notes", { x: 480, y: 920, size: 80, font: "hand", color: "a2" }); f.in(0, "letters", 0.02);
  sc.ground({ y: 860, x0: 1000, x1: 1900 });
  const bob = sc.figure({ x: 1250, y: 860, size: 280, character: "office" });
  sc.bubble(bob, "Hello!", 0.2, null, {});
  const amy = sc.figure({ x: 1650, y: 860, size: 280, character: "dress", facing: -1 });
  sc.bubble(amy, "lightbulb", 0.4, null, { type: "thought", icon: "lightbulb" });
  sc.lowerThird("Amy Rivera", "Head of Product", 0.3, { x: 1180, y: 300 });
  sc.caption("Burned-in captions follow the voice-over", 0.2, 4.9);
});

film.scene("fx", sc => {
  sc.text("Effects", { x: 40, y: 40, size: 34, align: "left", visible: true });
  sc.fx.confetti(260, 600, 0.0); sc.fx.burst(620, 400, 0.4, { n: 12 }); sc.fx.sparkle(900, 380, 0.3, { n: 8 });
  sc.fx.impact(1180, 400, 0.45); sc.fx.ripple(1450, 400, 0.3, { n: 3 }); sc.fx.zap(1600, 250, 1800, 520, 0.4);
  sc.fx.puff(300, 900, 0.35, { n: 7 }); sc.fx.hearts(650, 950, 0.0); sc.fx.thought(940, 900, 0.0); sc.fx.emphasis(1200, 900, 0.4);
  sc.fx.smoke(1480, 960, 0, 0.6); sc.fx.sweat(1700, 820, 0.2);
  [["confetti", 260], ["burst", 620], ["sparkle", 900], ["impact", 1180], ["ripple", 1450], ["zap", 1700]].forEach(([n, x]) => label(sc, n, x, 600 - 0 + (n === "confetti" ? 80 : 0), 24));
  [["puff", 300], ["hearts", 650], ["thought", 940], ["emphasis", 1200], ["smoke", 1480], ["sweat", 1700]].forEach(([n, x]) => label(sc, n, x, 1010, 24));
});

const THEMES = ["light", "dark", "paper", "chalkboard", "blueprint", "neon", "studio", "sunset"];
THEMES.forEach(name => film.scene("th-" + name, sc => {
  sc.ground();
  sc.title(name, { y: 150, size: 96, kicker: "theme" }).in(0, "pop");
  const f = sc.figure({ x: 520, character: name === "studio" ? "zeke" : "classic" }); f.pose("present", 0, 0.01);
  sc.prop("rocket", { x: 760, y: sc.groundY - 260, size: 150, rotation: 30 });
  sc.prop("lightbulb", { x: 320, y: sc.groundY - 420, size: 110 });
  sc.barChart({ x: 1350, y: 560, w: 620, h: 380, data: [{ label: "A", value: 3, color: "a1" }, { label: "B", value: 5, color: "a3" }, { label: "C", value: 8, color: "a2" }] }).grow(0, 0.5, 0.08);
  sc.text("Accent  Accent  Accent", { x: sc.cx, y: 990, size: 40, visible: true }).words.forEach((w, i) => w.style.color = sc.theme.accents[i]);
}, { theme: name }));

film.scene("worlds", sc => {
  sc.text("Environments", { x: 40, y: 40, size: 34, align: "left", visible: true, color: "#fff", bg: "#111" });
  sc.env.city({ y: 520, height: 300, x1: 960 });
  sc.env.mountains({ y: 520 }); 
  sc.env.clouds({ n: 4, drift: false, y0: 90 });
  sc.env.road({ y: 860, h: 110 });
  sc.env.trees({ n: 6, y: 860, size: 180, x0: 1000, x1: 1900 });
  const off = sc.env.office({ x: 1400, y: 640 });
  const f = sc.figure({ x: off.seatX, y: 640, size: 260, character: "office" }); f.sit(0, off.seatY, { d: 0.01, pose: "typing" });
  sc.figure({ x: 400, y: 860, size: 240 }).runTo(700, 0);
});
