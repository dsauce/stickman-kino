/*!
 * Stickman Kino - effects, camera, transitions
 *   sc.fx.confetti(x, y, t)   sc.fx.burst(x, y, t)   sc.fx.rain("document", t0, t1) ...
 *   sc.camera.focus(x, y, 1.6, t, d)   sc.camera.follow(fig, t0, t1)   sc.camera.shake(t)
 *   sc.enter("iris", { d: 0.6 })   sc.exit("wipe-left")
 * Particles are deterministic (seeded per scene) so renders are reproducible.
 */
(function (root) {
  "use strict";
  const SM = root.SM; if (!SM) throw new Error("load sm-core.js first");
  SM.fx = true;

  // =================================================================== FX
  class FX {
    constructor(sc) { this.sc = sc; this.rnd = SM.rng(SM.hash(sc.id) + 99); }
    _layer(o) { return this.sc.layer((o && o.layer) || "front"); }
    _cols(o) { const a = this.sc.theme.accents; return (o && o.colors) ? o.colors.map(c => this.sc._col(c)) : [a[0], a[1], a[2]]; }
    _T(t) { return this.sc.T(t); }
    // radial emphasis lines
    burst(x, y, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, n = o.n || 10, r0 = (o.r || 60) * u, len = (o.len || 50) * u, col = sc._col(o.color || "a3"), g = SM.el("g", {}, this._layer(o));
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 + (o.rot || 0), l = SM.el("line", { x1: x + r0 * Math.cos(a), y1: y + r0 * Math.sin(a), x2: x + (r0 + len) * Math.cos(a), y2: y + (r0 + len) * Math.sin(a), stroke: col, "stroke-width": (o.width || 7) * u, "stroke-linecap": "round" }, g);
        gsap.set(l, { opacity: 0, scale: 0.3, svgOrigin: `${x} ${y}` });
        sc.tl.to(l, { opacity: 1, scale: 1, duration: 0.18, ease: "power2.out" }, this._T(t));
        sc.tl.to(l, { opacity: 0, scale: 1.4, duration: 0.3, ease: "power1.in" }, this._T(t + 0.25));
      }
      return t + 0.55;
    }
    confetti(x, y, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, n = o.n || 40, cols = this._cols(o), g = SM.el("g", {}, this._layer(o)), spread = (o.spread || 420) * u;
      for (let i = 0; i < n; i++) {
        const w = (8 + this.rnd() * 10) * u, h = (14 + this.rnd() * 12) * u;
        const p = SM.el(this.rnd() > 0.5 ? "rect" : "circle", this.rnd() > 0.5 ? { x: -w / 2, y: -h / 2, width: w, height: h, rx: 2 * u, fill: cols[i % cols.length] } : { cx: 0, cy: 0, r: w * 0.6, fill: cols[i % cols.length] }, g);
        const dx = (this.rnd() - 0.5) * spread * 2, up = (220 + this.rnd() * 260) * u, fall = (300 + this.rnd() * 300) * u, d = 1.2 + this.rnd() * 0.8;
        gsap.set(p, { x, y, opacity: 0, rotation: this.rnd() * 360 });
        sc.tl.set(p, { opacity: 1 }, this._T(t));
        sc.tl.to(p, { keyframes: [{ x: x + dx * 0.6, y: y - up, duration: d * 0.35, ease: "power2.out" }, { x: x + dx, y: y - up + fall, duration: d * 0.65, ease: "power1.in" }] }, this._T(t));
        sc.tl.to(p, { rotation: "+=" + (360 + this.rnd() * 540), duration: d, ease: "none" }, this._T(t));
        sc.tl.to(p, { opacity: 0, duration: 0.3 }, this._T(t + d - 0.3));
      }
      return t + 2;
    }
    sparkle(x, y, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, n = o.n || 6, col = sc._col(o.color || "a3"), g = SM.el("g", {}, this._layer(o)), spread = (o.spread || 120) * u;
      for (let i = 0; i < n; i++) {
        const s = (10 + this.rnd() * 14) * u, px = x + (this.rnd() - 0.5) * spread * 2, py = y + (this.rnd() - 0.5) * spread * 2;
        const p = SM.el("path", { d: `M0,${-s} Q${s * 0.12},${-s * 0.12} ${s},0 Q${s * 0.12},${s * 0.12} 0,${s} Q${-s * 0.12},${s * 0.12} ${-s},0 Q${-s * 0.12},${-s * 0.12} 0,${-s} Z`, fill: col }, g);
        gsap.set(p, { x: px, y: py, scale: 0, transformOrigin: "50% 50%" });
        const tt = t + i * 0.07; sc.tl.to(p, { scale: 1, rotation: 90, duration: 0.25, ease: "back.out(2)" }, this._T(tt)); sc.tl.to(p, { scale: 0, rotation: 180, duration: 0.3, ease: "power1.in" }, this._T(tt + 0.35));
      }
      return t + n * 0.07 + 0.65;
    }
    puff(x, y, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, n = o.n || 5, g = SM.el("g", {}, this._layer(o));
      for (let i = 0; i < n; i++) {
        const side = i % 2 ? 1 : -1, r = (12 + this.rnd() * 12) * u;
        const c = SM.el("circle", { cx: 0, cy: 0, r, fill: sc.theme.paper, stroke: sc._col(o.color || "muted"), "stroke-width": 4 * u }, g);
        gsap.set(c, { x: x + side * 10 * u, y: y - r, scale: 0.3, opacity: 0, transformOrigin: "50% 50%" });
        sc.tl.to(c, { opacity: 1, scale: 1, x: x + side * (40 + this.rnd() * 60) * u, y: y - r - this.rnd() * 30 * u, duration: 0.35, ease: "power2.out" }, this._T(t));
        sc.tl.to(c, { opacity: 0, scale: 1.3, duration: 0.3 }, this._T(t + 0.3));
      }
      return t + 0.65;
    }
    ripple(x, y, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, n = o.n || 1, g = SM.el("g", {}, this._layer(o));
      for (let i = 0; i < n; i++) { const c = SM.el("circle", { cx: x, cy: y, r: (o.r || 40) * u, fill: "none", stroke: sc._col(o.color || "a2"), "stroke-width": 5 * u }, g); gsap.set(c, { scale: 0.2, opacity: 0, transformOrigin: "50% 50%" }); sc.tl.to(c, { scale: 1.6, opacity: 1, duration: 0.15 }, this._T(t + i * 0.15)); sc.tl.to(c, { scale: 2.4, opacity: 0, duration: 0.4, ease: "power1.out" }, this._T(t + i * 0.15 + 0.15)); }
      return t + 0.6 + n * 0.15;
    }
    emphasis(x, y, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = SM.el("g", {}, this._layer(o)), col = sc._col(o.color || "ink");
      [-40, -90, -140].forEach((a, i) => { const r = R => [x + R * Math.cos(a * SM.R), y + R * Math.sin(a * SM.R)]; const [x1, y1] = r(55 * u), [x2, y2] = r(90 * u); const l = SM.el("line", { x1, y1, x2, y2, stroke: col, "stroke-width": 6 * u, "stroke-linecap": "round" }, g); gsap.set(l, { opacity: 0 }); sc.tl.to(l, { opacity: 1, duration: 0.08 }, this._T(t + i * 0.04)); sc.tl.to(l, { opacity: 0, duration: 0.25 }, this._T(t + 0.6)); });
      return t + 0.85;
    }
    thought(x, y, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = SM.el("g", {}, this._layer(o));
      [0, 1, 2].forEach(i => { const c = SM.el("circle", { cx: x + i * 26 * u, cy: y - i * 22 * u, r: (8 + i * 4) * u, fill: sc.theme.paper, stroke: sc.theme.ink, "stroke-width": 4 * u }, g); gsap.set(c, { scale: 0, transformOrigin: "50% 50%" }); sc.tl.to(c, { scale: 1, duration: 0.2, ease: "back.out(3)" }, this._T(t + i * 0.25)); sc.tl.to(c, { scale: 0, duration: 0.2 }, this._T(t + (o.d || 1.4))); });
      return t + (o.d || 1.4) + 0.2;
    }
    sweat(x, y, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = SM.el("g", {}, this._layer(o));
      const d = SM.el("path", { d: `M0,${-14 * u} C${6 * u},${-4 * u} ${10 * u},${2 * u} ${10 * u},${6 * u} A${10 * u},${10 * u} 0 0 1 ${-10 * u},${6 * u} C${-10 * u},${2 * u} ${-6 * u},${-4 * u} 0,${-14 * u} Z`, fill: sc._col(o.color || "a2"), stroke: sc.theme.ink, "stroke-width": 3 * u }, g);
      gsap.set(d, { x, y, opacity: 0 }); sc.tl.to(d, { opacity: 1, duration: 0.1 }, this._T(t)); sc.tl.to(d, { y: y + 60 * u, opacity: 0, duration: 0.7, ease: "power1.in" }, this._T(t + 0.1));
      return t + 0.8;
    }
    zzz(x, y, t, o) {
      o = o || {}; const sc = this.sc; ["z", "Z", "Z"].forEach((ch, i) => { const tx = sc.text(ch, { x: x + i * 30 * sc.u, y: y - i * 40 * sc.u, size: 40 + i * 14, font: "hand", world: true }); tx.in(t + i * 0.4, "pop"); tx.moveBy(20 * sc.u, -40 * sc.u, t + i * 0.4, 1.4, "none"); tx.out(t + i * 0.4 + 1.2, "fade"); });
      return t + 2.4;
    }
    hearts(x, y, t, o) {
      o = o || {}; const sc = this.sc, n = o.n || 5; for (let i = 0; i < n; i++) { const h = sc.prop("heart", { x: x + (this.rnd() - 0.5) * 80 * sc.u, y, size: (36 + this.rnd() * 24) * sc.u, layer: o.layer || "front", hidden: true }); h.pop(t + i * 0.18, 0.25); h.moveBy((this.rnd() - 0.5) * 80 * sc.u, -(160 + this.rnd() * 120) * sc.u, t + i * 0.18, 1.2, "power1.out"); h.fadeOut(t + i * 0.18 + 0.9, 0.3); }
      return t + n * 0.18 + 1.2;
    }
    impact(x, y, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, r = (o.r || 90) * u, pts = [];
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? r * 0.5 : r; pts.push(`${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`); }
      const p = SM.el("path", { d: "M" + pts.join(" L") + " Z", fill: sc._col(o.color || "a3"), stroke: sc.theme.ink, "stroke-width": 5 * u, "stroke-linejoin": "round" }, this._layer(o));
      gsap.set(p, { scale: 0, svgOrigin: `${x} ${y}` }); sc.tl.to(p, { scale: 1, duration: 0.12, ease: "power3.out" }, this._T(t)); sc.tl.to(p, { scale: 0, opacity: 0, duration: 0.25 }, this._T(t + 0.3));
      return t + 0.55;
    }
    zap(x1, y1, x2, y2, t, o) {
      o = o || {}; const sc = this.sc, u = sc.u, n = 7; let d = `M${x1},${y1}`;
      for (let i = 1; i < n; i++) { const k = i / n; d += ` L${SM.lerp(x1, x2, k) + (this.rnd() - 0.5) * 50 * u},${SM.lerp(y1, y2, k) + (this.rnd() - 0.5) * 50 * u}`; } d += ` L${x2},${y2}`;
      const p = SM.el("path", { d, fill: "none", stroke: sc._col(o.color || "a3"), "stroke-width": 8 * u, "stroke-linejoin": "round", "stroke-linecap": "round" }, this._layer(o));
      gsap.set(p, { opacity: 0 }); sc.tl.to(p, { keyframes: [1, 0.2, 1, 0.4, 1, 0].map(v => ({ opacity: v, duration: 0.06, ease: "steps(1)" })) }, this._T(t));
      return t + 0.4;
    }
    smoke(x, y, t0, t1, o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = SM.el("g", {}, this._layer(o));
      for (let t = t0; t < t1; t += o.every || 0.35) { const c = SM.el("circle", { cx: 0, cy: 0, r: (16 + this.rnd() * 10) * u, fill: sc._col(o.color || "soft"), stroke: sc._col("muted"), "stroke-width": 3 * u }, g); gsap.set(c, { x, y, opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }); sc.tl.to(c, { opacity: 0.9, duration: 0.2 }, this._T(t)); sc.tl.to(c, { x: x + (this.rnd() - 0.3) * 60 * u, y: y - 220 * u, scale: 1.8, duration: 1.6, ease: "power1.out" }, this._T(t)); sc.tl.to(c, { opacity: 0, duration: 0.6 }, this._T(t + 1.0)); }
      return t1 + 1.6;
    }
    // props falling from the sky (documents, coins, emails...)
    rain(name, t0, t1, o) {
      o = o || {}; const sc = this.sc, u = sc.u, n = o.n || 18, out = [];
      for (let i = 0; i < n; i++) {
        const x = (o.x0 == null ? 0 : o.x0) + this.rnd() * ((o.x1 == null ? sc.W : o.x1) - (o.x0 || 0)), t = t0 + (t1 - t0) * (i / n), d = (o.d || 1.6) * (0.8 + this.rnd() * 0.4);
        const p = sc.prop(Array.isArray(name) ? name[i % name.length] : name, { x, y: -120 * u, size: (o.size || 80) * u * (0.8 + this.rnd() * 0.4), layer: o.layer || "back", rotation: (this.rnd() - 0.5) * 60 });
        p.moveTo(x + (this.rnd() - 0.5) * 120 * u, o.pile ? (o.pileY || sc.groundY) - this.rnd() * 30 * u : sc.H + 160 * u, t, d, o.pile ? "bounce.out" : "power1.in");
        if (o.spin !== false) sc.tl.to(p.el, { rotation: "+=" + ((this.rnd() - 0.5) * 360), duration: d, ease: "none" }, this._T(t));
        out.push(p);
      }
      return out;
    }
    // orbit things around a point
    orbit(things, cx, cy, t0, t1, o) {
      o = o || {}; const sc = this.sc, rx = (o.rx || 260) * sc.u, ry = (o.ry || 160) * sc.u, turns = o.turns == null ? 1 : o.turns, n = things.length;
      things.forEach((th, i) => {
        const a0 = (o.start || -90) + i * 360 / n, steps = Math.max(8, Math.round(24 * Math.abs(turns))), kf = [];
        const pos = a => ({ x: cx + rx * Math.cos(a * SM.R), y: cy + ry * Math.sin(a * SM.R) });
        const p0 = pos(a0); th.at(p0.x, p0.y);
        for (let k = 1; k <= steps; k++) { const p = pos(a0 + 360 * turns * k / steps); kf.push({ x: p.x, y: p.y, duration: (t1 - t0) / steps, ease: "none" }); }
        sc.tl.to(th.el, { keyframes: kf }, this._T(t0)); const pe = pos(a0 + 360 * turns); th.x = pe.x; th.y = pe.y;
      });
      return t1;
    }
    gather(things, x, y, t, o) { o = o || {}; things.forEach((th, i) => { th.moveTo(x + (o.jitter ? (this.rnd() - 0.5) * o.jitter : 0), y, t + i * (o.stagger == null ? 0.06 : o.stagger), o.d || 0.5, o.ease || "power2.in"); if (o.shrink) th.scaleTo(o.shrink, t + i * (o.stagger || 0.06), o.d || 0.5); }); return t + things.length * (o.stagger || 0.06) + (o.d || 0.5); }
    scatter(things, t, o) { o = o || {}; const sc = this.sc; things.forEach((th, i) => th.moveTo(th.x + (this.rnd() - 0.5) * (o.spread || 900) * sc.u, th.y + (this.rnd() - 0.5) * (o.spread || 900) * sc.u * 0.6, t + i * 0.03, o.d || 0.6, "power3.out")); return t + things.length * 0.03 + (o.d || 0.6); }
    // marching-ants flow along a path Thing (data moving through a pipe)
    flow(pathThing, t0, t1, o) {
      o = o || {}; const p = pathThing.pathEl || pathThing.el.querySelector("path"); if (!p) return t1;
      const sc = this.sc, dash = (o.dash || 22) * sc.u; gsap.set(p, { opacity: 1, strokeDasharray: `${dash} ${dash}`, strokeDashoffset: 0 });
      sc.tl.to(p, { strokeDashoffset: -dash * 2 * Math.round((t1 - t0) * (o.speed || 3)), duration: t1 - t0, ease: "none" }, this._T(t0));
      return t1;
    }
    speedLines(t0, t1, o) {
      o = o || {}; const sc = this.sc, u = sc.u, g = SM.el("g", {}, sc.layer("ui")), dir = o.dir === "right" ? 1 : -1;
      for (let t = t0; t < t1; t += 0.08) { const y = this.rnd() * sc.H, len = (120 + this.rnd() * 260) * u; const l = SM.el("line", { x1: 0, y1: y, x2: len, y2: y, stroke: sc._col(o.color || "muted"), "stroke-width": (3 + this.rnd() * 4) * u, "stroke-linecap": "round", opacity: 0.7 }, g); gsap.set(l, { x: dir < 0 ? sc.W + 50 : -len - 50, opacity: 0 }); sc.tl.set(l, { opacity: 0.7 }, this._T(t)); sc.tl.to(l, { x: dir < 0 ? -len - 50 : sc.W + 50, duration: 0.35, ease: "none" }, this._T(t)); }
      return t1 + 0.35;
    }
    flash(t, o) { o = o || {}; const sc = this.sc, d = SM.div("sm-flash", sc.top, { position: "absolute", inset: "0", background: sc._col(o.color || "#FFFFFF"), opacity: 0 }); sc.tl.to(d, { keyframes: [{ opacity: o.opacity || 0.85, duration: 0.05 }, { opacity: 0, duration: o.d || 0.35 }] }, this._T(t)); return t + 0.4; }
    explode(x, y, t, o) { this.impact(x, y, t, o); this.burst(x, y, t, Object.assign({ n: 14, r: 80, len: 70 }, o)); this.puff(x, y + 40 * this.sc.u, t + 0.1, { n: 8 }); return t + 0.7; }
    stars(t0, t1, o) { o = o || {}; const sc = this.sc; for (let i = 0; i < (o.n || 30); i++) { const s = sc.prop("sparkle", { x: this.rnd() * sc.W, y: this.rnd() * sc.H * (o.top || 0.6), size: (10 + this.rnd() * 16) * sc.u, layer: "world", accent: o.color || "ink", hidden: true }); s.fadeIn(t0 + this.rnd() * 0.8, 0.4); const kf = []; for (let tt = 0; tt < t1 - t0; tt += 0.8) kf.push({ opacity: 0.3 + this.rnd() * 0.7, duration: 0.8 }); sc.tl.to(s.el, { keyframes: kf }, sc.T(t0 + 1)); } return t1; }
  }
  Object.defineProperty(SM.Scene.prototype, "fx", { get() { if (!this._fx) this._fx = new FX(this); return this._fx; } });

  // =================================================================== camera
  class Camera {
    constructor(sc) { this.sc = sc; }
    _apply(x, y, k, t, d, ease) {
      const sc = this.sc, tx = sc.W / 2 - k * x, ty = sc.H / 2 - k * y;
      if (d) sc.tl.to(sc.cam, { x: tx, y: ty, scale: k, duration: d, ease: ease || "power2.inOut" }, sc.T(t)); else sc.tl.set(sc.cam, { x: tx, y: ty, scale: k }, sc.T(t));
      sc._cam = { fx: x, fy: y, k }; return t + (d || 0);
    }
    get state() { const c = this.sc._cam; return { fx: c.fx == null ? this.sc.cx : c.fx, fy: c.fy == null ? this.sc.cy : c.fy, k: c.k || 1 }; }
    // centre (x, y) on screen at zoom k
    focus(x, y, k, t, d, ease) { return this._apply(x, y, k == null ? this.state.k : k, t, d == null ? 0.8 : d, ease); }
    zoom(k, t, d, ease) { const s = this.state; return this._apply(s.fx, s.fy, k, t, d == null ? 0.8 : d, ease); }
    pan(x, y, t, d, ease) { const s = this.state; return this._apply(x == null ? s.fx : x, y == null ? s.fy : y, s.k, t, d == null ? 0.8 : d, ease); }
    panBy(dx, dy, t, d, ease) { const s = this.state; return this.pan(s.fx + (dx || 0), s.fy + (dy || 0), t, d, ease); }
    reset(t, d) { return this._apply(this.sc.cx, this.sc.cy, 1, t, d == null ? 0.8 : d); }
    set(x, y, k) { const s = this.sc; gsap.set(s.cam, { x: s.W / 2 - k * x, y: s.H / 2 - k * y, scale: k }); s._cam = { fx: x, fy: y, k }; return this; }
    // slow continuous push-in (documentary feel)
    push(t, d, k) { return this.zoom(k || this.state.k * 1.08, t, d || 3, "sine.inOut"); }
    pull(t, d, k) { return this.zoom(k || this.state.k / 1.12, t, d || 2, "sine.inOut"); }
    shake(t, d, amp) {
      const sc = this.sc, s = this.state, tx = sc.W / 2 - s.k * s.fx, ty = sc.H / 2 - s.k * s.fy, rnd = SM.rng(SM.hash(sc.id) + Math.round(t * 100));
      d = d || 0.45; amp = (amp || 14) * sc.u; const n = Math.round(d / 0.05), kf = [];
      for (let i = 0; i < n; i++) { const f = 1 - i / n; kf.push({ x: tx + (rnd() - 0.5) * 2 * amp * f, y: ty + (rnd() - 0.5) * 2 * amp * f, duration: d / n, ease: "none" }); }
      kf.push({ x: tx, y: ty, duration: 0.04 });
      sc.tl.to(sc.cam, { keyframes: kf }, sc.T(t)); return t + d;
    }
    // keep a figure in frame (samples its recorded path)
    follow(fig, t0, t1, o) {
      o = o || {}; const s = this.state, k = o.k || s.k, step = o.step || 0.25, y = o.y == null ? s.fy : o.y, lead = (o.lead || 0) * this.sc.u;
      const kf = []; let last = t0;
      for (let t = t0 + step; t <= t1 + 1e-6; t += step) { const fx = fig.xAt(t) + lead * fig.facing; kf.push({ x: this.sc.W / 2 - k * fx, y: this.sc.H / 2 - k * y, scale: k, duration: t - last, ease: "none" }); last = t; }
      if (kf.length) this.sc.tl.to(this.sc.cam, { keyframes: kf }, this.sc.T(t0));
      this.sc._cam = { fx: fig.xAt(t1) + lead * fig.facing, fy: y, k }; return t1;
    }
    // fast whip pan with motion blur, landing on (x,y)
    whip(x, y, t, d) {
      const sc = this.sc; d = d || 0.45;
      sc.tl.to(sc.cam, { filter: "blur(10px)", duration: d * 0.4, ease: "power2.in" }, sc.T(t));
      this.focus(x, y, this.state.k, t, d, "expo.inOut");
      sc.tl.to(sc.cam, { filter: "blur(0px)", duration: d * 0.5, ease: "power2.out" }, sc.T(t + d * 0.5));
      return t + d;
    }
    // dutch tilt
    tilt(deg, t, d) { const sc = this.sc; sc.tl.to(sc.stage, { rotation: deg, duration: d || 0.6, ease: "power2.inOut" }, sc.T(t)); return t + (d || 0.6); }
  }
  Object.defineProperty(SM.Scene.prototype, "camera", { get() { if (!this._camera) this._camera = new Camera(this); return this._camera; } });

  // =================================================================== transitions
  // in-types:  fade | wipe-left|wipe-right|wipe-up|wipe-down | iris | ink | slide-left|slide-right|slide-up | zoom | blur | flash | bars | push
  // Use the same type for scene N's exit and scene N+1's enter for a seamless hand-off.
  function cover(sc, color) { return SM.div("sm-cover", sc.top, { position: "absolute", inset: "0", background: color, opacity: 1 }); }
  function run(sc, type, dir, o) {
    o = o || {}; const d = o.d || 0.6, isIn = dir === "in", t = isIn ? (o.t || 0) : (o.t == null ? sc.dur - d : o.t), T = sc.T(t), tl = sc.tl;
    const col = sc._col(o.color || (type === "flash" ? "#FFFFFF" : "ink")), W = sc.W, H = sc.H, st = sc.stage;
    const [kind, side] = type.split("-");
    switch (kind) {
      case "fade": { const c = cover(sc, col); if (isIn) { tl.fromTo(c, { opacity: 1 }, { opacity: 0, duration: d, ease: "power1.inOut", immediateRender: true }, T); } else { gsap.set(c, { opacity: 0 }); tl.to(c, { opacity: 1, duration: d, ease: "power1.inOut" }, T); } break; }
      case "flash": { const c = cover(sc, col); if (isIn) tl.fromTo(c, { opacity: 1 }, { opacity: 0, duration: d, ease: "power2.out", immediateRender: true }, T); else { gsap.set(c, { opacity: 0 }); tl.to(c, { opacity: 1, duration: d, ease: "power3.in" }, T); } break; }
      case "wipe": {
        const c = cover(sc, col), s = side || "left", ax = s === "left" || s === "right" ? "x" : "y", sign = s === "left" || s === "up" ? -1 : 1, full = ax === "x" ? W : H;
        if (isIn) { gsap.set(c, { [ax]: 0 }); tl.to(c, { [ax]: sign * full, duration: d, ease: "power3.inOut" }, T); }
        else { gsap.set(c, { [ax]: -sign * full }); tl.to(c, { [ax]: 0, duration: d, ease: "power3.inOut" }, T); }
        break;
      }
      case "bars": {
        const n = 5, cols = [col, sc.theme.accents[0], sc.theme.accents[1], sc.theme.accents[2], col];
        for (let i = 0; i < n; i++) { const b = SM.div("sm-bar", sc.top, { position: "absolute", left: "0", top: (i * H / n) + "px", width: W + "px", height: Math.ceil(H / n) + 1 + "px", background: cols[i] });
          if (isIn) { gsap.set(b, { x: 0 }); tl.to(b, { x: W, duration: d * 0.7, ease: "power3.in" }, T + i * d * 0.06); } else { gsap.set(b, { x: -W }); tl.to(b, { x: 0, duration: d * 0.7, ease: "power3.out" }, T + i * d * 0.06); } }
        break;
      }
      case "iris": {
        const x = o.x == null ? sc.cx : o.x, y = o.y == null ? sc.cy : o.y, big = Math.hypot(W, H);
        if (isIn) { gsap.set(sc.section, { clipPath: `circle(0px at ${x}px ${y}px)` }); tl.to(sc.section, { clipPath: `circle(${big}px at ${x}px ${y}px)`, duration: d, ease: "power2.in" }, T); tl.set(sc.section, { clipPath: "none" }, T + d); }
        else { tl.fromTo(sc.section, { clipPath: `circle(${big}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)`, duration: d, ease: "power2.out", immediateRender: false }, T); }
        break;
      }
      case "ink": {
        const x = o.x == null ? sc.cx : o.x, y = o.y == null ? sc.cy : o.y, R = Math.hypot(W, H) * 1.05;
        const blob = SM.div("sm-ink", sc.top, { position: "absolute", left: (x - R) + "px", top: (y - R) + "px", width: 2 * R + "px", height: 2 * R + "px", borderRadius: "50%", background: sc._col(o.color || "a2") });
        if (isIn) { gsap.set(blob, { scale: 1 }); tl.to(blob, { scale: 0, duration: d, ease: "power3.in" }, T); } else { gsap.set(blob, { scale: 0 }); tl.to(blob, { scale: 1, duration: d, ease: "power3.out" }, T); }
        break;
      }
      case "slide": case "push": {
        const s = side || "left", ax = s === "left" || s === "right" ? "x" : "y", sign = s === "left" || s === "up" ? -1 : 1, full = ax === "x" ? W : H;
        if (isIn) { gsap.set(st, { [ax]: -sign * full }); tl.to(st, { [ax]: 0, duration: d, ease: "power3.out" }, T); } else tl.to(st, { [ax]: sign * full, duration: d, ease: "power3.in" }, T);
        break;
      }
      case "zoom": {
        if (isIn) { gsap.set(st, { scale: 0.75, opacity: 0 }); tl.to(st, { scale: 1, opacity: 1, duration: d, ease: "power3.out" }, T); } else tl.to(st, { scale: 1.35, opacity: 0, duration: d, ease: "power3.in" }, T);
        break;
      }
      case "blur": {
        if (isIn) { gsap.set(st, { filter: "blur(24px)", opacity: 0 }); tl.to(st, { filter: "blur(0px)", opacity: 1, duration: d, ease: "power2.out" }, T); tl.set(st, { filter: "none" }, T + d); } else tl.to(st, { filter: "blur(24px)", opacity: 0, duration: d, ease: "power2.in" }, T);
        break;
      }
      default: console.warn("Stickman Kino: unknown transition", type);
    }
    return isIn ? t + d : t;
  }
  SM.Scene.prototype.enter = function (type, o) { return run(this, type || "fade", "in", o); };
  SM.Scene.prototype.exit = function (type, o) { return run(this, type || "fade", "out", o); };
  SM.transitions = ["fade", "flash", "wipe-left", "wipe-right", "wipe-up", "wipe-down", "bars", "iris", "ink", "slide-left", "slide-right", "slide-up", "slide-down", "zoom", "blur"];
})(typeof window !== "undefined" ? window : globalThis);
