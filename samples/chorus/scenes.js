// Chorus - a fictional chore-sharing app. The front-page film for Stickman Kino.
// Every clip uses local time; sc.cue("word") lands visuals on the narrator's words.
const film = SM.film();

// ---- the cast + brand
const SAM = { character: "zeke", face: "dots" };                                   // yellow tee, red beanie
const MIA = { dress: "#2EC4B6", hair: "bun", face: "dots" };                       // teal dress
const LEO = { height: 0.72, hat: "cap", hatColor: "#1D7FE0", shirt: "#1D7FE0", face: "dots" }; // the kid
const COL = { sam: "#FFC531", mia: "#2EC4B6", leo: "#1D7FE0" };
SM.defineProp("chorus", c => {
  c.R(-46, -46, 92, 92, 26, { f: "#6C4BFF", s: "n" });
  c.P("M-26,2 L0,-22 L26,2", { f: "n", s: "#FFFFFF", w: 1.5 });
  c.P("M-19,-4 V26 H19 V-4", { f: "n", s: "#FFFFFF", w: 1.5 });
  c.P("M4,16 V-6 L13,-9", { f: "n", s: "#FFB020", w: 1.3 });
  c.C(-1, 16, 6, { f: "#FFB020", s: "n" });
}, null, "chorus logo app brand");
const avatar = (sc, who, x, y, r, layer) => {
  const g = sc.circle(x, y, r, { fill: COL[who], layer: layer || "back", hidden: true });
  const t = SM.el("text", { x: 0, y: 2, "text-anchor": "middle", "dominant-baseline": "central", "font-family": "Inter, sans-serif", "font-weight": 800, "font-size": r * 1.05, fill: "#FFFFFF" }, g.el);
  t.textContent = who[0].toUpperCase(); if (who === "sam") t.setAttribute("fill", "#111111"); return g;
};

// 0 · INTRO - film-leader countdown → "Whose turn is it?"
film.scene("intro", sc => {
  const tTitle = sc.intro("countdown", sc.clip.intro) - 0.9;   // returns when the title has landed
  // chores burst out around the title
  const ring = ["dishes", "trashbag", "laundry", "broom", "spray", "sponge", "vacuum", "washer"];
  ring.forEach((name, i) => {
    const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2 + 0.39, x = sc.cx + Math.cos(a) * 720, y = sc.H * 0.46 + Math.sin(a) * 320;
    const p = sc.prop(name, { x: sc.cx, y: sc.H * 0.46, size: 96, layer: "ui", hidden: true, rotation: (i % 2 ? 12 : -12) });
    p.pop(tTitle + 0.05 + i * 0.04, 0.3); p.moveTo(x, y, tTitle + 0.05 + i * 0.04, 0.55, "back.out(1.6)"); p.bob(tTitle + 0.7, sc.dur, 10, 1.2);
  });
  sc.exit("wipe-left", { d: 0.45, color: "a2" });
});

// 1 · HOOK - 11 pm, a full sink, three people who are sure it wasn't them
film.scene("standoff", sc => {
  sc.enter("wipe-left", { d: 0.45, color: "a2" });
  sc.ground();
  sc.env.room({ night: true, windowX: 1480, frameX: 180 });
  const counterTop = sc.groundY - 210;
  sc.rect(960, sc.groundY - 105, 440, 210, { r: 10, fill: "soft" });
  sc.rect(960, counterTop, 470, 18, { r: 6, fill: "paper" });
  sc.prop("clock", { x: 230, y: 160, size: 90, layer: "ui", hidden: true }).pop(sc.cue("eleven") - 0.2);
  sc.text("11:00 PM", { x: 300, y: 160, size: 54, font: "mono", align: "left" }).in(sc.cue("eleven"), "type", 0.06);
  // the dish tower
  const dishes = [];
  for (let i = 0; i < 7; i++) { const d = sc.prop("dishes", { x: 960 + (i % 2 ? 10 : -12) + (i === 6 ? 14 : 0), y: counterTop - 46 - i * 50, size: 96, hidden: true }); d.dropIn(sc.cue("sink") - 0.2 + i * 0.16, 0.4, 220); dishes.push(d); }
  dishes.slice(3).forEach((d, k) => d.wobble(sc.cue("again") + 0.1 + k * 0.04, 0.7, 6));
  // the housemates
  const sam = sc.figure(Object.assign({ x: 560 }, SAM));
  const mia = sc.figure(Object.assign({ x: 1420, facing: -1 }, MIA));
  const leo = sc.figure(Object.assign({ x: -120 }, LEO));
  sam.blinks(0, 9); mia.blinks(0.4, 9);
  sam.emote("neutral", 0); mia.emote("neutral", 0);
  sam.lookAt(960, counterTop - 250, 1.9); mia.lookAt(960, counterTop - 250, 2.0);
  leo.walkTo(300, sc.cue("everyone") - 0.4, { d: 1.0 });
  sc.camera.focus(960, 540, 1.05, 0.4, 6.5, "sine.inOut");
  const tp = sc.cue("absolutely");
  sam.point(mia.headPos().x, mia.headPos().y, tp); sam.emote("worried", tp);
  mia.point(leo.x + 40, sc.groundY - 280, tp + 0.15); mia.emote("worried", tp + 0.15);
  leo.point(sam.x, sc.groundY - 250, tp + 0.3); leo.emote("worried", tp + 0.3);
  [sam, mia, leo].forEach((f, i) => sc.bubble(f, "Not me!", sc.cue("wasn't") - 0.4 + i * 0.22, 2.1, { size: 44 }));
  // the top plate slides off… (the last straw)
  const top = dishes[6];
  top.arcTo(1180, sc.groundY - 30, sc.cue("them") + 0.35, 0.65, 90, { spin: 200 });
  sc.fx.impact(1180, sc.groundY - 40, sc.cue("them") + 1.0, { r: 70 });
  [sam, mia, leo].forEach(f => f.surprise(sc.cue("them") + 1.0, 0.5));
  sc.exit("wipe-left", { d: 0.45 });
});

// 2 · DISRUPT - sticky notes, a chore wheel, a 40-message group chat… and a standoff
film.scene("chaos", sc => {
  sc.enter("wipe-left", { d: 0.45 });
  sc.ground();
  const fridge = sc.prop("fridge", { x: 360, y: sc.groundY - 190, size: 400 });
  const notes = [];
  [[-60, -120], [10, -140], [-30, -70], [40, -60], [-55, 10], [25, 20], [-10, 80], [45, 100]].forEach(([dx, dy], i) => {
    const n = sc.prop("sticky", { x: 360 + dx, y: sc.groundY - 190 + dy, size: 64, rotation: (i % 2 ? 9 : -8), accent: ["a3", "#FFD3DA", "#C9F2EC"][i % 3], hidden: true });
    n.dropIn(sc.cue("sticky") - 0.1 + i * 0.09, 0.35, 160); notes.push(n);
  });
  const wheel = sc.cycle({ x: 960, y: 430, r: 210, steps: [{ icon: "dishes" }, { icon: "trashbag" }, { icon: "laundry" }, { icon: "broom" }] });
  wheel.build(sc.cue("chore") - 0.2, 0.18);
  wheel.spin(sc.cue("wheel") + 0.5, 1.4);
  const chats = sc.fx.rain(["chat", "chats"], sc.cue("forty") - 0.1, sc.cue("chat") + 0.4, { n: 16, x0: 1360, x1: 1800, pile: true, pileY: sc.groundY - 40, size: 90, layer: "back" });
  const cnt = sc.counter(40, { from: 1, x: 1560, y: 180, size: 88, color: "a1", suffix: " messages", bg: "#FFFFFF" }); cnt.count(sc.cue("forty") - 0.1, 1.1);
  // everything clears… the standoff
  const tA = sc.cue("always") - 0.1;
  [fridge, ...notes, wheel, ...chats].forEach(t => t.fadeOut(tA, 0.3)); cnt.out(tA);
  const sam = sc.figure(Object.assign({ x: 800, facing: -1, hidden: true, pose: "handsHips" }, SAM));
  const leo = sc.figure(Object.assign({ x: 965, facing: -1, hidden: true, pose: "handsHips" }, LEO));
  const mia = sc.figure(Object.assign({ x: 1130, hidden: true, pose: "handsHips" }, MIA));
  [sam, leo, mia].forEach((f, i) => { f.pop(tA + 0.2 + i * 0.1); f.emote("sad", tA); });
  const ts = sc.cue("same");
  sc.camera.shake(ts, 0.4, 10);
  [sam, leo, mia].forEach(f => { const h = f.headPos(); sc.fx.emphasis(h.x, h.y, ts + 0.1, { color: "a1" }); });
  sc.text("…every time.", { x: 960, y: 200, size: 80, font: "hand", color: "a1" }).in(ts - 0.1, "pop");
  sc.exit("ink", { d: 0.5, color: "a2" });
});

// 3 · REVEAL - meet Chorus
film.scene("reveal", sc => {
  sc.enter("ink", { d: 0.5, color: "a2" });
  sc.ground();
  const sam = sc.figure(Object.assign({ x: 470 }, SAM));
  sam.blinks(0, 7.5);
  sam.present(sc.cue("meet") - 0.2); sam.emote("grin", sc.cue("meet"));
  sc.text("Meet [Chorus]", { x: 520, y: 210, size: 104, accent: "a2" }).in(sc.cue("meet") - 0.1, "words");
  sc.text("chores, in harmony", { x: 520, y: 300, size: 50, font: "hand", color: "muted" }).in(sc.cue("Chorus") + 0.3, "fade");
  // the app
  const px = 1260, phone = sc.rect(px, 445, 480, 790, { r: 64, fill: "paper", width: 10, hidden: true });
  phone.rise(0.15, 0.5, 120);
  const notch = sc.rect(px, 82, 120, 22, { r: 11, fill: "ink", stroke: false, hidden: true }); notch.fadeIn(0.5);
  sc.prop("chorus", { x: px, y: 175, size: 104, hidden: true }).pop(sc.cue("Chorus") - 0.15);
  sc.prop("house", { x: px - 150, y: 290, size: 64, hidden: true }).pop(sc.cue("home") - 0.1);
  sc.text("Our home", { x: px - 105, y: 292, size: 38, align: "left" }).in(sc.cue("home"), "slide");
  ["sam", "mia", "leo"].forEach((w, i) => avatar(sc, w, px - 110 + i * 110, 385, 36).pop(sc.cue("people") - 0.15 + i * 0.13));
  const rows = [["dishes", "Dishes", "sam"], ["trashbag", "Trash", "mia"], ["laundry", "Laundry", "leo"], ["broom", "Sweep", "sam"], ["vacuum", "Vacuum", "mia"]];
  rows.forEach(([icon, label, who], i) => {
    const y = 485 + i * 70, t0 = sc.cue("splits") - 0.2 + i * 0.16;
    sc.prop(icon, { x: px - 170, y, size: 50, hidden: true }).slideIn(t0, 0.4, "right");
    sc.text(label, { x: px - 130, y, size: 34, align: "left", font: "body", weight: 700 }).in(t0 + 0.05, "slide");
    avatar(sc, who, px + 170, y, 22).pop(sc.cue("every") + i * 0.12);
  });
  const fair = sc.button("fair ✓", { x: px + 230, y: 245, fill: "a3", color: "ink", size: 36, w: 220 }); fair.pop(sc.cue("fairly") - 0.05); sc.set(fair.el, { rotation: 10 }, 0);
  sc.fx.sparkle(px + 230, 245, sc.cue("fairly") + 0.1, { n: 6, layer: "front" });
  sc.exit("slide-left", { d: 0.5 });
});

// 4 · FEATURES - turns, nudges, points
film.scene("features", sc => {
  sc.enter("slide-left", { d: 0.5 });
  sc.ground();
  // whose turn
  const av = ["sam", "mia", "leo"].map((w, i) => avatar(sc, w, 260 + i * 150, 360, 50));
  av.forEach((a, i) => a.pop(0.3 + i * 0.12));
  const marker = sc.prop("arrowdown", { x: 260, y: 260, size: 54, accent: "a3", hidden: true }); marker.pop(0.6);
  marker.arcTo(410, 260, sc.cue("turn") - 0.1, 0.4, 60); marker.arcTo(560, 260, sc.cue("is") + 0.1, 0.4, 60);
  marker.bob(sc.cue("is") + 0.6, sc.dur, 8, 0.8);
  sc.text("whose turn?", { x: 410, y: 460, size: 52, font: "hand", color: "muted" }).in(0.5, "fade");
  // a friendly nudge
  const leo = sc.figure(Object.assign({ x: 960 }, LEO));
  leo.blinks(0, 8);
  const bell = sc.prop("bell", { x: 1000, y: sc.groundY - 330, size: 96, hidden: true });
  bell.pop(sc.cue("nudge") - 0.5); bell.wobble(sc.cue("nudge") - 0.2, 0.8, 18);
  sc.fx.ripple(1000, sc.groundY - 330, sc.cue("nudge") - 0.2, { n: 2, r: 30 });
  leo.surprise(sc.cue("nudge") - 0.3, 0.5); leo.emote("happy", sc.cue("nudge") + 0.4); leo.thumbsUp(sc.cue("nudge") + 0.35);
  sc.text("friendly nudge", { x: 960, y: 300, size: 52, font: "hand", color: "muted" }).in(sc.cue("friendly"), "fade");
  // points + leaderboard
  const lb = sc.hbarChart({ x: 1510, y: 380, w: 620, h: 300, labelWidth: 140, data: [{ label: "Mia", value: 120, color: COL.mia }, { label: "Sam", value: 95, color: COL.sam }, { label: "Leo", value: 80, color: COL.leo }], suffix: " pts", valueSize: 34 });
  lb.grow(sc.cue("points") - 0.2, 0.8, 0.18);
  [0, 1, 2].forEach(i => { const cn = sc.prop("coin", { x: 1010, y: sc.groundY - 200, size: 56, hidden: true, layer: "front" }); cn.show(sc.cue("turns") + i * 0.18); cn.arcTo(1330 + i * 60, 250 + i * 90, sc.cue("turns") + i * 0.18, 0.7, 180, { spin: 360 }); cn.popOut(sc.cue("turns") + i * 0.18 + 0.7, 0.2); });
  sc.text("+10 pts", { x: 1510, y: 170, size: 64, color: "a3", outline: "ink" }).in(sc.cue("points"), "pop");
  sc.exit("flash", { d: 0.2 });
});

// 5 · TWIST - win the week, pick the movie… and the race to the trash
film.scene("race", sc => {
  sc.enter("flash", { d: 0.25 });
  sc.ground({ x0: -400, x1: 6000 });
  // movie night set
  sc.prop("sofa", { x: 1250, y: sc.groundY - 70, size: 320 });
  sc.prop("tv", { x: 1650, y: sc.groundY - 140, size: 230 });
  const mia = sc.figure(Object.assign({ x: 620 }, MIA));
  const trophy = mia.hold("trophy", null, { size: 100, dx: 12, dy: -60, accent: "a3" }); trophy.hide();
  mia.pose("lift", sc.cue("Win") - 0.1, 0.3); trophy.pop(sc.cue("Win"));
  mia.celebrate(sc.cue("week"), { hold: true, n: 30 });
  sc.prop("popcorn", { x: 1080, y: sc.groundY - 250, size: 110, hidden: true }).pop(sc.cue("movie") - 0.1);
  sc.prop("ticket", { x: 1430, y: 240, size: 130, rotation: -10, hidden: true }).pop(sc.cue("pick"));
  sc.text("movie night: Mia's pick", { x: 1300, y: 140, size: 54, font: "hand", color: "a2" }).in(sc.cue("movie"), "words");
  // …suddenly: the race
  const tS = sc.cue("Suddenly") - 0.1, X0 = 2600;
  sc.camera.whip(X0 + 300, sc.cy, tS, 0.5);
  const leo = sc.figure(Object.assign({ x: X0 - 40 }, LEO));
  const sam = sc.figure(Object.assign({ x: X0 + 120 }, SAM));
  const bagL = leo.hold("trashbag", null, { size: 80, dx: 10, dy: 10, accent: "#3B3B3B" });
  const bagS = sam.hold("trashbag", null, { size: 95, dx: 10, dy: 10, accent: "#3B3B3B" });
  const bin = sc.prop("bin", { x: X0 + 1900, y: sc.groundY - 60, size: 150 });
  sc.bubble(leo, "My turn!", tS + 0.35, 1.0, { size: 40, dx: 40, dy: 110 });
  const tR = sc.cue("racing") - 0.2;
  sam.runTo(X0 + 1700, tR, { d: 1.5 });
  leo.runTo(X0 + 1560, tR + 0.05, { d: 1.55 });
  sc.camera.follow(sam, tR, tR + 1.5, { lead: -150 });
  sc.fx.speedLines(tR + 0.2, tR + 1.4, { color: "muted" });
  const tB = tR + 1.75;
  bagS.hide(tB); bagL.hide(tB + 0.15);
  sc.prop("trashbag", { x: X0 + 1760, y: sc.groundY - 210, size: 95, accent: "#3B3B3B", hidden: true }).show(tB).arcTo(X0 + 1900, sc.groundY - 90, tB, 0.45, 120);
  sc.prop("trashbag", { x: X0 + 1620, y: sc.groundY - 180, size: 80, accent: "#3B3B3B", hidden: true }).show(tB + 0.15).arcTo(X0 + 1890, sc.groundY - 80, tB + 0.15, 0.5, 160);
  bin.wobble(tB + 0.45, 0.6, 10); sc.fx.puff(X0 + 1900, sc.groundY, tB + 0.5, { n: 6 });
  sam.victory(tB + 0.6); leo.cheer(tB + 0.7);
  sam.emote("grin", tB + 0.6); leo.emote("grin", tB + 0.7);
  sc.exit("zoom", { d: 0.45 });
});

// 6 · PRODUCT LOCKUP
film.scene("lockup", sc => {
  sc.enter("zoom", { d: 0.45 });
  sc.ground();
  const logo = sc.prop("chorus", { x: 560, y: 330, size: 230, hidden: true }); logo.pop(sc.cue("Chorus") - 0.2, 0.5); logo.wobble(sc.cue("Chorus") + 0.4, 0.6, 6);
  sc.fx.burst(560, 330, sc.cue("Chorus"), { n: 12, r: 140, len: 40, color: "a3" });
  sc.text("Chorus", { x: 720, y: 300, size: 170, align: "left" }).in(sc.cue("Chorus"), "rise");
  sc.text("Chores, in [harmony.]", { x: 724, y: 430, size: 64, align: "left", font: "hand", accent: "a2" }).in(sc.cue("Chores"), "words");
  sc.button("Coming soon", { x: 880, y: 545, fill: "a2", size: 34, w: 330 }).pop(sc.cue("coming") - 0.1);
  sc.text("…to a very clean home near you", { x: 1080, y: 545, size: 36, font: "body", weight: 600, color: "muted", align: "left" }).in(sc.cue("very") - 0.2, "fade");
  sc.prop("house", { x: 1520, y: sc.groundY - 150, size: 300 });
  const sam = sc.figure(Object.assign({ x: 1270, size: 250 }, SAM));
  const leo = sc.figure(Object.assign({ x: 1520, size: 250 }, LEO));
  const mia = sc.figure(Object.assign({ x: 1760, size: 250, facing: -1 }, MIA));
  [sam, leo, mia].forEach((f, i) => { f.celebrate(sc.cue("harmony") - 0.2 + i * 0.12, { hold: true, confetti: false }); });
  sc.fx.hearts(1520, sc.groundY - 330, sc.cue("harmony") + 0.3, { n: 6 });
  sc.text("Chorus is a fictional app. This film was made 100% in code with Stickman Kino.", { x: 960, y: 1030, size: 24, font: "body", weight: 500, color: "muted" }).in(0.6, "fade");
  sc.exit("fade", { d: 0.45, color: "bg" });
});

// 7 · OUTRO - made with Stickman Kino
film.scene("outro", sc => {
  sc.enter("fade", { d: 0.45, color: "bg" });
  sc.ground();
  sc.outro("kino", sc.clip.outro);
  const sam = sc.figure(Object.assign({ x: sc.W + 150, facing: -1 }, SAM));
  const t = sam.walkTo(1500, 0.3, { speed: 420 });
  sam.point(1140, 832, t); sam.emote("grin", t);
  const mia = sc.figure(Object.assign({ x: 420 }, MIA));
  mia.wave(1.0, 3);
});
