// Hello, Stickman - the smallest complete film. Read this first.
const film = SM.film();

film.scene("meet", sc => {
  sc.ground();
  const kino = sc.figure({ x: -100, face: "dots" });          // starts off-screen left
  const t = kino.walkTo(sc.W * 0.34, 0.2, { speed: 330 });                     // walk returns its end time
  kino.wave(t);                                                // …so actions chain naturally
  kino.blinks(0, sc.dur);
  sc.text("Meet [Kino]", { x: sc.W * 0.7, y: sc.H * 0.34, size: 110 }).in(sc.cue("Kino") - 0.2, "words");
  sc.exit("wipe-left");
});

film.scene("idea", sc => {
  sc.enter("wipe-left");
  sc.ground();
  const kino = sc.figure({ x: sc.W * 0.25, face: "dots" });
  const bulb = sc.prop("lightbulb", { x: sc.W * 0.25 + 60, y: sc.groundY - 430, size: 120, hidden: true });
  bulb.pop(sc.cue("idea")); bulb.glow(sc.cue("idea") + 0.3);
  kino.think(sc.cue("idea") - 0.2, 1.0);
  kino.point(sc.W * 0.62, sc.H * 0.5, sc.cue("props"));
  sc.props(["rocket", "target", "trophy"], 3, { x: sc.W * 0.62, y: sc.H * 0.24, size: 110, gap: 170, layer: "back" }).forEach((p, i) => { p.hide(); p.pop(sc.cue("props") + i * 0.15); });
  const chart = sc.barChart({ x: sc.W * 0.66, y: sc.H * 0.58, w: 620, h: 330, data: [{ label: "Mon", value: 2 }, { label: "Tue", value: 4 }, { label: "Wed", value: 9 }], values: false });
  chart.grow(sc.cue("charts"));
  kino.surprise(sc.cue("drama"));
});

film.scene("you", sc => {
  sc.ground();
  const kino = sc.figure({ x: sc.W * 0.3, face: "dots" });
  kino.celebrate(0.4);
  const you = sc.figure({ x: sc.W + 150, character: "zeke", facing: -1 });
  you.walkTo(sc.W * 0.7, 0.8);
  kino.point(sc.W * 0.7, sc.groundY - 220, sc.cue("your"));
  sc.title("Your turn.", { y: sc.H * 0.28, sub: "stickman new my-film" }).in(sc.cue("your") - 0.3);
});
