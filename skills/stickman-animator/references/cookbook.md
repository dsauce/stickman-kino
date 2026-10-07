# Stickman Kino cookbook

Copy-paste recipes for common explainer moments. Every recipe is a real, tested scene in `samples/recipes/` (rendered by CI-free `stickman check`), so the code here is known to work. Times are local seconds; tweak positions with `sc.W`, `sc.H`, `sc.groundY`.

- [Walk in, wave, introduce](#intro)
- [The idea moment (think → bulb → glow)](#idea)
- [Point at a chart while it grows](#explain-chart)
- [Problem pile-up (rain of props, sweat, red X)](#pile-up)
- [Before / after split screen](#before-after)
- [Process flow with a travelling token](#process)
- [Typing at a desk, code appears](#desk-code)
- [Big number reveal](#big-number)
- [Running montage (camera follow + scrolling road)](#montage)
- [Climb the stairs (progress metaphor)](#climb)
- [Throw and catch between two figures](#throw-catch)
- [Two characters talk (speech + thought bubbles)](#conversation)
- [Checklist reveal](#checklist)
- [Holding a phone, app screen pops up](#phone-demo)
- [Walk along a timeline](#journey)
- [Weighing the options](#weigh)
- [End card with call to action](#end-card)

<a id="intro"></a>
## Walk in, wave, introduce

```js
film.scene("intro", sc => {
  sc.ground();
  const bob = sc.figure({ x: -120, face: "dots" });
  const t = bob.walkTo(sc.W * 0.32, 0.2);
  bob.wave(t);
  sc.title("Meet Bob", { x: sc.W * 0.68, y: sc.H * 0.36, sub: "he explains things" }).in(t - 0.4);
});
```

<a id="idea"></a>
## The idea moment (think → bulb → glow)

```js
film.scene("idea", sc => {
  sc.ground();
  const bob = sc.figure({ x: sc.cx, face: "dots" });
  bob.think(0.3, 1.2);
  const bulb = sc.prop("lightbulb", { x: sc.cx + 40, y: sc.groundY - 430, size: 130, hidden: true });
  bulb.pop(1.5); bulb.glow(1.8, 0.8);
  sc.fx.burst(sc.cx + 40, sc.groundY - 430, 1.6, { n: 10, r: 80 });
  bob.pose("pointUp", 1.6, 0.3); bob.emote("grin", 1.6);
});
```

<a id="explain-chart"></a>
## Point at a chart while it grows

```js
film.scene("explain-chart", sc => {
  sc.ground();
  const bob = sc.figure({ x: sc.W * 0.2, character: "office" });
  const ch = sc.barChart({ x: sc.W * 0.62, y: sc.H * 0.45, w: 760, h: 440, data: [{ label: "Q1", value: 12 }, { label: "Q2", value: 18 }, { label: "Q3", value: 31, color: "a2" }], prefix: "$", suffix: "k" });
  ch.grow(0.4);
  bob.point(sc.W * 0.5, sc.H * 0.55, 0.5);
  bob.point(sc.W * 0.72, sc.H * 0.3, 2.0);
  ch.highlight(2, 2.4, "a3");
  bob.talk(2.6, 4.6);
});
```

<a id="pile-up"></a>
## Problem pile-up (rain of props, sweat, red X)

```js
film.scene("pile-up", sc => {
  sc.ground();
  const bob = sc.figure({ x: sc.cx, face: "dots", pose: "scared" });
  bob.emote("worried", 0);
  sc.fx.rain(["envelope", "bell", "calendar", "document"], 0.2, 3.0, { n: 22, pile: true, x0: sc.cx - 320, x1: sc.cx + 320, layer: "front" });
  sc.camera.shake(0.6, 0.4);
  bob.sad(1.5); sc.fx.sweat(sc.cx + 40, sc.groundY - 330, 1.8);
  sc.prop("error", { x: sc.cx, y: sc.groundY - 170, size: 200, layer: "front", hidden: true }).pop(3.4);
});
```

<a id="before-after"></a>
## Before / after split screen

```js
film.scene("before-after", sc => {
  const vs = sc.versus({ leftTitle: "Before", rightTitle: "After", leftColor: "soft" });
  vs.in(0.1);
  sc.ground();
  const a = sc.figure({ x: vs.leftX - 60, face: "dots" }); a.sitFloor(0, 0.01); a.sad(0.6);
  sc.prop("stack", { x: vs.leftX + 170, y: sc.groundY - 90, size: 160 });
  const b = sc.figure({ x: vs.rightX, character: "zeke", face: "dots" });
  b.celebrate(1.2, { confetti: false }); sc.fx.sparkle(vs.rightX, sc.groundY - 380, 1.4);
});
```

<a id="process"></a>
## Process flow with a travelling token

```js
film.scene("process", sc => {
  const fl = sc.flow({ nodes: [
    { id: "in", label: "Upload", x: 380, y: 420, icon: "document" },
    { id: "ai", label: "Analyse", x: 960, y: 420, icon: "robot" },
    { id: "out", label: "Report", x: 1540, y: 420, icon: "report", color: "a3" }
  ], edges: [["in", "ai"], ["ai", "out"]] });
  const t = fl.build(0.3, 0.5);
  fl.token("in", "ai", t, 0.6); fl.pulse("ai", t + 0.6, "a2"); fl.token("ai", "out", t + 1.0, 0.6); fl.pulse("out", t + 1.6);
  sc.text("3 steps, zero copy-paste", { y: 760, size: 64 }).in(t + 0.5, "words");
});
```

<a id="desk-code"></a>
## Typing at a desk, code appears

```js
film.scene("desk-code", sc => {
  sc.ground();
  const off = sc.env.office({ x: 520 });
  const dev = sc.figure({ x: off.seatX, character: "office" });
  dev.sit(0, off.seatY, { d: 0.01, pose: "typing" }); dev.typing(0.2, 4.8);
  sc.rect(1380, 470, 780, 300, { r: 22, fill: "#111111", stroke: false });
  ["npm run build", "✓ 42 tests passed", "deployed 🚀"].forEach((l, i) =>
    sc.text(l, { x: 1020, y: 380 + i * 80, size: 42, font: "mono", align: "left", color: i ? "#7EE787" : "#FFFFFF" }).in(0.4 + i * 1.2, "type", 0.04));
});
```

<a id="big-number"></a>
## Big number reveal

```js
film.scene("big-number", sc => {
  sc.ground();
  const bob = sc.figure({ x: sc.W * 0.22, face: "dots" });
  const st = sc.stat(1250000, "people reached", { x: sc.W * 0.62, y: sc.H * 0.4, size: 170, prefix: "", color: "a2" });
  const e = st.in(0.3, 1.8);
  bob.surprise(e - 0.1); sc.fx.confetti(sc.W * 0.62, sc.H * 0.3, e);
});
```

<a id="montage"></a>
## Running montage (camera follow + scrolling road)

```js
film.scene("montage", sc => {
  sc.ground({ x0: -400, x1: 8000 });
  sc.env.road({ x1: 8000, wide: true });
  sc.env.trees({ n: 12, x0: 0, x1: 5000 });
  const runner = sc.figure({ x: 300, character: "zeke" });
  runner.runTo(3800, 0.1, { d: 4.8, end: false });
  sc.camera.follow(runner, 0.1, 4.9, { lead: 240 });
  sc.fx.speedLines(0.6, 4.6);
});
```

<a id="climb"></a>
## Climb the stairs (progress metaphor)

```js
film.scene("climb", sc => {
  sc.ground();
  const steps = [0, 1, 2, 3].map(i => sc.rect(700 + i * 220, sc.groundY - (i + 1) * 60, 220, (i + 1) * 120, { r: 4, fill: "soft" }));
  const bob = sc.figure({ x: 440 });
  let t = bob.walkTo(560, 0.2);
  [0, 1, 2, 3].forEach(i => { t = bob.jumpTo(700 + i * 220, sc.groundY - (i + 1) * 120, t, { d: 0.5, h: 90 }); });
  sc.prop("flag", { x: 1440, y: sc.groundY - 540, size: 140, hidden: true }).pop(t);
  bob.cheer(t);
});
```

<a id="throw-catch"></a>
## Throw and catch between two figures

```js
film.scene("throw-catch", sc => {
  sc.ground();
  const a = sc.figure({ x: 420, face: "dots" });
  const b = sc.figure({ x: 1500, face: "dots", facing: -1, character: "dress" });
  const ball = a.throw("coin", 1440, sc.groundY - 230, 0.6, { size: 70, h: 260, d: 0.9 });
  b.reach(1440, sc.groundY - 230, 1.3, 0.25);
  ball.pulse(1.8); b.emote("grin", 1.8); b.celebrate(2.4, { confetti: false });
});
```

<a id="conversation"></a>
## Two characters talk (speech + thought bubbles)

```js
film.scene("conversation", sc => {
  sc.ground();
  const amy = sc.character("exec", { x: 640 });
  const raj = sc.character("builder", { x: 1280, facing: -1 });
  sc.bubble(amy, "Ship Friday?", 0.3, 1.6);
  amy.talk(0.3, 1.8);
  sc.bubble(raj, "calendar", 2.1, 1.4, { type: "thought", icon: "calendar" });
  raj.think(2.0, 1.4);
  raj.thumbsUp(3.7); sc.bubble(raj, "Deal!", 3.7, 1.2);
});
```

<a id="checklist"></a>
## Checklist reveal

```js
film.scene("checklist", sc => {
  sc.ground();
  const bob = sc.figure({ x: sc.W * 0.78, facing: -1, character: "grad" });
  const l = sc.list(["Write the story", "Pick a theme", "Render the film"], { x: 220, y: 300, gap: 130, size: 64 });
  const e = l.in(0.4, 0.8);
  bob.present(0.4); bob.celebrate(e, { confetti: false });
});
```

<a id="phone-demo"></a>
## Holding a phone, app screen pops up

```js
film.scene("phone-demo", sc => {
  sc.ground();
  const u = sc.figure({ x: sc.W * 0.3, face: "dots" });
  const ph = u.hold("phone", 0.3, { size: 110, dx: 20, dy: -50 });
  u.pose("carry", 0.3, 0.3);
  const screen = sc.rect(sc.W * 0.66, sc.H * 0.42, 380, 640, { r: 40, fill: "paper", width: 8, hidden: true }); screen.pop(1.0);
  ["chat", "calendar", "chartup"].forEach((p, i) => sc.prop(p, { x: sc.W * 0.66, y: sc.H * 0.24 + i * 170, size: 120, layer: "back", hidden: true }).pop(1.4 + i * 0.35));
  sc.arrow(sc.W * 0.36, sc.H * 0.45, sc.W * 0.55, sc.H * 0.42, { bend: -0.2 }).draw(1.0, 0.4);
  u.tap(sc.W * 0.3 + 60, sc.groundY - 210, 2.8);
});
```

<a id="journey"></a>
## Walk along a timeline

```js
film.scene("journey", sc => {
  const tl = sc.timeline({ x: sc.cx, y: sc.H * 0.62, w: 1500, items: [{ date: "2019", label: "idea" }, { date: "2021", label: "first user" }, { date: "2023", label: "1M users", color: "a3" }, { date: "2026", label: "today", color: "a1" }] });
  tl.build(0.2, 0.3);
  const bob = sc.figure({ x: tl.markX(0), y: sc.H * 0.62 - 12, size: 180 });
  let t = 1.4; [1, 2, 3].forEach(i => { t = bob.walkTo(tl.markX(i), t, { d: 0.9 }); t += 0.1; });
  bob.celebrate(t, { confetti: true, n: 14 });
});
```

<a id="weigh"></a>
## Weighing the options

```js
film.scene("weigh", sc => {
  sc.ground();
  const bal = sc.balance({ x: sc.W * 0.6, y: sc.H * 0.38, left: ["coin", "coin"], right: ["clock", "heart", "users"] });
  const bob = sc.figure({ x: sc.W * 0.2, character: "scientist" });
  bob.think(0.3, 1.4);
  bal.tip(-14, 1.8, 1.2);
  bob.point(sc.W * 0.78, sc.H * 0.62, 2.4);
  sc.text("time > money", { x: sc.W * 0.6, y: 120, size: 72, font: "hand", color: "a2" }).in(2.6, "pop");
});
```

<a id="end-card"></a>
## End card with call to action

```js
film.scene("end-card", sc => {
  sc.ground();
  const bob = sc.character("zeke", { x: -150 });
  const t = bob.walkTo(sc.W * 0.2, 0.1);
  sc.title("Subscribe for more", { y: sc.H * 0.34, kicker: "thanks for watching", sub: "new stickman explainers every week" }).in(0.6);
  const btn = sc.rect(sc.cx, sc.H * 0.6, 420, 110, { r: 55, fill: "a1", stroke: false, hidden: true }); btn.pop(1.6);
  sc.text("▶  Subscribe", { y: sc.H * 0.6, size: 52, color: "#FFFFFF" }).in(1.7, "fade");
  btn.pulse(2.6); btn.pulse(3.6);
  bob.point(sc.cx - 230, sc.H * 0.6, t);
});
```

---
Regenerate with `node scripts/cookbook.mjs` after editing samples/recipes/scenes.js.
