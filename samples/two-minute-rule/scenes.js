// The two-minute rule - a 9:16 vertical short (dark theme, pop captions from the VO).
const film = SM.film();
const BIG = 440; // figure size for vertical

film.scene("hook", sc => {
  sc.ground();
  const me = sc.figure({ x: sc.W * 0.28, size: BIG, face: "dots" });
  const mtn = sc.prop("mountain", { x: sc.W * 0.68, y: sc.groundY - 300, size: 640, origin: "50% 100%" });
  me.lookAt(sc.W * 0.7, sc.groundY - 700, 0.3); me.emote("worried", 0.3);
  me.sad(0.9, 0.8);
  const t = sc.cue("small");
  mtn.scaleTo(0.16, t - 0.2, 0.6, "back.in(1.4)");
  const sw = sc.prop("stopwatch", { x: sc.W * 0.68, y: sc.H * 0.24, size: 260, hidden: true }); sw.pop(sc.cue("two") - 0.1);
  sc.text("2:00", { x: sc.W * 0.68, y: sc.H * 0.24 + 190, size: 90, color: "a3" }).in(sc.cue("two"), "slam");
  me.standUp(t + 0.4); me.emote("happy", t + 0.5); me.hop(t + 0.6);
  sc.exit("slide-up", { d: 0.4 });
});

film.scene("examples", sc => {
  sc.enter("slide-up", { d: 0.4 });
  sc.ground();
  const me = sc.figure({ x: sc.W * 0.3, size: BIG, face: "dots" });
  const book = sc.prop("openbook", { x: sc.W * 0.68, y: sc.H * 0.3, size: 300, hidden: true }); book.pop(sc.cue("read"));
  sc.text("1 page", { x: sc.W * 0.68, y: sc.H * 0.3 + 200, size: 84, color: "a2" }).in(sc.cue("page") - 0.1, "pop");
  me.present(sc.cue("read"));
  book.popOut(sc.cue("run") - 0.2);
  const shoe = sc.prop("shoe", { x: sc.W * 0.66, y: sc.groundY - 60, size: 220, hidden: true }); shoe.pop(sc.cue("shoes") - 0.4);
  me.pose("stand", sc.cue("run"), 0.3); me.kneel(sc.cue("shoes"));
  me.emote("grin", sc.cue("shoes"));
});

film.scene("momentum", sc => {
  sc.ground({ x0: -500, x1: 6000 });
  sc.env.road({ y: sc.groundY, x1: 6000, wide: true, h: 90 });
  const me = sc.figure({ x: sc.W * 0.3, size: BIG, face: "dots", character: "zeke" });
  const wall = sc.prop("brick", { x: sc.W * 0.62, y: sc.groundY - 150, size: 300 });
  me.push(0.2, 2.2, 30); sc.fx.sweat(sc.W * 0.3 + 60, sc.groundY - 470, 1.0);
  wall.shake(1.6, 0.5, 10);
  const t = sc.cue("begin");
  wall.arcTo(sc.W + 400, sc.groundY - 600, t - 0.2, 0.7, 200, { spin: 220 });
  me.runTo(4200, t, { d: 3.4, end: false });
  sc.camera.follow(me, t, t + 3.4, { lead: 120 });
  sc.fx.speedLines(t + 0.4, t + 3.2, { color: "muted" });
  sc.text("momentum", { x: sc.cx, y: sc.H * 0.2, size: 120, color: "a3" }).in(sc.cue("momentum") - 0.1, "slam");
  sc.exit("flash", { d: 0.2 });
});

film.scene("close", sc => {
  sc.enter("flash", { d: 0.25 });
  sc.ground();
  const days = sc.list(["Day 1", "Day 2", "Day 3"], { x: sc.W * 0.2, y: sc.H * 0.17, size: 76, gap: 130, accent: "a2" });
  days.in(0.5, 0.6);
  const me = sc.figure({ x: sc.W * 0.5, size: BIG, face: "dots" });
  me.celebrate(sc.cue("improve") - 0.2, { hold: true });
  const q = me.hold("question", null, { size: 150, accent: "a3", dx: 20, dy: -90 }); q.hide();
  me.pose("pointUp", sc.cue("what") - 0.3, 0.3); q.pop(sc.cue("what"));
  sc.text("your 2-minute habit?", { x: sc.cx, y: sc.H * 0.36, size: 72, color: "a3" }).in(sc.cue("habit") - 0.2, "words");
});
