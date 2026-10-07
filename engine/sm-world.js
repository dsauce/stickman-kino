/*!
 * Stickman Kino - world: theme backdrops + environment builders
 *   Theme decor is applied automatically to every scene (paper speckle, chalk smudges, blueprint grid,
 *   studio perspective floor, neon glow, sunset sky).
 *   sc.env.city({ y }) · hills · mountains · clouds({ drift: true }) · trees · road({ scroll: [t0, t1] })
 *   ocean · room · office · stage · night · park · space
 */
(function (root) {
  "use strict";
  const SM = root.SM; if (!SM) throw new Error("load sm-core.js first");

  // ------------------------------------------------------------ theme decor
  SM.decorate = function (sc) {
    const th = sc.theme, W = sc.W, H = sc.H, u = sc.u, g = sc.decor, rnd = SM.rng(SM.hash(sc.id) + 7);
    switch (th.decor) {
      case "paper": {
        for (let i = 0; i < 260; i++) SM.el("circle", { cx: rnd() * W, cy: rnd() * H, r: (0.6 + rnd() * 1.6) * u, fill: th.ink, opacity: 0.05 + rnd() * 0.06 }, g);
        const grad = SM.el("radialGradient", { id: sc.id + "-vig", cx: "50%", cy: "50%", r: "75%" }, SM.el("defs", {}, g));
        SM.el("stop", { offset: "60%", "stop-color": th.ink, "stop-opacity": 0 }, grad); SM.el("stop", { offset: "100%", "stop-color": "#6b4e2a", "stop-opacity": 0.16 }, grad);
        SM.el("rect", { x: 0, y: 0, width: W, height: H, fill: `url(#${sc.id}-vig)` }, g);
        break;
      }
      case "chalk": {
        for (let i = 0; i < 9; i++) SM.el("ellipse", { cx: rnd() * W, cy: rnd() * H, rx: (120 + rnd() * 240) * u, ry: (40 + rnd() * 80) * u, fill: "#FFFFFF", opacity: 0.025 + rnd() * 0.03, transform: `rotate(${(rnd() - 0.5) * 30})` }, g);
        SM.el("rect", { x: 10 * u, y: 10 * u, width: W - 20 * u, height: H - 20 * u, fill: "none", stroke: "#6E4B2A", "stroke-width": 20 * u, rx: 6 * u }, g);
        break;
      }
      case "grid": {
        const step = 48 * u;
        for (let x = 0; x <= W; x += step) SM.el("line", { x1: x, y1: 0, x2: x, y2: H, stroke: th.ink, opacity: Math.round(x / step) % 4 ? 0.07 : 0.16, "stroke-width": 1.5 * u }, g);
        for (let y = 0; y <= H; y += step) SM.el("line", { x1: 0, y1: y, x2: W, y2: y, stroke: th.ink, opacity: Math.round(y / step) % 4 ? 0.07 : 0.16, "stroke-width": 1.5 * u }, g);
        break;
      }
      case "studio": {
        const gy = sc.groundY, vx = W / 2, vy = gy - H * 0.55;
        for (let i = -14; i <= 14; i++) { const bx = vx + i * 150 * u; SM.el("line", { x1: vx + (bx - vx) * 0.18, y1: gy, x2: bx + (bx - vx) * 1.4, y2: H + 40 * u, stroke: "#C9D2DC", "stroke-width": 2 * u, opacity: 0.8 }, g); }
        for (let k = 0; k < 6; k++) { const yy = gy + Math.pow(k / 6, 1.7) * (H - gy) + 4 * u; SM.el("line", { x1: 0, y1: yy, x2: W, y2: yy, stroke: "#C9D2DC", "stroke-width": 2 * u, opacity: 0.8 }, g); }
        const grad = SM.el("radialGradient", { id: sc.id + "-glow", cx: "50%", cy: "40%", r: "60%" }, SM.el("defs", {}, g));
        SM.el("stop", { offset: "0%", "stop-color": "#E8F7FF", "stop-opacity": 0.9 }, grad); SM.el("stop", { offset: "100%", "stop-color": "#FFFFFF", "stop-opacity": 0 }, grad);
        SM.el("rect", { x: 0, y: 0, width: W, height: gy, fill: `url(#${sc.id}-glow)` }, g);
        break;
      }
      case "glow": {
        sc.cam.style.filter = `drop-shadow(0 0 ${5 * u}px ${th.accents[1]}66)`;
        break;
      }
      case "sunset": {
        const lg = SM.el("linearGradient", { id: sc.id + "-sky", x1: 0, y1: 0, x2: 0, y2: 1 }, SM.el("defs", {}, g));
        SM.el("stop", { offset: "0%", "stop-color": "#FFD6A5" }, lg); SM.el("stop", { offset: "100%", "stop-color": th.bg }, lg);
        SM.el("rect", { x: 0, y: 0, width: W, height: H, fill: `url(#${sc.id}-sky)` }, g);
        SM.el("circle", { cx: W * 0.78, cy: sc.groundY - 40 * u, r: 150 * u, fill: "#FFB26B", opacity: 0.55 }, g);
        break;
      }
    }
  };

  // ------------------------------------------------------------ environments
  class Env {
    constructor(sc) { this.sc = sc; this.rnd = SM.rng(SM.hash(sc.id) + 31); }
    _g(o) { return SM.el("g", {}, this.sc.layer((o && o.layer) || "world")); }
    _thing(g, o) { const th = new SM.Thing(this.sc, g, {}); if (o && o.hidden) th.hide(); return th; }
    city(o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = this._g(o), y = o.y == null ? sc.groundY : o.y, x0 = o.x0 == null ? -200 * u : o.x0, x1 = o.x1 == null ? sc.W * (o.wide ? 3 : 1) + 200 * u : o.x1;
      const ink = sc._col(o.color || "ink"), op = o.opacity == null ? 1 : o.opacity;
      for (let x = x0; x < x1;) {
        const w = (90 + this.rnd() * 110) * u, h = (o.height || 360) * u * (0.4 + this.rnd() * 0.7);
        SM.el("rect", { x, y: y - h, width: w, height: h, fill: o.fill ? sc._col(o.fill) : sc.theme.paper, stroke: ink, "stroke-width": 5 * u, opacity: op }, g);
        for (let wy = y - h + 24 * u; wy < y - 30 * u; wy += 38 * u) for (let wx = x + 16 * u; wx < x + w - 24 * u; wx += 30 * u) if (this.rnd() > 0.35) SM.el("rect", { x: wx, y: wy, width: 12 * u, height: 16 * u, fill: this.rnd() > 0.85 ? sc.theme.accents[2] : sc.theme.muted, opacity: 0.6 * op }, g);
        if (this.rnd() > 0.7) SM.el("line", { x1: x + w / 2, y1: y - h, x2: x + w / 2, y2: y - h - 40 * u, stroke: ink, "stroke-width": 4 * u, opacity: op }, g);
        x += w + (this.rnd() * 30 - 5) * u;
      }
      return this._thing(g, o);
    }
    hills(o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = this._g(o), y = o.y == null ? sc.groundY : o.y, W = sc.W * (o.wide ? 3 : 1);
      [[0.6, 0.35], [1, 0.55]].forEach(([k, op], li) => { let d = `M${-100 * u},${y}`; for (let x = -100 * u; x <= W + 200 * u; x += 300 * u) d += ` Q${x + 150 * u},${y - (80 + this.rnd() * 120) * u * k} ${x + 300 * u},${y}`; SM.el("path", { d: d + " Z", fill: li ? sc._col(o.fill || "soft") : sc.theme.paper, stroke: sc.theme.ink, "stroke-width": 5 * u, opacity: o.opacity == null ? 1 : o.opacity }, g); });
      return this._thing(g, o);
    }
    mountains(o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = this._g(o), y = o.y == null ? sc.groundY : o.y;
      let x = -100 * u; while (x < sc.W * (o.wide ? 3 : 1)) { const w = (300 + this.rnd() * 300) * u, h = (220 + this.rnd() * 260) * u; SM.el("path", { d: `M${x},${y} L${x + w / 2},${y - h} L${x + w},${y} Z`, fill: sc.theme.paper, stroke: sc.theme.ink, "stroke-width": 5 * u, "stroke-linejoin": "round" }, g); SM.el("path", { d: `M${x + w / 2 - w * 0.12},${y - h * 0.76} L${x + w / 2},${y - h} L${x + w / 2 + w * 0.12},${y - h * 0.76} L${x + w / 2 + w * 0.04},${y - h * 0.8} L${x + w / 2 - w * 0.04},${y - h * 0.72} Z`, fill: sc.theme.soft, stroke: sc.theme.ink, "stroke-width": 3 * u }, g); x += w * 0.7; }
      return this._thing(g, o);
    }
    clouds(o) {
      o = o || {}; const sc = this.sc, u = sc.u, n = o.n || 4, out = [];
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) / n * sc.W + (this.rnd() - 0.5) * 200 * u, y = (o.y0 || 110) * u + this.rnd() * (o.spread || 200) * u;
        const c = sc.prop("cloud", { x, y, size: (o.size || 170) * u * (0.7 + this.rnd() * 0.6), layer: o.layer || "world" });
        if (o.drift !== false) c.moveTo(x + (o.speed || 40) * u * sc.dur * (i % 2 ? 0.7 : 1), y, 0, sc.dur, "none");
        out.push(c);
      }
      return out;
    }
    trees(o) {
      o = o || {}; const sc = this.sc, u = sc.u, n = o.n || 5, out = [];
      for (let i = 0; i < n; i++) { const s = (o.size || 200) * u * (0.7 + this.rnd() * 0.5), x = (o.x0 || 0) + (i + 0.5) / n * ((o.x1 || sc.W) - (o.x0 || 0)); out.push(sc.prop("tree", { x, y: (o.y == null ? sc.groundY : o.y) - s * 0.44, size: s, layer: o.layer || "world" })); }
      return out;
    }
    // road with a dashed centre line; scroll:[t0,t1] makes the dashes move (treadmill feel for running scenes)
    road(o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = this._g(o), y = o.y == null ? sc.groundY : o.y, h = (o.h || 120) * u, W = sc.W * (o.wide ? 3 : 1);
      SM.el("rect", { x: -sc.W, y, width: W + 2 * sc.W, height: h, fill: sc._col(o.fill || "soft") }, g);
      SM.el("line", { x1: -sc.W, y1: y, x2: W + sc.W, y2: y, stroke: sc.theme.ink, "stroke-width": 5 * u }, g);
      SM.el("line", { x1: -sc.W, y1: y + h, x2: W + sc.W, y2: y + h, stroke: sc.theme.ink, "stroke-width": 5 * u }, g);
      const dash = SM.el("line", { x1: -sc.W, y1: y + h / 2, x2: W + sc.W, y2: y + h / 2, stroke: sc.theme.ink, "stroke-width": 6 * u, "stroke-dasharray": `${60 * u} ${50 * u}` }, g);
      if (o.scroll) sc.tl.to(dash, { strokeDashoffset: (o.dir === "right" ? -1 : 1) * 110 * u * Math.round((o.scroll[1] - o.scroll[0]) * (o.speed || 6)), duration: o.scroll[1] - o.scroll[0], ease: "none" }, sc.T(o.scroll[0]));
      return this._thing(g, o);
    }
    ocean(o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = this._g(o), y = o.y == null ? sc.groundY : o.y;
      const waves = [];
      [0, 1, 2].forEach(i => { let d = `M${-300 * u},${y + i * 40 * u}`; for (let x = -300 * u; x < sc.W + 300 * u; x += 80 * u) d += ` q${20 * u},${-18 * u} ${40 * u},0 t${40 * u},0`; const p = SM.el("path", { d, fill: "none", stroke: i ? sc._col(o.color || "a2") : sc.theme.ink, "stroke-width": 5 * u, opacity: 1 - i * 0.25 }, g); waves.push(p); sc.tl.to(p, { x: (i % 2 ? -1 : 1) * 80 * u * Math.round(sc.dur / 1.5), duration: sc.dur, ease: "none" }, sc.T(0)); });
      return this._thing(g, o);
    }
    room(o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = this._g(o), y = o.y == null ? sc.groundY : o.y;
      SM.el("line", { x1: 0, y1: y - 22 * u, x2: sc.W, y2: y - 22 * u, stroke: sc.theme.ink, "stroke-width": 3 * u, opacity: 0.5 }, g);
      if (o.window !== false) { const wx = o.windowX || sc.W * 0.7, wy = y - 520 * u; SM.el("rect", { x: wx, y: wy, width: 260 * u, height: 220 * u, fill: o.night ? sc.theme.ink : sc.theme.soft, stroke: sc.theme.ink, "stroke-width": 6 * u }, g); SM.el("line", { x1: wx + 130 * u, y1: wy, x2: wx + 130 * u, y2: wy + 220 * u, stroke: sc.theme.ink, "stroke-width": 5 * u }, g); SM.el("line", { x1: wx, y1: wy + 110 * u, x2: wx + 260 * u, y2: wy + 110 * u, stroke: sc.theme.ink, "stroke-width": 5 * u }, g); if (o.night) SM.el("circle", { cx: wx + 70 * u, cy: wy + 55 * u, r: 22 * u, fill: sc.theme.accents[2] }, g); }
      if (o.frame !== false) { const fx = o.frameX || sc.W * 0.25; SM.el("rect", { x: fx, y: y - 500 * u, width: 160 * u, height: 120 * u, fill: sc.theme.paper, stroke: sc.theme.ink, "stroke-width": 5 * u }, g); SM.el("path", { d: `M${fx + 20 * u},${y - 400 * u} L${fx + 70 * u},${y - 460 * u} L${fx + 100 * u},${y - 425 * u} L${fx + 120 * u},${y - 445 * u} L${fx + 145 * u},${y - 400 * u}`, fill: "none", stroke: sc.theme.accents[1], "stroke-width": 5 * u }, g); }
      if (o.lamp) { const lx = o.lampX || sc.W * 0.12; SM.el("path", { d: `M${lx},${y} V${y - 300 * u} M${lx - 50 * u},${y - 300 * u} L${lx - 30 * u},${y - 380 * u} H${lx + 30 * u} L${lx + 50 * u},${y - 300 * u} Z`, fill: sc.theme.accents[2], stroke: sc.theme.ink, "stroke-width": 5 * u }, g); }
      return this._thing(g, o);
    }
    // desk + laptop + chair as one composed set; returns positions you can act on
    office(o) {
      o = o || {}; const sc = this.sc, u = sc.u, x = o.x == null ? sc.cx : o.x, y = o.y == null ? sc.groundY : o.y;
      const deskTop = y - 190 * u;
      const desk = sc.path(`M${x - 190 * u},${deskTop} H${x + 190 * u} M${x - 160 * u},${deskTop} V${y} M${x + 160 * u},${deskTop} V${y}`, { width: 8, draw: false, visible: true, layer: o.layer || "back" });
      gsap.set(desk.el.querySelector("path"), { opacity: 1, strokeDasharray: "none" });
      const laptop = sc.prop("laptop", { x: x + 40 * u, y: deskTop - 50 * u, size: 150 * u, layer: o.layer || "back" });
      const seatY = y - 118 * u;
      const chair = sc.path(`M${x - 230 * u},${y - 330 * u} V${seatY} H${x - 120 * u} M${x - 220 * u},${seatY} L${x - 240 * u},${y} M${x - 130 * u},${seatY} L${x - 110 * u},${y}`, { width: 8, draw: false, visible: true, layer: o.layer || "back" });
      gsap.set(chair.el.querySelector("path"), { opacity: 1, strokeDasharray: "none" });
      return { desk, laptop, chair, seatX: x - 175 * u, seatY, deskTop, keyboard: { x: x - 10 * u, y: deskTop - 12 * u } };
    }
    stage(o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = this._g(o), x = o.x == null ? sc.cx : o.x, y = o.y == null ? sc.groundY : o.y;
      SM.el("path", { d: `M${x - 90 * u},-20 L${x + 90 * u},-20 L${x + 420 * u},${y} L${x - 420 * u},${y} Z`, fill: sc.theme.accents[2], opacity: 0.18 }, g);
      SM.el("ellipse", { cx: x, cy: y, rx: 420 * u, ry: 40 * u, fill: sc.theme.accents[2], opacity: 0.3 }, g);
      return this._thing(g, o);
    }
    space(o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = this._g(o);
      SM.el("rect", { x: -sc.W, y: -sc.H, width: sc.W * 3, height: sc.H * 3, fill: o.fill || "#0B1026" }, g);
      for (let i = 0; i < (o.n || 120); i++) SM.el("circle", { cx: this.rnd() * sc.W, cy: this.rnd() * sc.H, r: (1 + this.rnd() * 2.6) * u, fill: "#FFFFFF", opacity: 0.4 + this.rnd() * 0.6 }, g);
      if (o.planet !== false) { SM.el("circle", { cx: sc.W * 0.8, cy: sc.H * 0.25, r: 110 * u, fill: sc.theme.accents[1], stroke: "#FFFFFF", "stroke-width": 5 * u }, g); SM.el("ellipse", { cx: sc.W * 0.8, cy: sc.H * 0.25, rx: 190 * u, ry: 34 * u, fill: "none", stroke: "#FFFFFF", "stroke-width": 5 * u, transform: `rotate(-14 ${sc.W * 0.8} ${sc.H * 0.25})` }, g); }
      return this._thing(g, o);
    }
    night(o) { o = o || {}; const sc = this.sc; const g = this._g(o); SM.el("rect", { x: -sc.W, y: -sc.H, width: sc.W * 3, height: sc.H * 3, fill: o.fill || "#141A33" }, g); const m = sc.prop("moon", { x: sc.W * 0.82, y: sc.H * 0.18, size: 130 * sc.u, layer: o.layer || "world" }); for (let i = 0; i < 60; i++) SM.el("circle", { cx: this.rnd() * sc.W, cy: this.rnd() * sc.groundY * 0.8, r: (1 + this.rnd() * 2) * sc.u, fill: "#FFFFFF", opacity: 0.5 + this.rnd() * 0.5 }, g); return { sky: this._thing(g, o), moon: m }; }
    park(o) { o = o || {}; const a = this.hills(Object.assign({}, o, { fill: o.fill || "soft" })); const t = this.trees(Object.assign({ n: 4 }, o)); const c = this.clouds(o); return { hills: a, trees: t, clouds: c }; }
  }
  Object.defineProperty(SM.Scene.prototype, "env", { get() { if (!this._env) this._env = new Env(this); return this._env; } });
})(typeof window !== "undefined" ? window : globalThis);
