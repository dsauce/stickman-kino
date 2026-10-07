/*!
 * Stickman Kino - engine core
 * Film + scene builder, themes, SVG helpers, the animatable `Thing` wrapper, VO cue timing.
 * MIT License. https://github.com/dsauce/stickman-kino
 *
 * Contract (HyperFrames): one paused GSAP timeline, built synchronously, registered on
 * window.__timelines[compositionId]. No clocks, no randomness (seeded RNG only), no network.
 */
(function (root) {
  "use strict";
  const SM = (root.SM = root.SM || {});
  SM.version = "1.0.0";
  const NS = (SM.NS = "http://www.w3.org/2000/svg");
  const R = (SM.R = Math.PI / 180);

  // ------------------------------------------------------------------ themes
  // accents: [a1, a2, a3] - semantic slots ("danger/old way", "hero/solution", "evidence/reward").
  SM.themes = {
    light:      { bg: "#FFFFFF", ink: "#111111", paper: "#FFFFFF", muted: "#6E6E6E", soft: "#EFEFEF", accents: ["#E63946", "#1D7FE0", "#F2B400"], font: "Inter", display: "Inter", hand: "Caveat", decor: null, line: 1 },
    dark:       { bg: "#0E0E11", ink: "#F4F4F5", paper: "#0E0E11", muted: "#9C9CA6", soft: "#232329", accents: ["#FF4D6D", "#3DA5FF", "#FFC531"], font: "Inter", display: "Inter", hand: "Caveat", decor: null, line: 1 },
    paper:      { bg: "#FBF6EA", ink: "#2A2723", paper: "#FBF6EA", muted: "#776F60", soft: "#EFE7D4", accents: ["#D1495B", "#2E86AB", "#E9A23B"], font: "Caveat", display: "Permanent Marker", hand: "Caveat", decor: "paper", line: 1 },
    chalkboard: { bg: "#21352A", ink: "#F2F1E8", paper: "#21352A", muted: "#AFC2B7", soft: "#2C4537", accents: ["#FF8E8E", "#8FD3FF", "#FFE27A"], font: "Caveat", display: "Caveat", hand: "Caveat", decor: "chalk", line: 1 },
    blueprint:  { bg: "#0F4C81", ink: "#EAF4FF", paper: "#0F4C81", muted: "#A9C7E4", soft: "#195A92", accents: ["#FF6B6B", "#06D6A0", "#FFD166"], font: "Inter", display: "Inter", hand: "Caveat", decor: "grid", line: 1 },
    neon:       { bg: "#07070C", ink: "#E9F1FF", paper: "#07070C", muted: "#8D93AD", soft: "#151526", accents: ["#FF2E88", "#22D3EE", "#FACC15"], font: "Inter", display: "Inter", hand: "Caveat", decor: "glow", line: 1 },
    studio:     { bg: "#FFFFFF", ink: "#111111", paper: "#FFFFFF", muted: "#6E6E6E", soft: "#F1F5F9", accents: ["#FF5A5F", "#00B8D9", "#2F6BFF"], font: "Inter", display: "Inter", hand: "Caveat", decor: "studio", line: 1 },
    sunset:     { bg: "#FFF1E6", ink: "#3D1F2B", paper: "#FFF1E6", muted: "#8A6658", soft: "#FCE1CF", accents: ["#E4572E", "#6A4C93", "#F3A712"], font: "Inter", display: "Inter", hand: "Caveat", decor: "sunset", line: 1 }
  };
  SM.resolveTheme = function (t) {
    if (!t) t = "light";
    if (typeof t === "string") return Object.assign({ name: t }, SM.themes[t] || SM.themes.light);
    const base = SM.themes[t.extends || "light"] || SM.themes.light;
    return Object.assign({ name: "custom" }, base, t, { accents: t.accents || base.accents });
  };

  // ---------------------------------------------------------- deterministic RNG
  SM.rng = function (seed) {
    let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  };
  SM.hash = function (str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); };

  // -------------------------------------------------------------- DOM helpers
  SM.el = function (tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  SM.div = function (cls, parent, style) {
    const d = document.createElement("div");
    if (cls) { d.className = cls; if (cls.indexOf("sm-") === 0) d.setAttribute("data-layout-allow-overflow", ""); }
    if (style) Object.assign(d.style, style);
    if (parent) parent.appendChild(d);
    return d;
  };
  SM.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  SM.lerp = (a, b, t) => a + (b - a) * t;

  // ------------------------------------------------------------------ Thing
  // Wraps any SVG/HTML node positioned with gsap x/y. Every method takes LOCAL scene time
  // and returns the local time at which it finishes, so calls can be chained.
  class Thing {
    constructor(sc, node, opts) {
      opts = opts || {};
      this.sc = sc; this.el = node; this.node = node;
      this.x = opts.x || 0; this.y = opts.y || 0; this.s = opts.scale == null ? 1 : opts.scale; this.r = opts.rotation || 0;
      this.origin = opts.origin || "50% 50%";
      gsap.set(node, { x: this.x, y: this.y, scale: this.s, rotation: this.r, transformOrigin: this.origin });
      if (opts.hidden) gsap.set(node, { opacity: 0 });
      if (opts.opacity != null) gsap.set(node, { opacity: opts.opacity });
    }
    _g(t) { return this.sc.T(t); }
    get tl() { return this.sc.tl; }
    at(x, y) { this.x = x; this.y = y; gsap.set(this.el, { x, y }); return this; }
    hide(t) { if (t == null) gsap.set(this.el, { opacity: 0 }); else this.tl.set(this.el, { opacity: 0 }, this._g(t)); return this; }
    show(t) { if (t == null) gsap.set(this.el, { opacity: 1 }); else this.tl.set(this.el, { opacity: 1 }, this._g(t)); return this; }
    pop(t, d, o) {
      d = d || 0.4; o = o || {};
      gsap.set(this.el, { scale: 0, opacity: 0, transformOrigin: o.origin || this.origin });
      this.tl.to(this.el, { scale: this.s, opacity: 1, duration: d, ease: o.ease || "back.out(2)" }, this._g(t));
      if (o.sfx !== false && this.sc.autoSfx) this.sc.sfx("pop", t);
      return t + d;
    }
    popOut(t, d) { d = d || 0.3; this.tl.to(this.el, { scale: 0, opacity: 0, duration: d, ease: "back.in(2)" }, this._g(t)); return t + d; }
    fadeIn(t, d, from) {
      d = d || 0.4; gsap.set(this.el, { opacity: 0 });
      const v = { opacity: 1, duration: d, ease: "power2.out" };
      if (from) { gsap.set(this.el, { x: this.x + (from.x || 0), y: this.y + (from.y || 0) }); v.x = this.x; v.y = this.y; v.ease = "power3.out"; }
      this.tl.to(this.el, v, this._g(t)); return t + d;
    }
    fadeOut(t, d) { d = d || 0.35; this.tl.to(this.el, { opacity: 0, duration: d, ease: "power1.in" }, this._g(t)); return t + d; }
    rise(t, d, dist) { return this.fadeIn(t, d || 0.5, { y: dist == null ? 40 : dist }); }
    dropIn(t, d, dist) {
      d = d || 0.55; gsap.set(this.el, { y: this.y - (dist || 400), opacity: 0 });
      this.tl.to(this.el, { opacity: 1, duration: 0.05 }, this._g(t));
      this.tl.to(this.el, { y: this.y, duration: d, ease: "bounce.out" }, this._g(t)); return t + d;
    }
    slideIn(t, d, dir) {
      d = d || 0.6; const W = this.sc.W + 400, dx = { left: -W, right: W }[dir || "left"] || 0, dy = { up: -this.sc.H - 400, down: this.sc.H + 400 }[dir] || 0;
      gsap.set(this.el, { x: this.x + dx, y: this.y + dy });
      this.tl.to(this.el, { x: this.x, y: this.y, duration: d, ease: "power3.out" }, this._g(t)); return t + d;
    }
    slideOut(t, d, dir) {
      d = d || 0.5; const W = this.sc.W + 400, dx = { left: -W, right: W }[dir || "left"] || 0, dy = { up: -this.sc.H - 400, down: this.sc.H + 400 }[dir] || 0;
      this.tl.to(this.el, { x: this.x + dx, y: this.y + dy, duration: d, ease: "power2.in" }, this._g(t)); return t + d;
    }
    moveTo(x, y, t, d, ease) {
      d = d == null ? 0.6 : d; if (x == null) x = this.x; if (y == null) y = this.y;
      this.tl.to(this.el, { x, y, duration: d, ease: ease || "power2.inOut" }, this._g(t)); this.x = x; this.y = y; return t + d;
    }
    moveBy(dx, dy, t, d, ease) { return this.moveTo(this.x + (dx || 0), this.y + (dy || 0), t, d, ease); }
    arcTo(x, y, t, d, h, o) {
      d = d || 0.8; h = h == null ? 160 : h; o = o || {};
      const x0 = this.x, y0 = this.y, n = 12, kf = [];
      for (let i = 1; i <= n; i++) { const u = i / n; kf.push({ x: SM.lerp(x0, x, u), y: SM.lerp(y0, y, u) - 4 * h * u * (1 - u), duration: d / n, ease: "none" }); }
      this.tl.to(this.el, { keyframes: kf }, this._g(t));
      if (o.spin) this.tl.to(this.el, { rotation: this.r + o.spin, duration: d, ease: "none" }, this._g(t));
      this.x = x; this.y = y; return t + d;
    }
    scaleTo(s, t, d, ease) { d = d == null ? 0.4 : d; this.tl.to(this.el, { scale: s, duration: d, ease: ease || "power2.inOut" }, this._g(t)); this.s = s; return t + d; }
    rotateTo(r, t, d, ease) { d = d == null ? 0.4 : d; this.tl.to(this.el, { rotation: r, duration: d, ease: ease || "power2.inOut" }, this._g(t)); this.r = r; return t + d; }
    spin(t, d, turns) { d = d || 1; this.r += 360 * (turns == null ? 1 : turns); this.tl.to(this.el, { rotation: this.r, duration: d, ease: "power1.inOut" }, this._g(t)); return t + d; }
    pulse(t, k, d) { d = d || 0.36; this.tl.to(this.el, { keyframes: [{ scale: this.s * (k || 1.18), duration: d / 2, ease: "power2.out" }, { scale: this.s, duration: d / 2, ease: "power2.in" }] }, this._g(t)); return t + d; }
    shake(t, d, amp) {
      d = d || 0.4; amp = amp || 8; const n = Math.max(4, Math.round(d / 0.05)), kf = [];
      for (let i = 0; i < n; i++) kf.push({ x: this.x + (i % 2 ? -1 : 1) * amp * (1 - i / n), duration: d / n, ease: "none" });
      kf.push({ x: this.x, duration: 0.02 });
      this.tl.to(this.el, { keyframes: kf }, this._g(t)); return t + d;
    }
    wobble(t, d, deg) {
      d = d || 0.6; deg = deg || 8; const kf = [deg, -deg * 0.7, deg * 0.45, -deg * 0.2, 0].map(r => ({ rotation: this.r + r, duration: d / 5, ease: "sine.inOut" }));
      this.tl.to(this.el, { keyframes: kf }, this._g(t)); return t + d;
    }
    bob(t0, t1, amp, period) {
      amp = amp || 10; period = period || 1.6; const n = Math.max(1, Math.floor((t1 - t0) / (period / 2))), kf = [];
      for (let i = 0; i < n; i++) kf.push({ y: this.y + (i % 2 ? amp : -amp) * 0.5, duration: period / 2, ease: "sine.inOut" });
      kf.push({ y: this.y, duration: 0.2 });
      this.tl.to(this.el, { keyframes: kf }, this._g(t0)); return t1;
    }
    tint(color, t, d, which) {
      d = d == null ? 0.3 : d; const nodes = this.el.querySelectorAll(which === "stroke" ? "[stroke]" : "[data-tint]");
      const list = nodes.length ? Array.from(nodes) : [this.el];
      list.forEach(n => { const v = {}; v[which === "stroke" ? "stroke" : "fill"] = color; v.duration = d; this.tl.to(n, v, this._g(t)); });
      return t + d;
    }
    glow(t, d, color) {
      d = d || 0.6; color = color || this.sc.theme.accents[2];
      this.tl.fromTo(this.el, { filter: `drop-shadow(0 0 0px ${color})` }, { filter: `drop-shadow(0 0 18px ${color})`, duration: d / 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, this._g(t)); return t + d;
    }
    // stroke-draw every [data-draw] path (or the node itself if it is a path/line)
    draw(t, d, ease) {
      d = d || 0.8; let nodes = Array.from(this.el.querySelectorAll ? this.el.querySelectorAll("[data-draw]") : []);
      if (!nodes.length && this.el.getTotalLength) nodes = [this.el];
      nodes.forEach(n => SM.prepDraw(n));
      this.tl.set(nodes, { opacity: 1 }, this._g(t));
      this.tl.to(nodes, { strokeDashoffset: 0, duration: d, ease: ease || "power1.inOut" }, this._g(t));
      gsap.set(this.el, { opacity: 1 });
      return t + d;
    }
    undraw(t, d) {
      d = d || 0.5; const nodes = Array.from(this.el.querySelectorAll("[data-draw]")); if (!nodes.length && this.el.getTotalLength) nodes.push(this.el);
      nodes.forEach(n => { const len = n.__smLen || SM.prepDraw(n); this.tl.to(n, { strokeDashoffset: -len, duration: d, ease: "power1.in" }, this._g(t)); });
      return t + d;
    }
    front() { this.el.parentNode && this.el.parentNode.appendChild(this.el); return this; }
  }
  SM.Thing = Thing;
  SM.prepDraw = function (n) {
    if (n.__smLen) return n.__smLen;
    let len = 0;
    try { len = n.getTotalLength(); } catch (e) { len = 1000; }
    if (!len || !isFinite(len)) len = 1000;
    n.__smLen = len + 2;
    gsap.set(n, { strokeDasharray: n.__smLen + " " + n.__smLen, strokeDashoffset: n.__smLen, opacity: 0 });
    return n.__smLen;
  };

  // -------------------------------------------------------------------- film
  class Film {
    constructor(opts) {
      opts = opts || {};
      const meta = root.SM_FILM || {};
      this.root = opts.root || document.querySelector("[data-composition-id]");
      if (!this.root) throw new Error("Stickman Kino: no [data-composition-id] root found");
      this.id = this.root.getAttribute("data-composition-id");
      this.W = +this.root.getAttribute("data-width") || 1920;
      this.H = +this.root.getAttribute("data-height") || 1080;
      this.duration = +this.root.getAttribute("data-duration") || 10;
      this.meta = meta;
      this.theme = SM.resolveTheme(opts.theme || meta.theme);
      this.unit = Math.min(this.W, this.H) / 1080; // 1 at 1080p, scales line weights & sizes
      this.autoSfx = opts.autoSfx === true;
      this.tl = gsap.timeline({ paused: true });
      this.tl.set({}, {}, this.duration);
      this.scenes = {};
      this.root.classList.add("sm-root");
      this.root.style.background = this.theme.bg;
      this.root.style.setProperty("--sm-bg", this.theme.bg);
      this.root.style.setProperty("--sm-ink", this.theme.ink);
      this.root.style.setProperty("--sm-paper", this.theme.paper);
      this.root.style.setProperty("--sm-muted", this.theme.muted);
      this.root.style.setProperty("--sm-a1", this.theme.accents[0]);
      this.root.style.setProperty("--sm-a2", this.theme.accents[1]);
      this.root.style.setProperty("--sm-a3", this.theme.accents[2]);
      this.root.style.setProperty("--sm-font", `"${this.theme.font}", "Inter", system-ui, sans-serif`);
      this.root.style.setProperty("--sm-display", `"${this.theme.display}", "Inter", system-ui, sans-serif`);
      this.root.style.setProperty("--sm-hand", `"${this.theme.hand}", "Caveat", cursive`);
      root.__timelines = root.__timelines || {};
      root.__timelines[this.id] = this.tl;
      SM.current = this;
    }
    scene(id, fn, opts) {
      const sc = new Scene(this, id, opts || {});
      this.scenes[id] = sc;
      fn(sc);
      // clip-level intro / outro presets declared in film.json (skipped if the scene already called sc.intro/outro)
      if (!sc._titled && sc.intro && sc.clip.intro) sc.intro(sc.clip.intro.style || "logo", Object.assign({}, sc.clip.intro));
      if (!sc._titled && sc.outro && sc.clip.outro) sc.outro(sc.clip.outro.style || "cta", Object.assign({}, sc.clip.outro));
      // film-level auto captions: "captions": true | "box" | "pop" | { style, words, y, size }
      const cap = this.meta.captions;
      if (cap && sc.vo.text && sc.captions && !(opts && opts.captions === false) && !sc._captioned) {
        const co = typeof cap === "object" ? cap : { style: cap === "pop" ? "pop" : "box" };
        sc.captions(co);
      }
      return sc;
    }
  }
  // build scenes for clips that only declare an intro/outro in film.json (called by the composed index.html)
  Film.prototype.finish = function () {
    (this.meta.clips || []).forEach(c => { if (!this.scenes[c.id] && (c.intro || c.outro) && document.getElementById(c.id)) this.scene(c.id, () => {}); });
    return this;
  };
  SM.Film = Film;
  SM.film = opts => new Film(opts);
  SM.scene = (id, fn, opts) => (SM.current || SM.film()).scene(id, fn, opts);

  // ------------------------------------------------------------------- scene
  class Scene {
    constructor(film, id, opts) {
      this.film = film; this.id = id;
      const sec = document.getElementById(id);
      if (!sec) throw new Error("Stickman Kino: scene section #" + id + " not found");
      this.section = sec;
      this.t0 = parseFloat(sec.getAttribute("data-start")) || 0;
      this.dur = parseFloat(sec.getAttribute("data-duration")) || film.duration;
      this.W = film.W; this.H = film.H; this.u = film.unit;
      this.theme = opts.theme ? SM.resolveTheme(opts.theme) : film.theme;
      this.tl = film.tl;
      this.autoSfx = film.autoSfx;
      this.rand = SM.rng(SM.hash(id) + 17);
      this.cx = this.W / 2; this.cy = this.H / 2;
      this.groundY = Math.round(this.H * (this.H > this.W ? 0.74 : 0.8));
      sec.classList.add("sm-scene");
      sec.style.background = this.theme.bg;
      const mkSvg = (cls, parent) => {
        const s = SM.el("svg", { class: "sm-layer " + cls, viewBox: `0 0 ${this.W} ${this.H}`, width: this.W, height: this.H, overflow: "visible", "data-layout-allow-overflow": "" }, parent);
        return s;
      };
      this.stage = SM.div("sm-stage", sec, { width: this.W + "px", height: this.H + "px" });
      this.stage.setAttribute("data-layout-allow-overflow", "");
      gsap.set(this.stage, { transformOrigin: "50% 50%" });
      this.decor = mkSvg("sm-decor", this.stage);
      this.cam = SM.div("sm-cam", this.stage, { width: this.W + "px", height: this.H + "px" });
      this.cam.setAttribute("data-layout-allow-overflow", "");
      gsap.set(this.cam, { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });
      this.world = mkSvg("sm-world", this.cam);   // camera-space backdrop (env)
      this.back = mkSvg("sm-back", this.cam);     // props behind characters
      this.mid = SM.div("sm-mid", this.cam);       // characters (HTML rigs)
      this.front = mkSvg("sm-front", this.cam);   // props in front of characters
      this.uiSvg = mkSvg("sm-uisvg", this.stage);        // screen-space vector UI (not affected by camera)
      this.ui = SM.div("sm-ui", this.stage, { width: this.W + "px", height: this.H + "px" }); // screen-space text
      this.top = SM.div("sm-top", sec, { width: this.W + "px", height: this.H + "px" }); // transitions
      this.ui.setAttribute("data-layout-allow-overflow", "");
      this._cam = { x: 0, y: 0, k: 1 };
      this.figures = [];
      this._sfx = [];
      // voice-over cue data (from film.js, generated by `stickman audio`)
      const clip = (film.meta.clips || []).find(c => c.id === id) || {};
      this.clip = clip;
      this.vo = new VoCues(clip);
      if (SM.decorate) SM.decorate(this);
    }
    T(t) { return this.t0 + (t || 0); }
    // resolve a colour token: a1 | a2 | a3 | ink | muted | soft | paper | bg | any CSS colour
    col(c) { const th = this.theme; return !c ? th.ink : ({ a1: th.accents[0], a2: th.accents[1], a3: th.accents[2], ink: th.ink, muted: th.muted, soft: th.soft, paper: th.paper, bg: th.bg })[c] || c; }
    topSvg() { if (!this._topSvg) { this._topSvg = SM.el("svg", { class: "sm-layer sm-topsvg", viewBox: `0 0 ${this.W} ${this.H}`, width: this.W, height: this.H, overflow: "visible" }, this.section); } return this._topSvg; }
    to(target, vars, t) { this.tl.to(target, vars, this.T(t)); return this; }
    set(target, vars, t) { if (t == null) gsap.set(target, vars); else this.tl.set(target, vars, this.T(t)); return this; }
    fromTo(target, from, to, t) { this.tl.fromTo(target, from, to, this.T(t)); return this; }
    layer(name) { return { back: this.back, front: this.front, world: this.world, ui: this.uiSvg, decor: this.decor, top: this.topSvg() }[name || "back"] || this.back; }
    thing(node, opts) { return new Thing(this, node, opts); }
    group(opts) { opts = opts || {}; const g = SM.el("g", {}, this.layer(opts.layer)); return new Thing(this, g, opts); }
    // SVG primitives (scene coordinates). Returns Thing.
    path(d, o) {
      o = o || {}; const g = SM.el("g", {}, this.layer(o.layer));
      const p = SM.el("path", { d, fill: o.fill ? this.col(o.fill) : "none", stroke: this.col(o.color || "ink"), "stroke-width": (o.width || 6) * this.u, "stroke-linecap": "round", "stroke-linejoin": "round", "data-draw": o.draw === false ? null : "" , "stroke-dasharray": o.dash ? o.dash.join(" ") : null }, g);
      const th = new Thing(this, g, { hidden: o.hidden });
      th.pathEl = p;
      if (o.draw !== false && !o.visible) { SM.prepDraw(p); }
      return th;
    }
    line(x1, y1, x2, y2, o) { return this.path(`M${x1},${y1} L${x2},${y2}`, o); }
    curve(x1, y1, x2, y2, o) {
      o = o || {}; const bend = o.bend == null ? -0.3 : o.bend, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
      return this.path(`M${x1},${y1} Q${mx - dy * bend},${my + dx * bend} ${x2},${y2}`, o);
    }
    arrow(x1, y1, x2, y2, o) {
      o = o || {}; const bend = o.bend || 0, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
      const cx = mx - dy * bend, cy = my + dx * bend;
      const g = SM.el("g", {}, this.layer(o.layer)), col = this.col(o.color || "ink"), w = (o.width || 6) * this.u;
      SM.el("path", { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "data-draw": "", "stroke-dasharray": o.dash ? o.dash.join(" ") : null }, g);
      const a = Math.atan2(y2 - cy, x2 - cx), hl = (o.head || 22) * this.u;
      SM.el("path", { d: `M${x2 - hl * Math.cos(a - 0.45)},${y2 - hl * Math.sin(a - 0.45)} L${x2},${y2} L${x2 - hl * Math.cos(a + 0.45)},${y2 - hl * Math.sin(a + 0.45)}`, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", "data-draw": "" }, g);
      g.querySelectorAll("[data-draw]").forEach(n => SM.prepDraw(n));
      return new Thing(this, g, {});
    }
    rect(x, y, w, h, o) {
      o = o || {}; const g = SM.el("g", {}, this.layer(o.layer));
      SM.el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: o.r == null ? 12 : o.r, fill: this.col(o.fill || "paper"), stroke: o.stroke === false ? "none" : this.col(o.color || "ink"), "stroke-width": (o.width || 6) * this.u, "data-tint": "" }, g);
      return new Thing(this, g, Object.assign({ x, y }, o));
    }
    circle(x, y, r, o) {
      o = o || {}; const g = SM.el("g", {}, this.layer(o.layer));
      SM.el("circle", { cx: 0, cy: 0, r, fill: this.col(o.fill || "paper"), stroke: o.stroke === false ? "none" : this.col(o.color || "ink"), "stroke-width": (o.width || 6) * this.u, "data-tint": "" }, g);
      return new Thing(this, g, Object.assign({ x, y }, o));
    }
    // place an image (png/jpg/svg in the film folder) - centred on (x, y)
    image(src, o) {
      o = o || {}; const g = SM.el("g", {}, this.layer(o.layer || "back")), w = o.w || 400 * this.u, h = o.h || w;
      SM.el("image", { href: src, x: -w / 2, y: -h / 2, width: w, height: h, preserveAspectRatio: o.fit || "xMidYMid meet" }, g);
      return new Thing(this, g, Object.assign({ x: this.cx, y: this.cy }, o));
    }
    ground(o) {
      o = o || {}; const y = o.y == null ? this.groundY : o.y; this.groundY = y;
      const x0 = o.x0 == null ? -this.W : o.x0, x1 = o.x1 == null ? this.W * 3 : o.x1;
      const g = SM.el("g", {}, this.world);
      if (o.style === "none") return new Thing(this, g, {});
      SM.el("line", { x1: x0, y1: y, x2: x1, y2: y, stroke: o.color || this.theme.ink, "stroke-width": (o.width || 5) * this.u, "stroke-linecap": "round" }, g);
      if (o.style === "grass") { const rnd = SM.rng(5); for (let x = x0; x < x1; x += 38 * this.u) { const h = (8 + rnd() * 10) * this.u; SM.el("path", { d: `M${x},${y} l${-4 * this.u},${-h} M${x + 6 * this.u},${y} l${3 * this.u},${-h * 0.8}`, stroke: o.color || this.theme.ink, "stroke-width": 3 * this.u, "stroke-linecap": "round" }, g); } }
      return new Thing(this, g, {});
    }
    // schedule a sound effect at local time t (collected by `stickman compose` via film.js? no - runtime list for docs/QA)
    sfx(name, t, vol) { this._sfx.push({ name, at: t, volume: vol }); return t; }
    // local time helpers for the VO
    cue(q, offset) { return this.vo.cue(q) + (offset || 0); }
  }
  SM.Scene = Scene;

  // ------------------------------------------------------------- VO cue timing
  // Estimates when a word is spoken inside the clip's VO, from text alone
  // (character-weighted with punctuation pauses). Good to ~0.2 s for TTS voices.
  class VoCues {
    constructor(clip) {
      this.text = clip.vo || "";
      this.start = clip.voStart == null ? 0.4 : clip.voStart;
      this.dur = clip.voDuration || 0;
      this.end = this.start + this.dur;
      const words = this.text.split(/\s+/).filter(Boolean);
      let acc = 0; this.words = words.map(w => {
        const clean = w.replace(/[^\p{L}\p{N}']/gu, "");
        const weight = Math.max(2, clean.length) + 1.5 + (/[,;: - --]$/.test(w) ? 3 : 0) + (/[.!?]$/.test(w) ? 6 : 0);
        const o = { word: clean.toLowerCase(), raw: w, a: acc }; acc += weight; o.b = acc; return o;
      });
      this.total = acc || 1;
    }
    // q: number 0..1 (fraction of the VO), word string (first match), or [word, nth]
    cue(q) {
      if (typeof q === "number") return this.start + this.dur * SM.clamp(q, 0, 1);
      let nth = 0; if (Array.isArray(q)) { nth = q[1] || 0; q = q[0]; }
      const key = String(q).toLowerCase().replace(/[^\p{L}\p{N}' ]/gu, "").split(" ")[0];
      let seen = 0;
      for (const w of this.words) if (w.word === key || w.word.startsWith(key)) { if (seen++ === nth) return this.start + this.dur * (w.a / this.total); }
      return this.start;
    }
    // chunks for captions: [{text, a, b}] in local time
    chunks(maxWords) {
      maxWords = maxWords || 5; const out = []; let cur = [];
      this.words.forEach((w, i) => {
        cur.push(w);
        const brk = /[.!?,;: - ]$/.test(w.raw) || cur.length >= maxWords || i === this.words.length - 1;
        if (brk) { out.push({ text: cur.map(c => c.raw).join(" "), a: this.start + this.dur * (cur[0].a / this.total), b: this.start + this.dur * (w.b / this.total) }); cur = []; }
      });
      return out;
    }
  }
  SM.VoCues = VoCues;
})(typeof window !== "undefined" ? window : globalThis);
