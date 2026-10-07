// Why compound interest feels like magic - a 50 s explainer in the "paper" theme.
// Figures: $100 at 8%/yr compounded yearly → $2,172 after 40 years; year-1 interest $8, year-30 interest ≈ $74.
const film = SM.film();
const growth = n => 100 * Math.pow(1.08, n);

// 1 · HOOK - one coin, a huge number
film.scene("hook", sc => {
  sc.ground();
  const bob = sc.figure({ x: sc.W * 0.2, face: "dots" });
  const pig = sc.prop("piggybank", { x: sc.W * 0.2 + 230, y: sc.groundY - 62, size: 150 });
  bob.throw("coin", pig.x - 10, pig.y - 60, 0.4, { size: 60, h: 120, d: 0.5 });
  pig.pulse(1.25); pig.wobble(1.25, 0.5, 6);
  const num = sc.counter(growth(40), { from: 100, prefix: "$", x: sc.W * 0.7, y: sc.H * 0.36, size: 190, color: "a2" });
  num.count(sc.cue("forty") - 0.2, 2.6);
  sc.text("in 40 years", { x: sc.W * 0.7, y: sc.H * 0.36 + 170, size: 54, font: "hand", color: "muted" }).in(sc.cue("forty"), "rise");
  bob.surprise(sc.cue("thousand"));
  sc.text("…without adding a single cent", { x: sc.W * 0.7, y: sc.H * 0.66, size: 52, font: "hand", color: "a1" }).in(sc.cue("Without"), "words");
  sc.text("Illustration: 8% a year, compounded yearly. Not financial advice.", { x: sc.W - 40, y: sc.H - 40, size: 24, font: "body", weight: 500, color: "muted", align: "right" }).in(0.6, "fade");
  sc.exit("fade", { d: 0.4, color: "bg" });
});

// 2 · DISRUPT - not big wins: small amounts + time
film.scene("myth", sc => {
  sc.enter("fade", { d: 0.4, color: "bg" });
  sc.ground();
  const bob = sc.figure({ x: sc.cx, face: "dots" });
  const bag = sc.prop("moneybag", { x: sc.W * 0.2, y: sc.H * 0.42, size: 230, hidden: true }); bag.pop(0.4);
  sc.fx.sparkle(sc.W * 0.2, sc.H * 0.38, 0.6, { n: 7, spread: 140 });
  const big = sc.text("big wins?", { x: sc.W * 0.2, y: sc.H * 0.62, size: 70 }); big.in(0.6, "pop");
  bob.shrug(sc.cue("think"));
  big.strike("big", sc.cue("mostly") - 0.1); bag.tint(sc.theme.muted, sc.cue("mostly"), 0.4);
  const coin = sc.prop("coin", { x: sc.W * 0.74, y: sc.H * 0.4, size: 90, hidden: true }); coin.pop(sc.cue("small"));
  const cal = sc.prop("calendar", { x: sc.W * 0.86, y: sc.H * 0.4, size: 130, hidden: true }); cal.pop(sc.cue("time"));
  const small = sc.text("small + [time]", { x: sc.W * 0.8, y: sc.H * 0.62, size: 70 }); small.in(sc.cue("small") + 0.1, "words");
  small.underline("time", sc.cue("time") + 0.3, "a3");
  bob.point(sc.W * 0.78, sc.H * 0.45, sc.cue("small") - 0.2);
  sc.exit("wipe-right", { d: 0.45, color: "a3" });
});

// 3 · SECRET - the snowball
film.scene("snowball", sc => {
  sc.enter("wipe-right", { d: 0.45, color: "a3" });
  const top = 430, x0 = 160, x1 = 1760, G = sc.groundY;
  const hillY = x => x <= 420 ? top : G - (G - top) * Math.pow(1 - (x - 420) / (x1 - 420), 2);
  let d = `M${x0 - 300},${top}`; for (let x = 420; x <= x1; x += 20) d += ` L${x},${hillY(x)}`; d += ` L${sc.W + 300},${G} L${sc.W + 300},${sc.H + 50} L${x0 - 300},${sc.H + 50} Z`;
  const hill = SM.el("path", { d, fill: sc.theme.soft, stroke: sc.theme.ink, "stroke-width": 6, "stroke-linejoin": "round" }, sc.world);
  const bob = sc.figure({ x: 250, y: top, face: "dots" });
  const s0 = 70, ball = sc.prop("snowball", { x: 360, y: top - s0 * 0.4, size: s0 });
  const t0 = sc.cue("trick");
  bob.push(t0 - 0.5, t0 + 0.3, 40);
  const kf = [], steps = 28, dur = 3.6;
  for (let i = 1; i <= steps; i++) {
    const u = i / steps, x = 360 + (x1 - 140 - 360) * Math.pow(u, 1.4), k = 1 + 2.6 * u;
    kf.push({ x, y: hillY(x) - s0 * 0.4 * k, scale: k, duration: dur / steps, ease: "none" });
  }
  sc.tl.to(ball.el, { keyframes: kf }, sc.T(t0 + 0.2));
  sc.tl.to(ball.el, { rotation: 900, duration: dur, ease: "power1.in" }, sc.T(t0 + 0.2));
  bob.cheer(t0 + 1.4);
  const lab = sc.text("interest earning interest", { x: sc.W * 0.62, y: 180, size: 66 }); lab.in(sc.cue("earning") - 0.2, "words");
  lab.highlight("interest", sc.cue("own"), "a3");
  sc.fx.puff(x1 - 140, G, t0 + 0.2 + dur, { n: 8 });
  sc.exit("flash", { d: 0.2, color: "bg" });
});

// 4 · TRUTH - year 1 vs year 30
film.scene("numbers", sc => {
  sc.enter("flash", { d: 0.25, color: "bg" });
  sc.ground();
  const bob = sc.figure({ x: sc.W * 0.2, face: "dots" });
  const y1 = Math.round(growth(0) * 0.08), y30 = Math.round(growth(29) * 0.08);
  const ch = sc.barChart({ x: sc.W * 0.6, y: sc.H * 0.47, w: 760, h: 520, data: [{ label: "year 1", value: y1, color: "muted" }, { label: "year 30", value: y30, color: "a2" }], prefix: "$", labelSize: 40, valueSize: 52, max: 85 });
  ch.grow(sc.cue("one") - 0.2, 0.7, sc.cue("thirty") - sc.cue("one"));
  bob.point(sc.W * 0.47, sc.H * 0.7, sc.cue("one"));
  bob.point(sc.W * 0.68, sc.H * 0.25, sc.cue("thirty") + 0.4);
  bob.surprise(sc.cue("seventy"));
  sc.text("same $100", { x: sc.W * 0.6, y: 120, size: 64, font: "hand", color: "a1" }).in(sc.cue("same"), "pop");
  sc.exit("slide-left", { d: 0.5 });
});

// 5 · TRUTH II - the bend, and the people who quit before it
film.scene("curve", sc => {
  sc.enter("slide-left", { d: 0.5 });
  const vals = []; for (let n = 0; n <= 40; n += 2) vals.push(Math.round(growth(n)));
  const lc = sc.lineChart({ x: sc.cx + 60, y: sc.H * 0.5, w: 1300, h: 600, values: vals, labels: ["year 0", "10", "20", "30", "40"], dots: false, width: 10, color: "a2", area: true, max: 2400 });
  lc.draw(0.2, 3.0);
  const P = i => lc.point(0, i);
  // a tiny traveller walks along the flat part, then gives up just before the bend
  const f = sc.figure({ x: P(0).x, y: P(0).y, size: 120, face: "dots", hidden: true });
  f.fadeIn(1.0, 0.3);
  const walkEnd = 8, tA = 1.2, tB = sc.cue("quit") - 0.3;
  f.walkTo(P(walkEnd).x, tA, { d: tB - tA, end: false });
  const kf = []; for (let i = 1; i <= walkEnd; i++) kf.push({ y: P(i).y - f.legLen * 0.995, duration: (tB - tA) / walkEnd, ease: "none" });
  sc.tl.to(f.el, { keyframes: kf }, sc.T(tA)); f.hipY = P(walkEnd).y - f.legLen * 0.995; f.g = P(walkEnd).y;
  f.pose("stand", tB, 0.2); f.turn(tB + 0.3); f.sad(tB + 0.4);
  const bend = sc.label("the bend", P(15).x - 260, P(15).y - 160, P(14).x, P(14).y - 20, { size: 56, color: "a1" }); bend.in(sc.cue("bends"));
  const quit = sc.label("most people quit here", P(walkEnd).x - 60, P(walkEnd).y - 230, P(walkEnd).x, P(walkEnd).y - 140, { size: 48 }); quit.in(sc.cue("quit"));
  sc.exit("fade", { d: 0.4, color: "bg" });
});

// 6 · ELEVATION - start today
film.scene("close", sc => {
  sc.enter("fade", { d: 0.4, color: "bg" });
  sc.ground();
  const bob = sc.figure({ x: sc.W * 0.3, face: "dots" });
  const seed = sc.prop("seedling", { x: sc.W * 0.42, y: sc.groundY - 44, size: 100, hidden: true, origin: "50% 100%" }); seed.pop(0.5);
  const tree = sc.prop("tree", { x: sc.W * 0.42, y: sc.groundY - 160, size: 360, hidden: true, origin: "50% 100%" });
  bob.kneel(0.6); bob.standUp(1.6);
  seed.popOut(sc.cue("second") - 0.2, 0.2);
  gsap.set(tree.el, { scale: 0.15, opacity: 0, transformOrigin: "50% 100%" });
  sc.tl.to(tree.el, { opacity: 1, duration: 0.1 }, sc.T(sc.cue("second") - 0.1));
  sc.tl.to(tree.el, { scale: 1, duration: 1.6, ease: "elastic.out(1, 0.6)" }, sc.T(sc.cue("second") - 0.1));
  const a = sc.text("Best time: yesterday.", { x: sc.W * 0.72, y: sc.H * 0.26, size: 70, color: "muted" }); a.in(sc.cue("best") - 0.1, "words");
  const b = sc.text("Second best: [today.]", { x: sc.W * 0.72, y: sc.H * 0.38, size: 84, accent: "a1" }); b.in(sc.cue("second") + 0.2, "words");
  const q = bob.hold("question", null, { size: 110, accent: "a3", dx: 16, dy: -66 }); q.hide();
  bob.pose("pointUp", sc.cue("what") - 0.2, 0.3); q.pop(sc.cue("what"));
  sc.text("What will you start compounding?", { x: sc.W * 0.72, y: sc.H * 0.56, size: 54, font: "hand", color: "a2" }).in(sc.cue("what") + 0.2, "words");
});
