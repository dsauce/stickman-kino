/*!
 * Stickman Kino - prop library
 * ~100 line-art props drawn in a 100×100 box centred on (0,0). Theme-aware, constant line weight at any size.
 *   sc.prop("laptop", { x, y, size: 160, layer: "back"|"front", accent: "#hex", fill, color, rotation, hidden })
 *   SM.drawProp(name, svgGroup, opts)   // low-level
 *   SM.propNames()                      // catalogue
 * Accent defaults are theme slots: a1 = alert/old way, a2 = hero/solution, a3 = reward/evidence.
 */
(function (root) {
  "use strict";
  const SM = root.SM; if (!SM) throw new Error("load sm-core.js first");
  const P = {};   // name -> { draw(c), accent: 'a1'|'a2'|'a3'|null, tags }

  function ctx(g, o) {
    const sc = o.sc || SM.current && Object.values(SM.current.scenes)[0];
    const th = (sc && sc.theme) || SM.resolveTheme(o.theme);
    const u = (sc && sc.u) || 1;
    const size = o.size || 120 * u;
    const k = size / 100;
    const sw = (o.line || 6 * u) / k;
    const ink = o.color || th.ink, paper = o.fill || th.paper;
    const slot = s => (s === "a1" ? th.accents[0] : s === "a2" ? th.accents[1] : s === "a3" ? th.accents[2] : s);
    const base = (a) => {
      a = a || {}; const out = { stroke: a.s || ink, "stroke-width": (a.w || 1) * sw, fill: a.f === undefined ? paper : (a.f === "n" ? "none" : a.f), "stroke-linejoin": "round", "stroke-linecap": "round" };
      if (a.s === "n") out.stroke = "none";
      if (a.o != null) out.opacity = a.o;
      if (a.draw) out["data-draw"] = "";
      if (a.tint) out["data-tint"] = "";
      return out;
    };
    const inner = SM.el("g", { transform: `scale(${k})` }, g);
    const c = {
      g: inner, th, sw, ink, paper, k, u, muted: th.muted, soft: th.soft, a1: th.accents[0], a2: th.accents[1], a3: th.accents[2], slot,
      P: (d, a) => SM.el("path", Object.assign({ d }, base(a)), inner),
      C: (cx, cy, r, a) => SM.el("circle", Object.assign({ cx, cy, r }, base(a)), inner),
      E: (cx, cy, rx, ry, a) => SM.el("ellipse", Object.assign({ cx, cy, rx, ry }, base(a)), inner),
      R: (x, y, w, h, rx, a) => SM.el("rect", Object.assign({ x, y, width: w, height: h, rx: rx || 0 }, base(a)), inner),
      L: (x1, y1, x2, y2, a) => SM.el("line", Object.assign({ x1, y1, x2, y2 }, base(Object.assign({ f: "n" }, a))), inner),
      T: (txt, x, y, size, a) => { a = a || {}; const t = SM.el("text", { x, y, "text-anchor": a.anchor || "middle", "dominant-baseline": "central", "font-family": a.font || `${th.display}, Inter, sans-serif`, "font-weight": a.weight || 800, "font-size": size, fill: a.f || ink }, inner); t.textContent = txt; return t; },
      lines: (x, y, w, n, gap, a) => { a = a || {}; for (let i = 0; i < n; i++) c.R(x, y + i * gap - 2, w * (i === n - 1 && n > 1 ? 0.6 : 1), 4, 2, { s: "n", f: a.f || th.muted }); }
    };
    return c;
  }

  SM.drawProp = function (name, g, o) {
    o = o || {}; const def = P[name];
    if (!def) { console.warn("Stickman Kino: unknown prop", name); return SM.drawProp("box", g, o); }
    const c = ctx(g, o);
    c.A = o.accent ? c.slot(o.accent) : (def.accent ? c.slot(def.accent) : c.paper);
    c.B = o.accent2 ? c.slot(o.accent2) : (def.accent2 ? c.slot(def.accent2) : c.A);
    def.draw(c, o);
    return g;
  };
  SM.propNames = () => Object.keys(P).sort();
  SM.propInfo = () => Object.keys(P).sort().map(n => ({ name: n, accent: P[n].accent || null, tags: P[n].tags || "" }));
  SM.defineProp = (name, draw, accent, tags) => { P[name] = { draw, accent, tags }; };
  const def = SM.defineProp;

  SM.Scene.prototype.prop = function (name, o) {
    o = o || {}; const g = SM.el("g", {}, this.layer(o.layer));
    SM.drawProp(name, g, Object.assign({ size: (o.size || 120) * (o.size ? 1 : this.u) }, o, { sc: this, size: o.size || 120 * this.u }));
    const th = new SM.Thing(this, g, { x: o.x == null ? this.cx : o.x, y: o.y == null ? this.cy : o.y, scale: o.scale, rotation: o.rotation, hidden: o.hidden, origin: o.origin });
    th.name = name; return th;
  };
  // a row/grid of props
  SM.Scene.prototype.props = function (name, n, o) {
    o = o || {}; const out = [], cols = o.cols || n, gx = o.gap || (o.size || 120) * 1.25, gy = o.gapY || gx;
    const w = (Math.min(cols, n) - 1) * gx, rows = Math.ceil(n / cols), h = (rows - 1) * gy;
    for (let i = 0; i < n; i++) {
      const cx = (o.x == null ? this.cx : o.x) - w / 2 + (i % cols) * gx, cy = (o.y == null ? this.cy : o.y) - h / 2 + Math.floor(i / cols) * gy;
      out.push(this.prop(Array.isArray(name) ? name[i % name.length] : name, Object.assign({}, o, { x: cx, y: cy })));
    }
    return out;
  };

  // =============================================================== documents & office
  def("document", c => { c.P("M-32,-44 H16 L32,-28 V44 H-32 Z", { tint: 1 }); c.P("M16,-44 V-28 H32", { f: "n" }); c.lines(-22, -16, 42, 4, 13); }, null, "doc paper report page file");
  def("report", c => { c.P("M-32,-44 H16 L32,-28 V44 H-32 Z", { tint: 1 }); c.P("M16,-44 V-28 H32", { f: "n" }); c.R(-22, -30, 30, 8, 2, { s: "n", f: c.ink }); c.lines(-22, -10, 42, 2, 12); c.R(-20, 26, 8, 10, 1, { s: "n", f: c.A }); c.R(-8, 18, 8, 18, 1, { s: "n", f: c.A }); c.R(4, 10, 8, 26, 1, { s: "n", f: c.A }); }, "a2", "report chart doc");
  def("stack", c => { for (let i = 0; i < 5; i++) c.R(-40 + (i % 2) * 4, 26 - i * 14, 78, 14, 3, { tint: 1 }); }, null, "papers pile stack documents");
  def("folder", c => { c.P("M-44,-30 H-12 L-4,-20 H44 V36 H-44 Z", { f: c.A, tint: 1 }); c.P("M-44,-12 H44", { f: "n" }); }, "a3", "folder files");
  def("book", c => { c.P("M-36,-40 H28 Q36,-40 36,-32 V40 H-28 Q-36,40 -36,32 Z", { f: c.A, tint: 1 }); c.L(-26, -40, -26, 40); c.L(-14, -20, 22, -20, { w: 0.8 }); }, "a1", "book read");
  def("openbook", c => { c.P("M0,-30 Q-24,-42 -46,-32 V36 Q-24,26 0,36 Z"); c.P("M0,-30 Q24,-42 46,-32 V36 Q24,26 0,36 Z"); c.L(0, -30, 0, 36); c.lines(-36, -18, 28, 4, 12); c.lines(8, -18, 28, 4, 12); }, null, "book learn");
  def("notebook", c => { c.R(-30, -42, 62, 84, 6, { tint: 1 }); for (let i = 0; i < 6; i++) c.C(-30, -32 + i * 13, 4, { f: c.paper }); c.lines(-16, -24, 38, 5, 12); }, null, "notes notebook");
  def("clipboard", c => { c.R(-32, -38, 64, 82, 6, { f: c.A }); c.R(-24, -30, 48, 66, 3); c.R(-12, -46, 24, 14, 4, { f: c.ink }); c.P("M-16,-12 l5,5 l10,-10", { f: "n" }); c.L(4, -12, 16, -12); c.P("M-16,10 l5,5 l10,-10", { f: "n" }); c.L(4, 10, 16, 10); }, "a3", "checklist clipboard tasks");
  def("pencil", c => { c.P("M-40,30 L22,-32 L34,-20 L-28,42 L-44,46 Z", { f: c.A }); c.L(14, -24, 26, -12); c.P("M-40,30 L-28,42", { f: "n" }); }, "a3", "pencil write edit");
  def("pen", c => { c.P("M-36,36 L20,-20 L30,-10 L-26,46 Z", { f: c.A }); c.P("M20,-20 L32,-40 L44,-28 L30,-10", { f: c.ink }); }, "a2", "pen sign");
  def("envelope", c => { c.R(-44, -28, 88, 58, 6, { tint: 1 }); c.P("M-44,-26 L0,6 L44,-26", { f: "n" }); }, null, "mail email message envelope");
  def("mailopen", c => { c.P("M-44,-6 L0,-36 L44,-6 V34 H-44 Z"); c.R(-30, -26, 60, 40, 3); c.lines(-20, -14, 40, 2, 10); c.P("M-44,-6 L0,20 L44,-6", { f: c.paper }); }, null, "mail inbox read");
  def("calendar", c => { c.R(-40, -34, 80, 74, 8, { tint: 1 }); c.R(-40, -34, 80, 20, 8, { f: c.A }); c.L(-22, -44, -22, -26); c.L(22, -44, 22, -26); for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) c.R(-30 + q * 16, -6 + r * 14, 10, 8, 2, { s: "n", f: r === 1 && q === 2 ? c.A : c.muted }); }, "a1", "calendar date schedule deadline");
  def("clock", c => { c.C(0, 0, 42, { tint: 1 }); for (let i = 0; i < 12; i++) { const a = i * 30 * SM.R; c.L(34 * Math.cos(a), 34 * Math.sin(a), 38 * Math.cos(a), 38 * Math.sin(a), { w: 0.6 }); } c.L(0, 0, 0, -26, { w: 1.2 }); c.L(0, 0, 18, 8); c.C(0, 0, 3, { f: c.ink }); }, null, "time clock deadline");
  def("hourglass", c => { c.L(-30, -42, 30, -42, { w: 1.3 }); c.L(-30, 42, 30, 42, { w: 1.3 }); c.P("M-24,-42 C-24,-10 -4,-6 -4,0 C-4,6 -24,10 -24,42 H24 C24,10 4,6 4,0 C4,-6 24,-10 24,-42 Z"); c.P("M-14,-28 H14 L0,-4 Z", { f: c.A, s: "n" }); c.P("M-18,38 Q0,18 18,38 Z", { f: c.A, s: "n" }); }, "a3", "time wait hourglass");
  def("stopwatch", c => { c.C(0, 6, 38, { tint: 1 }); c.R(-8, -44, 16, 10, 3, { f: c.ink }); c.L(0, 6, 0, -18, { w: 1.2 }); c.L(26, -26, 32, -32); }, null, "timer speed stopwatch");
  def("briefcase", c => { c.R(-44, -20, 88, 60, 8, { f: c.A, tint: 1 }); c.P("M-14,-20 V-32 H14 V-20", { f: "n" }); c.L(-44, 4, 44, 4); c.R(-6, -2, 12, 12, 2, { f: c.paper }); }, "a3", "work job business briefcase");
  def("chair", c => { c.P("M-20,-44 V8 H24", { f: "n", w: 1.2 }); c.L(-16, 8, -24, 44); c.L(20, 8, 26, 44); c.L(-20, -44, -14, -44); }, null, "chair seat");
  def("desk", c => { c.R(-48, -12, 96, 10, 3, { f: c.A }); c.L(-40, -2, -40, 42); c.L(40, -2, 40, 42); c.R(-6, -2, 40, 22, 3); }, "a3", "desk table office");
  def("whiteboard", c => { c.R(-48, -40, 96, 64, 4, { tint: 1 }); c.L(-30, 24, -38, 46); c.L(30, 24, 38, 46); c.P("M-34,6 L-18,-10 L-4,0 L14,-24 L32,-14", { f: "n", s: c.A, w: 1.1 }); }, "a2", "board teach present chart");
  def("presentation", c => { c.L(0, -44, 0, -36, { w: 1.2 }); c.R(-46, -36, 92, 58, 3, { tint: 1 }); c.L(0, 22, -18, 46); c.L(0, 22, 18, 46); c.R(-34, -2, 12, 16, 1, { s: "n", f: c.A }); c.R(-16, -14, 12, 28, 1, { s: "n", f: c.A }); c.R(2, -24, 12, 38, 1, { s: "n", f: c.A }); c.R(20, -10, 12, 24, 1, { s: "n", f: c.muted }); }, "a2", "slides presentation pitch");
  // ================================================================== tech
  def("laptop", c => { c.R(-36, -36, 72, 50, 5, { tint: 1 }); c.R(-28, -28, 56, 34, 2, { f: c.A, s: "n", o: 0.85 }); c.P("M-48,14 H48 L42,26 H-42 Z"); }, "a2", "laptop computer work");
  def("monitor", c => { c.R(-46, -38, 92, 60, 5, { tint: 1 }); c.R(-38, -30, 76, 44, 2, { f: c.A, s: "n", o: 0.85 }); c.L(0, 22, 0, 36); c.L(-18, 38, 18, 38, { w: 1.2 }); }, "a2", "screen monitor desktop");
  def("phone", c => { c.R(-24, -46, 48, 92, 9, { tint: 1 }); c.R(-17, -36, 34, 64, 3, { f: c.A, s: "n", o: 0.85 }); c.C(0, 37, 3.5, { f: c.ink, s: "n" }); }, "a2", "phone mobile app smartphone");
  def("tablet", c => { c.R(-36, -46, 72, 92, 7, { tint: 1 }); c.R(-28, -36, 56, 70, 3, { f: c.A, s: "n", o: 0.85 }); }, "a2", "tablet ipad");
  def("keyboard", c => { c.R(-48, -18, 96, 36, 5); for (let r = 0; r < 3; r++) for (let q = 0; q < 8; q++) c.R(-42 + q * 11, -12 + r * 10, 7, 6, 1, { s: "n", f: c.muted }); }, null, "keyboard type");
  def("mouse", c => { c.R(-20, -30, 40, 60, 20); c.L(0, -30, 0, -8); c.L(-20, -8, 20, -8); }, null, "mouse click");
  def("cursor", c => { c.P("M-18,-34 L22,4 L4,6 L14,30 L6,34 L-4,10 L-18,22 Z", { f: c.paper }); }, null, "cursor pointer click");
  def("server", c => { for (let i = 0; i < 3; i++) { c.R(-36, -42 + i * 29, 72, 24, 4, { tint: 1 }); c.C(-24, -30 + i * 29, 3.5, { f: c.A, s: "n" }); c.L(-8, -30 + i * 29, 24, -30 + i * 29, { w: 0.7 }); } }, "a2", "server backend hosting infra");
  def("database", c => { c.P("M-36,-30 V30 A36,12 0 0 0 36,30 V-30", { tint: 1 }); c.E(0, -30, 36, 12); c.P("M-36,-2 A36,12 0 0 0 36,-2", { f: "n" }); }, null, "database data storage db");
  def("cloud", c => { c.P("M-30,26 H32 A20,20 0 0 0 30,-12 A26,26 0 0 0 -18,-18 A22,22 0 0 0 -30,26 Z", { tint: 1 }); }, null, "cloud weather saas");
  def("chip", c => { c.R(-28, -28, 56, 56, 6, { f: c.A }); c.R(-14, -14, 28, 28, 3, { f: c.paper }); for (let i = -1; i <= 1; i++) { c.L(i * 14, -28, i * 14, -42); c.L(i * 14, 28, i * 14, 42); c.L(-28, i * 14, -42, i * 14); c.L(28, i * 14, 42, i * 14); } }, "a2", "chip cpu ai processor hardware");
  def("code", c => { c.R(-46, -36, 92, 72, 7, { tint: 1 }); c.P("M-18,-12 L-32,0 L-18,12", { f: "n", w: 1.2 }); c.P("M18,-12 L32,0 L18,12", { f: "n", w: 1.2 }); c.L(8, -18, -6, 18, { w: 1.2, s: c.A }); }, "a2", "code developer brackets programming");
  def("terminal", c => { c.R(-46, -36, 92, 72, 7, { f: c.ink }); c.P("M-32,-14 L-20,-4 L-32,6", { f: "n", s: c.A, w: 1.2 }); c.L(-14, 8, 6, 8, { s: c.paper, w: 1.2 }); c.C(-36, -28, 2.5, { f: c.a1, s: "n" }); c.C(-28, -28, 2.5, { f: c.a3, s: "n" }); }, "a2", "terminal cli command shell");
  def("browser", c => { c.R(-48, -38, 96, 76, 7, { tint: 1 }); c.L(-48, -22, 48, -22); [-40, -32, -24].forEach(x => c.C(x, -30, 2.5, { f: c.ink, s: "n" })); c.R(-38, -12, 40, 8, 2, { s: "n", f: c.ink }); c.lines(-38, 6, 76, 3, 10); c.R(14, -12, 24, 14, 2, { s: "n", f: c.A }); }, "a2", "browser website web page");
  def("app", c => { c.R(-40, -40, 80, 80, 20, { f: c.A, tint: 1 }); c.C(0, 0, 16, { f: c.paper }); }, "a2", "app icon");
  def("wifi", c => { c.P("M-40,-8 A56,56 0 0 1 40,-8", { f: "n", w: 1.2 }); c.P("M-26,8 A36,36 0 0 1 26,8", { f: "n", w: 1.2 }); c.P("M-12,22 A16,16 0 0 1 12,22", { f: "n", w: 1.2 }); c.C(0, 34, 5, { f: c.ink, s: "n" }); }, null, "wifi internet network signal");
  def("signal", c => { [0, 1, 2, 3].forEach(i => c.R(-34 + i * 18, 30 - i * 18 - 12, 12, 12 + i * 18, 2, { f: i < 3 ? c.A : c.paper })); }, "a2", "signal bars strength");
  def("battery", c => { c.R(-44, -20, 80, 40, 6); c.R(36, -8, 8, 16, 2, { f: c.ink }); c.R(-36, -12, 44, 24, 2, { s: "n", f: c.A }); }, "a2", "battery energy power charge");
  def("plug", c => { c.R(-22, -16, 44, 40, 8, { f: c.paper }); c.L(-10, -16, -10, -36, { w: 1.4 }); c.L(10, -16, 10, -36, { w: 1.4 }); c.P("M0,24 V36 Q0,46 14,46", { f: "n" }); }, null, "plug power connect integration");
  def("robot", c => { c.R(-30, -26, 60, 50, 10, { f: c.paper, tint: 1 }); c.L(0, -26, 0, -40); c.C(0, -42, 5, { f: c.A }); c.C(-12, -4, 6, { f: c.A, s: "n" }); c.C(12, -4, 6, { f: c.A, s: "n" }); c.L(-10, 12, 10, 12); c.R(-38, -8, 8, 16, 3); c.R(30, -8, 8, 16, 3); c.R(-18, 24, 36, 18, 4); }, "a2", "robot ai bot agent automation");
  def("brain", c => { c.P("M-6,-38 C-26,-42 -42,-28 -38,-12 C-48,-2 -42,18 -28,20 C-26,34 -10,38 -6,30 Z", { f: c.A }); c.P("M6,-38 C26,-42 42,-28 38,-12 C48,-2 42,18 28,20 C26,34 10,38 6,30 Z", { f: c.A }); c.P("M-24,-18 q10,4 8,14 M24,-18 q-10,4 -8,14 M-22,10 q8,-6 14,2 M22,10 q-8,-6 -14,2", { f: "n", w: 0.8 }); }, "a1", "brain mind think intelligence ai");
  def("gear", c => { const pts = []; for (let i = 0; i < 16; i++) { const a = i * (Math.PI / 8), r = i % 2 ? 30 : 40; pts.push(`${(r * Math.cos(a - 0.12)).toFixed(1)},${(r * Math.sin(a - 0.12)).toFixed(1)} ${(r * Math.cos(a + 0.12)).toFixed(1)},${(r * Math.sin(a + 0.12)).toFixed(1)}`); } c.P("M" + pts.join(" L") + " Z", { f: c.A, tint: 1 }); c.C(0, 0, 12, { f: c.paper }); }, "a2", "gear settings process engineering cog");
  def("gears", c => { const gear = (cx, cy, R1, n) => { const pts = []; for (let i = 0; i < n * 2; i++) { const a = i * (Math.PI / n), r = i % 2 ? R1 * 0.76 : R1; pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`); } c.P("M" + pts.join(" L") + " Z", { f: c.A }); c.C(cx, cy, R1 * 0.3, { f: c.paper }); }; gear(-14, -8, 30, 9); gear(24, 22, 20, 7); }, "a2", "gears machine system process");
  def("magnifier", c => { c.L(18, 18, 42, 42, { w: 2.4 }); c.C(-6, -6, 30, { f: c.paper, tint: 1 }); c.P("M-22,-12 A18,18 0 0 1 -10,-24", { f: "n", w: 0.7, s: c.muted }); }, null, "search find magnifier zoom research");
  def("funnel", c => { c.P("M-44,-36 H44 L8,8 V40 L-8,32 V8 Z", { tint: 1 }); }, null, "funnel filter conversion");
  def("filter", c => { c.P("M-40,-34 H40 L10,4 V34 L-10,24 V4 Z", { f: c.A }); }, "a2", "filter");
  def("lock", c => { c.P("M-20,-8 V-22 A20,20 0 0 1 20,-22 V-8", { f: "n", w: 1.3 }); c.R(-32, -8, 64, 50, 8, { f: c.A, tint: 1 }); c.C(0, 12, 6, { f: c.ink, s: "n" }); c.L(0, 14, 0, 26, { w: 1.2 }); }, "a3", "lock security secure privacy");
  def("unlock", c => { c.P("M-20,-8 V-22 A20,20 0 0 1 20,-28", { f: "n", w: 1.3 }); c.R(-32, -8, 64, 50, 8, { f: c.A }); c.C(0, 12, 6, { f: c.ink, s: "n" }); }, "a2", "unlock open access");
  def("key", c => { c.C(-24, 0, 16, { f: c.A }); c.C(-24, 0, 5, { f: c.paper }); c.P("M-8,0 H42 M30,0 V12 M40,0 V10", { f: "n", w: 1.3 }); }, "a3", "key access secret solution");
  def("shield", c => { c.P("M0,-44 L36,-30 V0 C36,24 18,38 0,46 C-18,38 -36,24 -36,0 V-30 Z", { f: c.A, tint: 1 }); c.P("M-14,0 l10,10 l20,-20", { f: "n", s: c.paper, w: 1.4 }); }, "a2", "shield security protection safe trust");
  def("bug", c => { c.E(0, 6, 22, 30, { f: c.A }); c.C(0, -28, 12, { f: c.ink }); c.L(0, -20, 0, 36); [-10, 6, 22].forEach(y => { c.L(-22, y, -38, y - 8); c.L(22, y, 38, y - 8); }); c.L(-6, -38, -14, -48); c.L(6, -38, 14, -48); }, "a1", "bug error issue defect");
  def("warning", c => { c.P("M0,-42 L44,38 H-44 Z", { f: c.A, tint: 1 }); c.L(0, -12, 0, 12, { w: 1.6 }); c.C(0, 26, 3.5, { f: c.ink, s: "n" }); }, "a3", "warning alert caution risk");
  def("error", c => { c.C(0, 0, 40, { f: c.A, tint: 1 }); c.L(-16, -16, 16, 16, { s: c.paper, w: 1.6 }); c.L(16, -16, -16, 16, { s: c.paper, w: 1.6 }); }, "a1", "error fail wrong cross");
  def("success", c => { c.C(0, 0, 40, { f: c.A, tint: 1 }); c.P("M-18,0 l12,12 l24,-24", { f: "n", s: c.paper, w: 1.7 }); }, "a2", "success done ok tick check");
  def("bell", c => { c.P("M-30,22 C-24,14 -24,6 -24,-6 A24,24 0 0 1 24,-6 C24,6 24,14 30,22 Z", { f: c.A, tint: 1 }); c.P("M-8,28 A8,8 0 0 0 8,28", { f: "n" }); c.L(0, -30, 0, -38); }, "a3", "bell notification alert reminder");
  def("chat", c => { c.P("M-42,-30 H42 V18 H-6 L-24,36 V18 H-42 Z", { f: c.paper, tint: 1 }); [-18, 0, 18].forEach(x => c.C(x, -6, 4.5, { f: c.ink, s: "n" })); }, null, "chat message talk conversation support");
  def("chats", c => { c.P("M-46,-34 H14 V2 H-22 L-34,14 V2 H-46 Z", { f: c.paper }); c.P("M-6,-8 H46 V28 H34 V40 L22,28 H-6 Z", { f: c.A }); }, "a2", "chat conversation messages dm");
  def("thought", c => { c.P("M-32,14 C-48,10 -48,-14 -30,-16 C-28,-36 0,-40 8,-28 C22,-40 46,-30 40,-10 C52,2 40,20 24,16 C14,28 -18,28 -32,14 Z", { f: c.paper }); c.C(-30, 30, 7); c.C(-40, 42, 4); }, null, "thought idea think bubble");
  def("megaphone", c => { c.P("M-36,-10 L20,-34 V34 L-36,10 Z", { f: c.A, tint: 1 }); c.R(-46, -12, 12, 24, 3); c.P("M-28,10 L-22,34 H-10 L-14,14", { f: c.paper }); c.P("M30,-14 Q38,0 30,14 M38,-24 Q52,0 38,24", { f: "n" }); }, "a1", "megaphone announce marketing launch");
  def("mic", c => { c.R(-14, -42, 28, 50, 14, { f: c.A }); c.P("M-26,-4 A26,26 0 0 0 26,-4", { f: "n" }); c.L(0, 22, 0, 38); c.L(-16, 40, 16, 40, { w: 1.2 }); }, "a2", "mic podcast voice speak audio");
  def("headphones", c => { c.P("M-36,12 V-2 A36,36 0 0 1 36,-2 V12", { f: "n", w: 1.4 }); c.R(-44, 6, 18, 32, 6, { f: c.A }); c.R(26, 6, 18, 32, 6, { f: c.A }); }, "a2", "music listen audio headphones");
  def("camera", c => { c.R(-44, -24, 88, 60, 8, { tint: 1 }); c.R(-18, -36, 36, 14, 4); c.C(0, 6, 18, { f: c.A }); c.C(0, 6, 8, { f: c.paper }); }, "a2", "camera photo picture");
  def("video", c => { c.R(-44, -26, 66, 52, 8, { f: c.A, tint: 1 }); c.P("M22,-8 L44,-22 V22 L22,8 Z"); }, "a1", "video record film");
  def("play", c => { c.C(0, 0, 42, { f: c.A, tint: 1 }); c.P("M-12,-20 L22,0 L-12,20 Z", { f: c.paper }); }, "a1", "play video start youtube");
  def("music", c => { c.P("M-16,26 V-30 L32,-40 V16", { f: "n", w: 1.3 }); c.E(-24, 26, 11, 8, { f: c.ink }); c.E(24, 16, 11, 8, { f: c.ink }); }, null, "music note song");
  // =========================================================== money & business
  def("coin", c => { c.C(0, 0, 40, { f: c.A, tint: 1 }); c.C(0, 0, 30, { f: "n", w: 0.7 }); c.T("$", 0, 2, 40, { f: c.ink }); }, "a3", "coin money cash dollar cost price");
  def("coins", c => { for (let i = 0; i < 4; i++) c.E(-12, 30 - i * 11, 26, 9, { f: c.A }); c.E(22, 30, 24, 9, { f: c.A }); c.E(22, 19, 24, 9, { f: c.A }); }, "a3", "coins savings money stack");
  def("cash", c => { c.R(-46, -26, 92, 52, 5, { f: c.A, tint: 1 }); c.C(0, 0, 14, { f: c.paper }); c.T("$", 0, 1, 20, { f: c.ink }); c.C(-34, -14, 4, { f: "n" }); c.C(34, 14, 4, { f: "n" }); }, "a2", "cash money banknote bill payment");
  def("moneybag", c => { c.P("M-12,-30 L-20,-44 H20 L12,-30 C40,-16 44,40 0,42 C-44,40 -40,-16 -12,-30 Z", { f: c.A, tint: 1 }); c.L(-14, -30, 14, -30); c.T("$", 0, 8, 34, { f: c.ink }); }, "a3", "money bag wealth revenue profit");
  def("wallet", c => { c.R(-44, -26, 88, 60, 8, { f: c.A, tint: 1 }); c.R(14, -6, 30, 20, 6, { f: c.paper }); c.C(26, 4, 4, { f: c.ink, s: "n" }); }, "a1", "wallet payment spend");
  def("creditcard", c => { c.R(-46, -30, 92, 60, 7, { f: c.A, tint: 1 }); c.R(-46, -16, 92, 12, 0, { f: c.ink, s: "n" }); c.R(-36, 8, 22, 12, 3, { f: c.paper }); }, "a2", "card payment credit fintech");
  def("piggybank", c => { c.E(0, 4, 40, 30, { f: c.A, tint: 1 }); c.C(38, 0, 10, { f: c.A }); c.L(-20, 30, -20, 42, { w: 1.4 }); c.L(16, 30, 16, 42, { w: 1.4 }); c.R(-8, -28, 18, 5, 2, { f: c.ink, s: "n" }); c.C(14, -8, 3, { f: c.ink, s: "n" }); c.P("M-8,-32 l-8,-10 l14,4", { f: c.A }); }, "a1", "savings piggy bank save money");
  def("chartup", c => { c.P("M-42,-40 V40 H44", { f: "n" }); c.P("M-30,22 L-10,2 L6,12 L36,-26", { f: "n", s: c.A, w: 1.6 }); c.P("M22,-28 L38,-28 L38,-12", { f: "n", s: c.A, w: 1.6 }); }, "a2", "growth chart up trend increase gains");
  def("chartdown", c => { c.P("M-42,-40 V40 H44", { f: "n" }); c.P("M-30,-24 L-10,-2 L6,-12 L36,24", { f: "n", s: c.A, w: 1.6 }); c.P("M22,26 L38,26 L38,10", { f: "n", s: c.A, w: 1.6 }); }, "a1", "decline chart down loss drop");
  def("barchart", c => { c.P("M-42,-42 V40 H44", { f: "n" }); [[-30, 20], [-12, 36], [6, 52], [24, 70]].forEach(([x, h], i) => c.R(x, 40 - h, 12, h, 2, { f: i === 3 ? c.A : c.paper })); }, "a2", "bar chart statistics data");
  def("piechart", c => { c.C(0, 0, 40, { f: c.paper }); c.P("M0,0 L0,-40 A40,40 0 0 1 38,12 Z", { f: c.A }); c.P("M0,0 L38,12 A40,40 0 0 1 -20,35 Z", { f: c.muted }); }, "a2", "pie share market chart");
  def("target", c => { c.C(0, 0, 42, { f: c.paper }); c.C(0, 0, 29, { f: c.A }); c.C(0, 0, 16, { f: c.paper }); c.C(0, 0, 6, { f: c.A }); }, "a1", "target goal aim focus bullseye");
  def("trophy", c => { c.P("M-26,-38 H26 V-10 A26,26 0 0 1 -26,-10 Z", { f: c.A, tint: 1 }); c.P("M-26,-30 H-40 Q-40,-6 -22,-2 M26,-30 H40 Q40,-6 22,-2", { f: "n" }); c.L(0, 16, 0, 28, { w: 1.4 }); c.R(-20, 28, 40, 12, 3, { f: c.ink }); }, "a3", "trophy win award champion success");
  def("medal", c => { c.P("M-18,-44 L-4,-10 M18,-44 L4,-10", { f: "n", s: c.a1, w: 2 }); c.C(0, 14, 24, { f: c.A }); c.T("1", 0, 15, 24, { f: c.ink }); }, "a3", "medal winner first rank");
  def("crown", c => { c.P("M-40,26 L-44,-24 L-20,0 L0,-34 L20,0 L44,-24 L40,26 Z", { f: c.A, tint: 1 }); c.L(-40, 34, 40, 34, { w: 1.4 }); }, "a3", "crown king best premium leader");
  def("star", c => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 18 : 42; pts.push(`${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`); } c.P("M" + pts.join(" L") + " Z", { f: c.A, tint: 1 }); }, "a3", "star favourite rating quality");
  def("flag", c => { c.L(-30, -44, -30, 44, { w: 1.4 }); c.P("M-30,-40 Q-4,-50 12,-38 Q28,-28 40,-36 V2 Q28,10 12,0 Q-4,-12 -30,-2 Z", { f: c.A, tint: 1 }); }, "a1", "flag goal milestone finish");
  def("rocket", c => { c.P("M0,-46 C18,-30 20,-6 16,18 H-16 C-20,-6 -18,-30 0,-46 Z", { tint: 1 }); c.C(0, -14, 8, { f: c.B }); c.P("M-16,4 L-30,26 L-14,22 M16,4 L30,26 L14,22", { f: c.A }); c.P("M-10,20 Q0,50 10,20 Z", { f: c.a3 }); }, "a1", "rocket launch startup growth fast");
  def("lightbulb", c => { c.P("M-14,22 C-14,8 -30,0 -30,-16 A30,30 0 0 1 30,-16 C30,0 14,8 14,22 Z", { f: c.A, tint: 1 }); c.L(-12, 30, 12, 30); c.L(-9, 38, 9, 38); c.P("M-6,10 V-6 L0,0 L6,-6 V10", { f: "n", w: 0.7 }); }, "a3", "idea lightbulb insight innovation");
  def("puzzle", c => { c.P("M-36,-36 H-8 A9,9 0 1 1 8,-36 H36 V-8 A9,9 0 1 1 36,8 V36 H8 A9,9 0 1 0 -8,36 H-36 V8 A9,9 0 1 0 -36,-8 Z", { f: c.A, tint: 1 }); }, "a2", "puzzle solution fit integration");
  def("handshake", c => { c.P("M-46,-6 L-24,-18 L-4,-6 L10,-16 L46,-4 L38,14 L14,22 L-2,16 L-20,22 L-40,12 Z", { f: c.A }); c.P("M-4,-6 L10,8 M6,2 L18,14", { f: "n" }); }, "a3", "deal partnership agreement handshake");
  def("scale", c => { c.L(0, -36, 0, 38, { w: 1.3 }); c.L(-20, 38, 20, 38, { w: 1.4 }); c.L(-38, -26, 38, -26, { w: 1.3 }); c.P("M-38,-26 L-48,4 H-28 Z M38,-26 L28,4 H48 Z", { f: c.A }); c.C(0, -38, 4, { f: c.ink }); }, "a3", "balance scale justice compare legal weigh");
  def("gavel", c => { c.R(-30, -30, 44, 20, 4, { f: c.A, tint: 1 }); c.L(-8, -10, 30, 34, { w: 1.6 }); c.R(-40, 30, 40, 10, 3, { f: c.ink }); }, "a3", "law legal judge court gavel");
  def("building", c => { c.R(-30, -44, 60, 88, 3, { tint: 1 }); for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) c.R(-20 + q * 15, -34 + r * 15, 9, 9, 1, { s: "n", f: c.muted }); c.R(-7, 28, 14, 16, 1, { f: c.A }); }, null, "building company office corporate");
  def("bank", c => { c.P("M-46,-18 L0,-42 L46,-18 Z", { f: c.A }); c.L(-42, -14, 42, -14); [-30, -10, 10, 30].forEach(x => c.L(x, -10, x, 26, { w: 1.4 })); c.R(-46, 28, 92, 10, 2); }, "a3", "bank finance institution");
  def("factory", c => { c.P("M-46,40 V-6 L-24,6 V-6 L-2,6 V-6 L20,6 V-40 H34 V40 Z", { tint: 1 }); c.R(-38, 16, 10, 10, 1, { s: "n", f: c.A }); c.R(-16, 16, 10, 10, 1, { s: "n", f: c.A }); c.R(6, 16, 10, 10, 1, { s: "n", f: c.A }); }, "a3", "factory industry manufacturing production");
  def("house", c => { c.P("M-40,-4 L0,-40 L40,-4", { f: "n", w: 1.2 }); c.R(-30, -8, 60, 50, 2, { tint: 1 }); c.R(-8, 14, 16, 28, 2, { f: c.A }); c.R(14, 2, 10, 10, 1, { f: c.paper }); }, "a1", "home house real estate");
  def("shop", c => { c.R(-40, -10, 80, 50, 2, { tint: 1 }); c.P("M-46,-10 L-38,-36 H38 L46,-10 Z", { f: c.A }); c.R(-26, 10, 20, 30, 2); c.R(6, 6, 22, 16, 2, { f: c.paper }); }, "a1", "shop store retail ecommerce");
  def("cart", c => { c.P("M-46,-32 H-34 L-24,18 H30 L40,-18 H-30", { f: "n", w: 1.2 }); c.C(-18, 32, 7); c.C(24, 32, 7); c.R(-20, -12, 46, 22, 3, { f: c.A, s: "n", o: 0.8 }); }, "a2", "cart shopping buy ecommerce");
  def("box", c => { c.P("M-38,-18 L0,-36 L38,-18 V24 L0,42 L-38,24 Z", { f: c.A, tint: 1 }); c.P("M-38,-18 L0,0 L38,-18 M0,0 V42", { f: "n" }); }, "a3", "box package delivery shipping product");
  def("gift", c => { c.R(-36, -10, 72, 50, 4, { f: c.A, tint: 1 }); c.R(-42, -24, 84, 16, 3, { f: c.A }); c.L(0, -24, 0, 40, { s: c.paper, w: 2 }); c.P("M0,-24 C-20,-46 -34,-26 0,-24 C34,-26 20,-46 0,-24", { f: "n" }); }, "a1", "gift present reward bonus");
  def("tag", c => { c.P("M-40,-10 L-10,-40 H40 V10 L10,40 Z", { f: c.A, tint: 1 }); c.C(24, -24, 6, { f: c.paper }); }, "a3", "price tag sale discount label");
  def("receipt", c => { c.P("M-28,-44 H28 V44 L20,38 L12,44 L4,38 L-4,44 L-12,38 L-20,44 L-28,38 Z", { tint: 1 }); c.lines(-18, -28, 36, 5, 12); }, null, "receipt invoice bill");
  // ===================================================================== transport
  def("truck", c => { c.R(-46, -24, 56, 44, 4, { f: c.A, tint: 1 }); c.P("M10,-10 H32 L46,6 V20 H10 Z"); c.C(-28, 24, 9); c.C(28, 24, 9); }, "a2", "truck delivery logistics shipping");
  def("car", c => { c.P("M-46,16 V0 L-34,-4 L-20,-24 H18 L32,-4 L46,0 V16 Z", { f: c.A, tint: 1 }); c.C(-26, 18, 10); c.C(26, 18, 10); c.P("M-16,-6 L-8,-18 H4 V-6 Z M10,-6 V-18 H16 L24,-6 Z", { f: c.paper }); }, "a1", "car drive vehicle");
  def("bike", c => { c.C(-28, 16, 18, { f: "n" }); c.C(28, 16, 18, { f: "n" }); c.P("M-28,16 L-8,-14 H18 L28,16 M-8,-14 L4,16 L18,-14 M-14,-22 H-2 M12,-24 L18,-14", { f: "n", w: 1.1 }); }, null, "bike cycle commute");
  def("plane", c => { c.P("M-46,4 L-34,-2 L28,-4 Q46,-2 46,4 Q46,10 28,12 L-34,10 Z", { tint: 1 }); c.P("M-4,-2 L-20,-36 H-8 L14,-2 Z M-4,10 L-20,40 H-8 L14,10 Z", { f: c.A }); c.P("M-40,0 L-46,-18 H-38 L-30,-2", { f: c.A }); }, "a2", "plane travel flight fly");
  def("ship", c => { c.P("M-46,8 H46 L32,34 H-32 Z", { f: c.A, tint: 1 }); c.R(-24, -14, 40, 22, 2); c.R(-4, -34, 12, 20, 2, { f: c.ink }); }, "a1", "ship cargo boat freight");
  def("train", c => { c.R(-34, -40, 68, 66, 10, { f: c.A, tint: 1 }); c.R(-24, -30, 48, 24, 3, { f: c.paper }); c.C(-16, 12, 5, { f: c.paper }); c.C(16, 12, 5, { f: c.paper }); c.L(-24, 26, -36, 44); c.L(24, 26, 36, 44); }, "a2", "train rail transport");
  // ======================================================================= nature
  def("tree", c => { c.R(-6, 10, 12, 34, 2, { f: c.ink }); c.C(0, -12, 30, { f: c.A, tint: 1 }); c.C(-20, 4, 18, { f: c.A }); c.C(20, 4, 18, { f: c.A }); }, "#3FA34D", "tree nature growth plant");
  def("plant", c => { c.P("M-22,14 H22 L16,44 H-16 Z", { f: c.A }); c.P("M0,14 V-20", { f: "n" }); c.P("M0,-6 C-22,-8 -30,-30 -26,-36 C-8,-34 0,-20 0,-6 Z M0,-14 C18,-18 28,-36 24,-44 C8,-42 0,-28 0,-14 Z", { f: "#3FA34D" }); }, "a1", "plant grow pot sprout");
  def("seedling", c => { c.P("M-30,40 Q0,30 30,40", { f: "n" }); c.P("M0,40 V0", { f: "n" }); c.P("M0,10 C-20,8 -30,-12 -26,-20 C-8,-18 0,-4 0,10 Z M0,0 C16,-4 26,-22 22,-30 C6,-28 0,-14 0,0 Z", { f: "#3FA34D" }); }, null, "seed sprout start beginning growth");
  def("leaf", c => { c.P("M-36,36 C-40,-10 -10,-40 40,-40 C40,10 10,40 -36,36 Z", { f: "#3FA34D", tint: 1 }); c.P("M-30,30 L20,-20", { f: "n" }); }, null, "leaf green eco sustainability");
  def("mountain", c => { c.P("M-48,40 L-12,-30 L6,-4 L20,-24 L48,40 Z", { tint: 1 }); c.P("M-22,-10 L-12,-30 L-2,-12 L-8,-8 L-14,-14 Z", { f: c.paper }); }, null, "mountain challenge climb summit");
  def("sun", c => { c.C(0, 0, 22, { f: c.A, tint: 1 }); for (let i = 0; i < 8; i++) { const a = i * 45 * SM.R; c.L(32 * Math.cos(a), 32 * Math.sin(a), 44 * Math.cos(a), 44 * Math.sin(a)); } }, "a3", "sun day weather bright");
  def("moon", c => { c.P("M10,-40 A40,40 0 1 0 40,10 A30,30 0 1 1 10,-40 Z", { f: c.A, tint: 1 }); }, "a3", "moon night sleep");
  def("raincloud", c => { c.P("M-30,10 H32 A18,18 0 0 0 30,-24 A24,24 0 0 0 -16,-30 A20,20 0 0 0 -30,10 Z"); [-18, 0, 18].forEach(x => c.L(x, 22, x - 6, 40, { s: c.A })); }, "a2", "rain weather storm cloud");
  def("lightning", c => { c.P("M10,-46 L-24,6 H0 L-12,46 L26,-8 H2 Z", { f: c.A, tint: 1 }); }, "a3", "lightning energy fast power zap");
  def("fire", c => { c.P("M0,44 C-30,44 -38,18 -26,-4 C-22,8 -14,10 -12,4 C-16,-18 -2,-34 6,-46 C8,-28 34,-14 32,14 C30,36 18,44 0,44 Z", { f: c.A, tint: 1 }); c.P("M0,44 C-12,44 -16,32 -10,22 C-4,28 2,24 2,14 C12,22 16,32 12,38 C8,44 4,44 0,44 Z", { f: c.a3, s: "n" }); }, "a1", "fire hot burn trending");
  def("drop", c => { c.P("M0,-44 C16,-18 32,0 32,16 A32,32 0 0 1 -32,16 C-32,0 -16,-18 0,-44 Z", { f: c.A, tint: 1 }); }, "a2", "water drop liquid");
  def("snowflake", c => { for (let i = 0; i < 3; i++) { const a = i * 60 * SM.R; c.L(-42 * Math.cos(a), -42 * Math.sin(a), 42 * Math.cos(a), 42 * Math.sin(a), { w: 1.2 }); } c.C(0, 0, 6, { f: c.A }); }, "a2", "snow winter cold freeze");
  def("globe", c => { c.C(0, 0, 40, { f: c.A, tint: 1 }); c.E(0, 0, 16, 40, { f: "n" }); c.L(-40, 0, 40, 0); c.P("M-34,-20 Q0,-12 34,-20 M-34,20 Q0,12 34,20", { f: "n", w: 0.8 }); }, "a2", "globe world global international earth");
  def("mappin", c => { c.P("M0,44 C-6,26 -30,6 -30,-14 A30,30 0 0 1 30,-14 C30,6 6,26 0,44 Z", { f: c.A, tint: 1 }); c.C(0, -14, 10, { f: c.paper }); }, "a1", "location pin map place");
  def("map", c => { c.P("M-44,-32 L-14,-40 L14,-32 L44,-40 V32 L14,40 L-14,32 L-44,40 Z", { tint: 1 }); c.L(-14, -40, -14, 32); c.L(14, -32, 14, 40); c.P("M-30,10 Q-10,-20 6,0 T34,-16", { f: "n", s: c.A, w: 1.1 }); }, "a1", "map route journey plan");
  def("compass", c => { c.C(0, 0, 40, { tint: 1 }); c.P("M0,-30 L9,0 L0,30 L-9,0 Z", { f: c.paper }); c.P("M0,-30 L9,0 H-9 Z", { f: c.A }); c.C(0, 0, 3, { f: c.ink }); }, "a1", "compass direction strategy navigation");
  def("signpost", c => { c.L(0, -44, 0, 44, { w: 1.4 }); c.P("M-8,-36 H34 L44,-26 L34,-16 H-8 Z", { f: c.A }); c.P("M8,-6 H-34 L-44,4 L-34,14 H8 Z", { f: c.paper }); }, "a2", "decision choice direction signpost options");
  def("road", c => { c.P("M-16,-44 L-44,44 M16,-44 L44,44", { f: "n" }); c.L(0, -40, 0, -24, { w: 1.2 }); c.L(0, -10, 0, 8, { w: 1.2 }); c.L(0, 22, 0, 44, { w: 1.2 }); }, null, "road path journey way");
  // ====================================================================== cinema (Kino!)
  def("clapper", c => { c.R(-42, -12, 84, 52, 4, { f: c.ink }); c.lines(-30, 6, 60, 3, 10, { f: c.paper }); const top = c.P("M-42,-14 L40,-30 L44,-18 L-38,-2 Z", { f: c.paper }); [-30, -12, 6, 24].forEach(x => c.P(`M${x},${-14 - (x + 42) * 0.195} l12,-2.4 l4,12 l-12,2.4 Z`, { f: c.ink, s: "n" })); c.C(-38, -10, 3, { f: c.A, s: "n" }); }, "a1", "clapper film movie action director kino");
  def("filmreel", c => { c.C(0, 0, 42, { f: c.A, tint: 1 }); c.C(0, 0, 8, { f: c.ink }); [0, 72, 144, 216, 288].forEach(a => c.C(24 * Math.cos(a * SM.R), 24 * Math.sin(a * SM.R), 9, { f: c.paper })); c.P("M30,30 Q44,44 48,46", { f: "n" }); }, "a1", "film reel movie cinema");
  def("filmstrip", c => { c.R(-46, -30, 92, 60, 4, { f: c.ink }); [-34, -12, 10, 32].forEach(x => { c.R(x - 5, -26, 10, 7, 1.5, { f: c.paper, s: "n" }); c.R(x - 5, 19, 10, 7, 1.5, { f: c.paper, s: "n" }); }); c.R(-38, -14, 34, 28, 2, { f: c.A, s: "n" }); c.R(4, -14, 34, 28, 2, { f: c.B === c.A ? c.a3 : c.B, s: "n" }); }, "a2", "film strip frames movie");
  def("popcorn", c => { c.P("M-28,-6 L28,-6 L20,44 H-20 Z", { f: c.paper }); [-18, -2, 14].forEach(x => c.P(`M${x - 6},-6 L${x - 2},44 M${x + 6},-6 L${x + 2},44`, { f: "n", s: c.A, w: 1.6 })); [[-20, -14], [-6, -22], [8, -18], [20, -12], [-12, -30], [4, -34]].forEach(([x, y]) => c.C(x, y, 10, { f: "#FFF6D6" })); }, "a1", "popcorn cinema movie fun");
  def("ticket", c => { c.P("M-46,-24 H46 V-8 A8,8 0 0 0 46,8 V24 H-46 V8 A8,8 0 0 0 -46,-8 Z", { f: c.A, tint: 1 }); c.P("M18,-24 V24", { f: "n", w: 0.6 }); c.T("KINO", -14, 1, 18, { f: c.ink }); }, "a3", "ticket cinema admit event");
  def("director-chair", c => { c.P("M-30,-40 V-14 M30,-40 V-14", { f: "n", w: 1.2 }); c.R(-32, -40, 64, 18, 3, { f: c.A }); c.R(-34, 0, 68, 10, 3, { f: c.A }); c.P("M-30,10 L28,46 M30,10 L-28,46 M-34,46 H-20 M20,46 H34", { f: "n", w: 1.2 }); }, "a1", "director chair film");
  def("spotlight", c => { c.P("M-10,-20 L-46,46 H46 L10,-20 Z", { f: c.A, s: "n", o: 0.35 }); c.R(-16, -44, 32, 26, 6, { f: c.ink }); }, "a3", "spotlight stage light focus");
  // ====================================================================== home & chores
  def("dishes", c => { [[0, 36], [0, 26], [0, 16]].forEach(([x, y]) => c.E(x, y, 40, 9)); c.E(0, 6, 40, 9, { f: c.A }); c.P("M-30,-4 Q-30,-30 -6,-30 H6 Q30,-30 30,-4 Z", { f: c.paper }); c.P("M-18,-30 Q-18,-44 0,-44 Q18,-44 18,-30", { f: "n" }); }, "a2", "dishes plates bowl kitchen chores washing up");
  def("sink", c => { c.R(-46, -6, 92, 18, 4, { tint: 1 }); c.P("M-38,12 H38 L30,40 H-30 Z", { f: c.soft }); c.P("M18,-6 V-34 Q18,-42 8,-42 H-2 V-34", { f: "n", w: 1.3 }); c.C(-2, -26, 3, { f: c.A, s: "n" }); }, "a2", "sink kitchen tap water dishes");
  def("broom", c => { c.L(-30, -44, 10, 14, { w: 1.6 }); c.P("M0,10 L26,2 L44,40 L4,44 Z", { f: c.A, tint: 1 }); c.P("M14,20 L22,42 M24,16 L32,40", { f: "n", w: 0.6 }); }, "a3", "broom sweep clean chores");
  def("washer", c => { c.R(-38, -44, 76, 88, 8, { tint: 1 }); c.L(-38, -26, 38, -26); c.C(-24, -35, 3.5, { f: c.ink, s: "n" }); c.R(10, -38, 20, 6, 2, { f: c.A, s: "n" }); c.C(0, 10, 24, { f: c.soft }); c.C(0, 10, 16, { f: c.A, s: "n", o: 0.5 }); }, "a2", "washing machine laundry clothes chores");
  def("laundry", c => { c.P("M-40,-10 H40 L32,40 H-32 Z", { f: c.paper, tint: 1 }); c.P("M-30,-10 Q-20,-34 -4,-16 Q8,-36 20,-14 Q32,-30 36,-10", { f: c.A }); [[-24, 4], [-8, 4], [8, 4], [24, 4], [-16, 22], [0, 22], [16, 22]].forEach(([x, y]) => c.C(x, y, 2.5, { f: c.ink, s: "n" })); }, "a1", "laundry basket clothes washing chores");
  def("trashbag", c => { c.P("M-6,-34 L-14,-44 M6,-34 L14,-44", { f: "n", w: 1.2 }); c.P("M-8,-32 Q-40,-20 -38,14 Q-36,42 0,42 Q36,42 38,14 Q40,-20 8,-32 Z", { f: c.A, tint: 1 }); c.P("M-8,-32 L0,-26 L8,-32", { f: "n" }); }, "a1", "trash bag rubbish garbage bin chores");
  def("bin", c => { c.P("M-30,-26 H30 L24,44 H-24 Z", { f: c.A, tint: 1 }); c.R(-36, -36, 72, 12, 4, { f: c.A }); c.R(-8, -44, 16, 8, 3, { f: "n" }); [-12, 0, 12].forEach(x => c.L(x, -14, x * 0.8, 34, { w: 0.7 })); }, "a2", "bin trash can garbage recycling");
  def("fridge", c => { c.R(-30, -46, 60, 92, 8, { tint: 1 }); c.L(-30, -10, 30, -10); c.L(20, -36, 20, -20, { w: 1.4 }); c.L(20, 2, 20, 26, { w: 1.4 }); c.R(-22, -38, 14, 14, 2, { f: c.A }); }, "a3", "fridge kitchen food home");
  def("sofa", c => { c.R(-46, -6, 92, 30, 8, { f: c.A, tint: 1 }); c.R(-40, -30, 80, 28, 8, { f: c.A }); c.R(-50, -14, 14, 38, 6, { f: c.A }); c.R(36, -14, 14, 38, 6, { f: c.A }); c.L(-40, 24, -40, 36, { w: 1.4 }); c.L(40, 24, 40, 36, { w: 1.4 }); }, "a2", "sofa couch living room relax home");
  def("tv", c => { c.R(-46, -32, 92, 58, 6, { tint: 1 }); c.R(-38, -24, 76, 42, 2, { f: c.A, s: "n", o: 0.85 }); c.L(-16, 26, -24, 40); c.L(16, 26, 24, 40); }, "a2", "tv television screen movie night");
  def("vacuum", c => { c.P("M-6,-44 Q-24,-44 -24,-26 L-10,30", { f: "n", w: 1.4 }); c.R(-30, 26, 60, 16, 6, { f: c.A }); c.R(6, -6, 34, 34, 10, { f: c.A, tint: 1 }); c.C(14, 36, 5, { f: c.ink }); c.C(32, 36, 5, { f: c.ink }); }, "a1", "vacuum cleaner hoover clean chores");
  def("spray", c => { c.P("M-16,-10 H16 L20,44 H-20 Z", { f: c.A, tint: 1 }); c.P("M-10,-10 V-26 H18 L30,-20 V-14 H8 V-10", { f: c.paper }); c.L(30, -20, 42, -24, { w: 0.7 }); c.L(30, -17, 44, -14, { w: 0.7 }); }, "a2", "spray bottle cleaner clean chores");
  def("sponge", c => { c.R(-40, -20, 80, 40, 10, { f: c.A, tint: 1 }); c.R(-40, -20, 80, 14, 7, { f: "#3FA34D" }); [[-20, 8], [0, 6], [20, 10], [-8, 14]].forEach(([x, y]) => c.C(x, y, 3, { f: c.ink, s: "n", o: 0.4 })); }, "a3", "sponge wash dishes clean");
  // ====================================================================== science & misc
  def("flask", c => { c.P("M-10,-44 H10 M-6,-44 V-14 L-32,32 Q-36,42 -26,42 H26 Q36,42 32,32 L6,-14 V-44", { tint: 1 }); c.P("M-22,12 H22 L30,32 Q32,38 26,38 H-26 Q-32,38 -30,32 Z", { f: c.A, s: "n" }); }, "a2", "science experiment lab chemistry test");
  def("atom", c => { c.E(0, 0, 44, 16, { f: "n" }); const e1 = c.E(0, 0, 44, 16, { f: "n" }); e1.setAttribute("transform", "rotate(60)"); const e2 = c.E(0, 0, 44, 16, { f: "n" }); e2.setAttribute("transform", "rotate(-60)"); c.C(0, 0, 7, { f: c.A }); }, "a2", "atom science physics research");
  def("dna", c => { c.P("M-16,-44 C30,-22 -30,22 16,44 M16,-44 C-30,-22 30,22 -16,44", { f: "n", w: 1.2 }); [-30, -14, 14, 30].forEach(y => c.L(-12, y, 12, y, { s: c.A })); }, "a1", "dna biology health genetics");
  def("microscope", c => { c.R(-10, -44, 16, 44, 4, { f: c.A, tint: 1 }); c.P("M-2,0 V18 M-28,40 H32 M20,40 Q34,10 6,-4", { f: "n", w: 1.2 }); c.R(-24, 18, 40, 8, 2); }, "a2", "microscope research science analysis");
  def("pill", c => { const g = c.R(-40, -16, 80, 32, 16, { f: c.paper }); const h = c.P("M0,-16 H-24 A16,16 0 0 0 -24,16 H0 Z", { f: c.A }); g.setAttribute("transform", "rotate(-35)"); h.setAttribute("transform", "rotate(-35)"); }, "a1", "pill health medicine pharma");
  def("heart", c => { c.P("M0,40 C-50,6 -44,-36 -18,-38 C-6,-38 0,-28 0,-22 C0,-28 6,-38 18,-38 C44,-36 50,6 0,40 Z", { f: c.A, tint: 1 }); }, "a1", "heart love like health care");
  def("heartbeat", c => { c.P("M-46,4 H-22 L-12,-24 L2,30 L12,-4 H46", { f: "n", s: c.A, w: 1.5 }); }, "a1", "heartbeat health pulse monitor");
  def("magnet", c => { c.P("M-34,-4 V-38 H-14 V-4 A14,14 0 0 0 14,-4 V-38 H34 V-4 A34,34 0 0 1 -34,-4 Z", { f: c.A, tint: 1 }); c.R(-34, -38, 20, 12, 0, { f: c.paper }); c.R(14, -38, 20, 12, 0, { f: c.paper }); }, "a1", "magnet attract leads");
  def("anchor", c => { c.C(0, -32, 8, { f: "n" }); c.L(0, -24, 0, 40, { w: 1.3 }); c.L(-18, -10, 18, -10); c.P("M-36,10 Q-30,40 0,40 Q30,40 36,10", { f: "n", w: 1.3 }); }, null, "anchor stable stuck");
  def("ladder", c => { c.L(-20, -46, -20, 46, { w: 1.3 }); c.L(20, -46, 20, 46, { w: 1.3 }); for (let y = -36; y <= 40; y += 16) c.L(-20, y, 20, y); }, null, "ladder climb career progress steps");
  def("stairs", c => { c.P("M-46,44 V24 H-24 V4 H-2 V-16 H20 V-36 H46 V44 Z", { f: c.A, tint: 1 }); }, "a3", "stairs steps progress growth levels");
  def("door", c => { c.R(-26, -46, 52, 90, 3, { f: c.A, tint: 1 }); c.C(14, 2, 4, { f: c.ink }); }, "a2", "door opportunity entry exit");
  def("window", c => { c.R(-36, -36, 72, 72, 3, { f: c.paper }); c.L(0, -36, 0, 36); c.L(-36, 0, 36, 0); }, null, "window");
  def("bed", c => { c.R(-46, 0, 92, 20, 4, { f: c.A }); c.L(-46, -20, -46, 36, { w: 1.4 }); c.L(46, 10, 46, 36, { w: 1.4 }); c.R(-40, -10, 24, 12, 6, { f: c.paper }); }, "a2", "bed sleep rest night");
  def("coffee", c => { c.P("M-30,-20 H22 V20 A16,16 0 0 1 6,36 H-14 A16,16 0 0 1 -30,20 Z", { f: c.A, tint: 1 }); c.P("M22,-10 H30 A10,10 0 0 1 30,10 H22", { f: "n" }); c.P("M-16,-30 q-6,-8 0,-16 M-2,-30 q-6,-8 0,-16 M12,-30 q-6,-8 0,-16", { f: "n", w: 0.8 }); }, "a1", "coffee break morning energy");
  def("pizza", c => { c.P("M-38,-30 Q0,-46 38,-30 L0,44 Z", { f: c.A }); c.P("M-38,-30 Q0,-46 38,-30", { f: "n", w: 2 }); c.C(-8, -16, 5, { f: c.a1, s: "n" }); c.C(10, -4, 5, { f: c.a1, s: "n" }); c.C(-2, 14, 5, { f: c.a1, s: "n" }); }, "a3", "pizza food lunch fun");
  def("umbrella", c => { c.P("M-46,0 A46,40 0 0 1 46,0 Q34,-8 23,0 Q12,-8 0,0 Q-12,-8 -23,0 Q-34,-8 -46,0 Z", { f: c.A, tint: 1 }); c.P("M0,0 V36 A8,8 0 0 1 -16,36", { f: "n", w: 1.2 }); }, "a2", "umbrella insurance protection rain");
  def("balloon", c => { c.E(0, -12, 26, 32, { f: c.A, tint: 1 }); c.P("M-4,20 L4,20 L0,24 Z", { f: c.A }); c.P("M0,24 Q-8,34 0,46", { f: "n", w: 0.8 }); }, "a1", "balloon party celebrate");
  def("dice", c => { c.R(-36, -36, 72, 72, 12, { tint: 1 }); [[-16, -16], [16, 16], [0, 0], [16, -16], [-16, 16]].forEach(([x, y]) => c.C(x, y, 6, { f: c.ink, s: "n" })); }, null, "dice chance luck risk random");
  def("hammer", c => { c.R(-30, -40, 50, 20, 4, { f: c.A, tint: 1 }); c.L(-4, -20, -4, 44, { w: 2 }); }, "a3", "hammer build fix tool");
  def("wrench", c => { c.P("M-36,40 L8,-4", { f: "n", w: 2.6 }); c.P("M8,-4 A20,20 0 1 1 28,-36 L20,-20 L28,-12 L44,-20 A20,20 0 0 1 8,-4 Z", { f: c.A, tint: 1 }); }, "a3", "wrench tool fix settings maintenance");
  def("toolbox", c => { c.R(-44, -16, 88, 54, 6, { f: c.A, tint: 1 }); c.P("M-16,-16 V-30 H16 V-16", { f: "n", w: 1.2 }); c.L(-44, 4, 44, 4); }, "a1", "tools toolbox kit");
  def("battery-low", c => { c.R(-44, -20, 80, 40, 6); c.R(36, -8, 8, 16, 2, { f: c.ink }); c.R(-36, -12, 12, 24, 2, { s: "n", f: c.A }); }, "a1", "battery low tired energy");
  def("eye", c => { c.P("M-46,0 Q0,-40 46,0 Q0,40 -46,0 Z", { tint: 1 }); c.C(0, 0, 14, { f: c.A }); c.C(0, 0, 6, { f: c.ink, s: "n" }); }, "a2", "eye see view vision watch");
  def("hand", c => { c.P("M-18,40 V-8 Q-18,-14 -12,-14 Q-6,-14 -6,-8 V-30 Q-6,-36 0,-36 Q6,-36 6,-30 V-10 V-24 Q6,-30 12,-30 Q18,-30 18,-24 V-6 V-16 Q18,-22 24,-22 Q30,-22 30,-16 V20 Q30,40 10,40 Z", { f: c.paper }); }, null, "hand stop raise");
  def("thumbsup", c => { c.R(-40, -6, 18, 44, 4, { f: c.A }); c.P("M-22,-2 L-8,-2 L2,-40 Q14,-40 12,-24 L8,-8 H34 Q42,-8 40,2 L34,32 Q32,38 24,38 H-22 Z", { f: c.paper }); }, "a2", "like approve thumbs up good");
  def("user", c => { c.C(0, -16, 18, { f: c.paper }); c.P("M-34,40 A34,30 0 0 1 34,40 Z", { f: c.A, tint: 1 }); }, "a2", "user person profile account customer");
  def("users", c => { c.C(-18, -14, 14, { f: c.paper }); c.P("M-44,36 A26,24 0 0 1 8,36 Z", { f: c.muted }); c.C(16, -18, 16, { f: c.paper }); c.P("M-12,40 A28,26 0 0 1 44,40 Z", { f: c.A, tint: 1 }); }, "a2", "users team group people community");
  def("idcard", c => { c.R(-46, -30, 92, 60, 7, { tint: 1 }); c.C(-22, -4, 10, { f: c.A }); c.P("M-38,22 A16,12 0 0 1 -6,22", { f: c.A }); c.lines(4, -12, 32, 3, 12); }, "a2", "id card identity profile");
  def("question", c => { c.C(0, 0, 42, { f: c.A, tint: 1 }); c.T("?", 0, 3, 56, { f: c.ink }); }, "a3", "question faq help unknown");
  def("exclamation", c => { c.C(0, 0, 42, { f: c.A, tint: 1 }); c.T("!", 0, 3, 56, { f: c.ink }); }, "a1", "exclamation important alert");
  def("plus", c => { c.C(0, 0, 40, { f: c.A, tint: 1 }); c.L(-18, 0, 18, 0, { s: c.paper, w: 1.8 }); c.L(0, -18, 0, 18, { s: c.paper, w: 1.8 }); }, "a2", "plus add new create");
  def("minus", c => { c.C(0, 0, 40, { f: c.A, tint: 1 }); c.L(-18, 0, 18, 0, { s: c.paper, w: 1.8 }); }, "a1", "minus remove less");
  def("percent", c => { c.C(0, 0, 42, { f: c.A, tint: 1 }); c.T("%", 0, 2, 46, { f: c.ink }); }, "a3", "percent rate discount interest");
  def("arrowup", c => { c.P("M0,-44 L32,-8 H12 V44 H-12 V-8 H-32 Z", { f: c.A, tint: 1 }); }, "a2", "arrow up increase growth");
  def("arrowdown", c => { c.P("M0,44 L32,8 H12 V-44 H-12 V8 H-32 Z", { f: c.A, tint: 1 }); }, "a1", "arrow down decrease");
  def("arrowright", c => { c.P("M44,0 L8,32 V12 H-44 V-12 H8 V-32 Z", { f: c.A, tint: 1 }); }, "a2", "arrow next forward");
  def("refresh", c => { c.P("M30,-20 A36,36 0 1 0 36,10", { f: "n", w: 1.4 }); c.P("M18,-30 L32,-20 L22,-6", { f: "n", w: 1.4 }); }, null, "refresh cycle repeat loop update");
  def("infinity", c => { c.P("M0,0 C-12,-22 -44,-22 -44,0 C-44,22 -12,22 0,0 C12,-22 44,-22 44,0 C44,22 12,22 0,0 Z", { f: "n", w: 1.5, s: c.A }); }, "a2", "infinity forever unlimited loop");
  def("link", c => { c.R(-44, -14, 50, 28, 14, { f: "n", w: 1.3 }); c.R(-6, -14, 50, 28, 14, { f: "n", w: 1.3, s: c.A }); }, "a2", "link chain connect url");
  def("chain", c => { c.R(-46, -12, 40, 24, 12, { f: "n", w: 1.3 }); c.R(-18, -12, 40, 24, 12, { f: "n", w: 1.3 }); c.R(10, -12, 36, 24, 12, { f: "n", w: 1.3 }); }, null, "chain blockchain connected dependency");
  def("network", c => { const n = [[0, -30], [-34, 4], [32, 0], [-14, 34], [20, 34]]; [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [1, 2]].forEach(([a, b]) => c.L(n[a][0], n[a][1], n[b][0], n[b][1], { w: 0.8 })); n.forEach(([x, y], i) => c.C(x, y, i === 0 ? 11 : 8, { f: i === 0 ? c.A : c.paper })); }, "a2", "network graph nodes connections");
  def("brick", c => { for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) c.R(-46 + q * 31 + (r % 2 ? -15 : 0), -40 + r * 20, 30, 18, 2, { f: c.A }); }, "a1", "wall brick blocker obstacle");
  def("bomb", c => { c.C(-4, 8, 32, { f: c.ink }); c.R(-12, -32, 16, 12, 2, { f: c.ink }); c.P("M-4,-32 Q8,-48 24,-40", { f: "n" }); c.C(26, -40, 5, { f: c.A, s: "n" }); }, "a1", "bomb crisis danger explode");
  def("ghost", c => { c.P("M-30,40 V-8 A30,30 0 0 1 30,-8 V40 L20,30 L10,40 L0,30 L-10,40 L-20,30 Z", { tint: 1 }); c.C(-10, -8, 5, { f: c.ink, s: "n" }); c.C(10, -8, 5, { f: c.ink, s: "n" }); }, null, "ghost ghosting fear spooky");
  def("skull", c => { c.P("M-30,6 A30,30 0 1 1 30,6 V20 H18 V34 H-18 V20 H-30 Z", { tint: 1 }); c.C(-12, -4, 7, { f: c.ink, s: "n" }); c.C(12, -4, 7, { f: c.ink, s: "n" }); }, null, "skull death danger");
  def("sparkle", c => { c.P("M0,-44 Q4,-4 44,0 Q4,4 0,44 Q-4,4 -44,0 Q-4,-4 0,-44 Z", { f: c.A, tint: 1 }); }, "a3", "sparkle shine magic ai new");
  def("wand", c => { c.L(-40, 40, 20, -20, { w: 2 }); c.P("M26,-44 L30,-30 L44,-26 L30,-22 L26,-8 L22,-22 L8,-26 L22,-30 Z", { f: c.A }); }, "a3", "magic wand automation easy");
  def("checkbox", c => { c.R(-36, -36, 72, 72, 10, { tint: 1 }); c.P("M-18,0 l12,12 l26,-26", { f: "n", s: c.A, w: 1.8 }); }, "a2", "checkbox done task todo");
  def("toggle", c => { c.R(-44, -22, 88, 44, 22, { f: c.A, tint: 1 }); c.C(22, 0, 16, { f: c.paper }); }, "a2", "toggle switch on settings");
  def("slider", c => { c.L(-44, 0, 44, 0, { w: 1.4 }); c.L(-44, 0, 10, 0, { s: c.A, w: 1.6 }); c.C(10, 0, 12, { f: c.paper }); }, "a2", "slider adjust control");
  def("qrcode", c => { c.R(-40, -40, 80, 80, 4); [[-30, -30], [10, -30], [-30, 10]].forEach(([x, y]) => { c.R(x, y, 20, 20, 2, { f: c.ink, s: "n" }); }); const rnd = SM.rng(9); for (let i = 0; i < 18; i++) c.R(-6 + Math.floor(rnd() * 6) * 8, -6 + Math.floor(rnd() * 6) * 8, 6, 6, 0, { f: c.ink, s: "n" }); }, null, "qr scan code");
  def("hashtag", c => { c.T("#", 0, 4, 90, { f: c.A }); }, "a2", "hashtag social trending");
  def("at", c => { c.T("@", 0, 4, 84, { f: c.A }); }, "a2", "at email mention");
  def("pin", c => { c.C(0, -22, 18, { f: c.A, tint: 1 }); c.L(0, -4, 0, 42, { w: 1.3 }); }, "a1", "pin pushpin note");
  def("shoe", c => { c.P("M-44,20 V-6 Q-44,-18 -32,-18 L-12,-18 Q-4,-2 12,-2 L34,4 Q46,8 46,20 Z", { f: c.A, tint: 1 }); c.R(-46, 18, 94, 12, 5, { f: c.paper }); c.P("M-24,-14 l6,8 M-16,-14 l6,8", { f: "n", w: 0.8 }); }, "a1", "shoe sneaker run start habit");
  def("snowball", c => { c.C(0, 0, 40, { f: c.paper, tint: 1 }); c.P("M-22,-14 q8,-8 18,-6 M8,18 q10,-2 14,-12", { f: "n", w: 0.7, s: c.muted }); }, null, "snowball growth compound momentum");
  def("sticky", c => { c.P("M-38,-38 H38 V18 L18,38 H-38 Z", { f: c.A, tint: 1 }); c.P("M18,38 V18 H38", { f: "n" }); c.lines(-26, -20, 46, 3, 12); }, "a3", "sticky note reminder postit");
  def("bulb-off", c => { c.P("M-14,22 C-14,8 -30,0 -30,-16 A30,30 0 0 1 30,-16 C30,0 14,8 14,22 Z", { f: c.soft }); c.L(-12, 30, 12, 30); c.L(-9, 38, 9, 38); }, null, "idea missing no idea");
})(typeof window !== "undefined" ? window : globalThis);
