/*!
 * Stickman Kino - charts & diagrams
 * Bar / horizontal bar / line / pie & donut / counter / stat card / progress / gauge / flowchart /
 * timeline / venn / versus split / network / pyramid / cycle / 2×2 matrix / funnel stages / table.
 * All are seek-safe (no onUpdate callbacks); number counters use discrete steps.
 */
(function (root) {
  "use strict";
  const SM = root.SM; if (!SM) throw new Error("load sm-core.js first");
  const S = SM.Scene.prototype;

  const fmt = (v, o) => {
    o = o || {}; const dec = o.decimals || 0; let s = Math.abs(v).toFixed(dec);
    if (o.commas !== false) { const [a, b] = s.split("."); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (b ? "." + b : ""); }
    return (v < 0 ? "-" : "") + (o.prefix || "") + s + (o.suffix || "");
  };
  SM.fmt = fmt;
  // discrete number tween on a text node (seek-safe)
  function countUp(sc, node, from, to, t, d, o) {
    const steps = Math.max(2, Math.round(d * 30)), T = sc.T(t);
    gsap.set(node, { textContent: fmt(from, o) });
    for (let i = 1; i <= steps; i++) { const u = i / steps, e = 1 - Math.pow(1 - u, 3); sc.tl.set(node, { textContent: fmt(from + (to - from) * e, o) }, T + d * u); }
  }
  SM.countUp = countUp;
  const svgText = (sc, parent, str, x, y, o) => {
    o = o || {}; const t = SM.el("text", { x, y, "text-anchor": o.anchor || "middle", "dominant-baseline": o.baseline || "central", "font-family": o.font || `${sc.theme.font}, Inter, sans-serif`, "font-weight": o.weight || 700, "font-size": (o.size || 30) * sc.u, fill: o.color ? sc._col(o.color) : sc.theme.ink }, parent);
    t.textContent = str; return t;
  };
  SM.svgText = svgText;

  // ------------------------------------------------------------------ counters & stats
  S.counter = function (to, o) {
    o = o || {}; const core = Object.assign({}, o, { suffix: "" });   // the suffix lives in its own span so counting never duplicates it
    const tx = this.text(fmt(o.from || 0, core), Object.assign({ size: 140 }, o, { visible: true }));
    if (o.suffix) { const sp = document.createElement("span"); sp.textContent = o.suffix.replace(/^ /, "\u00A0"); tx.el.appendChild(sp); }
    tx.count = (t, d) => { d = d || 1.4; gsap.set(tx.el, { opacity: 0 }); this.tl.to(tx.el, { opacity: 1, duration: 0.2 }, this.T(t)); countUp(this, tx.words[0].firstChild, o.from || 0, to, t, d, core); return t + d; };
    return tx;
  };
  S.stat = function (value, label, o) {
    o = o || {}; const x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const num = this.counter(value, Object.assign({ x, y: y - 20 * this.u, size: o.size || 150, color: o.color || "a2" }, o));
    const lab = this.text(label, { x, y: y + (o.size || 150) * this.u * 0.72, size: (o.size || 150) * 0.28, font: "body", weight: 600, color: o.labelColor || "muted", width: o.width });
    return { num, label: lab, in: (t, d) => { const e = num.count(t, d || 1.2); lab.in(t + 0.3, "rise"); return e; }, out: t => { num.out(t); lab.out(t); return t + 0.35; } };
  };

  // ------------------------------------------------------------------ bar charts
  S.barChart = function (o) {
    o = o || {}; const u = this.u, data = o.data || [], n = data.length;
    const w = (o.w || 900) * u, h = (o.h || 520) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer)), max = o.max || Math.max(...data.map(d => d.value)) * 1.1;
    const x0 = -w / 2, y0 = h / 2, slot = w / n, bw = slot * (o.barWidth || 0.62);
    const axis = SM.el("path", { d: `M${x0},${-h / 2} V${y0} H${w / 2}`, fill: "none", stroke: this.theme.ink, "stroke-width": 5 * u, "stroke-linecap": "round", "data-draw": "" }, g);
    const bars = [], vals = [], labs = [];
    data.forEach((d, i) => {
      const bh = h * d.value / max, bx = x0 + slot * i + (slot - bw) / 2;
      const r = SM.el("rect", { x: bx, y: y0 - bh, width: bw, height: bh, rx: 6 * u, fill: this._col(d.color || o.color || (i === n - 1 ? "a2" : "muted")), stroke: this.theme.ink, "stroke-width": 4 * u }, g);
      gsap.set(r, { scaleY: 0, transformOrigin: "50% 100%" }); bars.push(r);
      if (d.label != null) labs.push(svgText(this, g, d.label, bx + bw / 2, y0 + 34 * u, { size: o.labelSize || 28, weight: 600 }));
      if (o.values !== false) { const v = svgText(this, g, fmt(0, o), bx + bw / 2, y0 - bh - 30 * u, { size: o.valueSize || 32, weight: 800 }); gsap.set(v, { opacity: 0 }); vals.push(v); }
      if (d.icon) { const ig = SM.el("g", {}, g); SM.drawProp(d.icon, ig, { sc: this, size: Math.min(bw * 0.8, 70 * u) }); gsap.set(ig, { x: bx + bw / 2, y: y0 + 80 * u }); }
    });
    SM.prepDraw(axis);
    const th = new SM.Thing(this, g, { x, y });
    th.bars = bars; th.values = vals;
    th.grow = (t, d, stagger) => {
      d = d || 0.7; stagger = stagger == null ? 0.18 : stagger;
      this.tl.set(axis, { opacity: 1 }, this.T(t)); this.tl.to(axis, { strokeDashoffset: 0, duration: 0.5 }, this.T(t));
      bars.forEach((b, i) => { this.tl.to(b, { scaleY: 1, duration: d, ease: "back.out(1.3)" }, this.T(t + 0.3 + i * stagger)); if (vals[i]) { this.tl.to(vals[i], { opacity: 1, duration: 0.2 }, this.T(t + 0.3 + i * stagger)); countUp(this, vals[i], 0, data[i].value, t + 0.3 + i * stagger, d, o); } });
      return t + 0.3 + n * stagger + d;
    };
    th.highlight = (i, t, color) => { this.tl.to(bars[i], { fill: this._col(color || "a3"), duration: 0.3 }, this.T(t)); th.sc.tl.to(bars[i], { keyframes: [{ scaleY: 1.06, duration: 0.15 }, { scaleY: 1, duration: 0.2 }] }, this.T(t)); return t + 0.35; };
    th.setValue = (i, v, t, d) => { d = d || 0.6; const bh = h * v / max; this.tl.to(bars[i], { attr: { y: y0 - bh, height: bh }, duration: d, ease: "power2.inOut" }, this.T(t)); if (vals[i]) { this.tl.to(vals[i], { attr: { y: y0 - bh - 30 * u }, duration: d }, this.T(t)); countUp(this, vals[i], data[i].value, v, t, d, o); } data[i].value = v; return t + d; };
    return th;
  };
  S.hbarChart = function (o) {
    o = o || {}; const u = this.u, data = o.data || [], n = data.length;
    const w = (o.w || 900) * u, h = (o.h || 460) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer)), max = o.max || Math.max(...data.map(d => d.value)) * 1.08, slot = h / n, bh = slot * 0.6, lw = (o.labelWidth || 220) * u;
    const bars = [], vals = [];
    data.forEach((d, i) => {
      const by = -h / 2 + slot * i + (slot - bh) / 2, bw = (w - lw) * d.value / max;
      svgText(this, g, d.label || "", -w / 2 + lw - 20 * u, by + bh / 2, { anchor: "end", size: o.labelSize || 30, weight: 600 });
      const r = SM.el("rect", { x: -w / 2 + lw, y: by, width: bw, height: bh, rx: 6 * u, fill: this._col(d.color || o.color || (i === 0 ? "a2" : "muted")), stroke: this.theme.ink, "stroke-width": 4 * u }, g);
      gsap.set(r, { scaleX: 0, transformOrigin: "0% 50%" }); bars.push(r);
      const v = svgText(this, g, fmt(0, o), -w / 2 + lw + bw + 16 * u, by + bh / 2, { anchor: "start", size: o.valueSize || 30, weight: 800 }); gsap.set(v, { opacity: 0 }); vals.push(v);
    });
    const th = new SM.Thing(this, g, { x, y });
    th.grow = (t, d, st) => { d = d || 0.7; st = st == null ? 0.15 : st; bars.forEach((b, i) => { this.tl.to(b, { scaleX: 1, duration: d, ease: "power3.out" }, this.T(t + i * st)); this.tl.to(vals[i], { opacity: 1, duration: 0.2 }, this.T(t + i * st)); countUp(this, vals[i], 0, data[i].value, t + i * st, d, o); }); return t + n * st + d; };
    return th;
  };
  // ------------------------------------------------------------------ line chart
  S.lineChart = function (o) {
    o = o || {}; const u = this.u, series = o.series || [{ values: o.values || [], color: o.color }];
    const w = (o.w || 900) * u, h = (o.h || 500) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const all = series.flatMap(s => s.values), max = o.max || Math.max(...all) * 1.1, min = o.min == null ? Math.min(0, ...all) : o.min;
    const g = SM.el("g", {}, this.layer(o.layer));
    const axis = SM.el("path", { d: `M${-w / 2},${-h / 2} V${h / 2} H${w / 2}`, fill: "none", stroke: this.theme.ink, "stroke-width": 5 * u, "stroke-linecap": "round", "data-draw": "" }, g);
    if (o.grid) for (let i = 1; i < 4; i++) SM.el("line", { x1: -w / 2, x2: w / 2, y1: h / 2 - h * i / 4, y2: h / 2 - h * i / 4, stroke: this.theme.soft, "stroke-width": 3 * u }, g);
    const lines = [], dots = [];
    series.forEach((s, si) => {
      const n = s.values.length, pts = s.values.map((v, i) => [-w / 2 + w * i / Math.max(1, n - 1), h / 2 - h * (v - min) / (max - min)]);
      let d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < n; i++) {
        const p0 = pts[Math.max(0, i - 2)], p1 = pts[i - 1], p2 = pts[i], p3 = pts[Math.min(n - 1, i + 1)];
        if (o.smooth === false) { d += ` L${p2[0]},${p2[1]}`; continue; }
        const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; // Catmull-Rom → Bézier
        d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
      }
      if (o.area) { const a = SM.el("path", { d: d + ` L${pts[n - 1][0]},${h / 2} L${pts[0][0]},${h / 2} Z`, fill: this._col(s.color || "a2"), opacity: 0.15, stroke: "none" }, g); gsap.set(a, { opacity: 0 }); lines.push({ area: a }); }
      const p = SM.el("path", { d, fill: "none", stroke: this._col(s.color || (si ? "a1" : "a2")), "stroke-width": (o.width || 8) * u, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      SM.prepDraw(p); lines.push({ path: p, pts });
      if (o.dots !== false) pts.forEach(([px, py]) => { const c = SM.el("circle", { cx: px, cy: py, r: 9 * u, fill: this.theme.paper, stroke: this._col(s.color || (si ? "a1" : "a2")), "stroke-width": 5 * u }, g); gsap.set(c, { scale: 0, transformOrigin: "50% 50%" }); dots.push({ c, si, x: px }); });
      if (s.label) svgText(this, g, s.label, pts[n - 1][0] + 20 * u, pts[n - 1][1], { anchor: "start", size: 30, color: s.color || (si ? "a1" : "a2") });
    });
    (o.labels || []).forEach((l, i, arr) => svgText(this, g, l, -w / 2 + w * i / Math.max(1, arr.length - 1), h / 2 + 34 * u, { size: 26, weight: 600, color: "muted" }));
    SM.prepDraw(axis);
    const th = new SM.Thing(this, g, { x, y });
    th.draw = (t, d) => {
      d = d || 1.6; this.tl.set(axis, { opacity: 1 }, this.T(t)); this.tl.to(axis, { strokeDashoffset: 0, duration: 0.5 }, this.T(t));
      lines.forEach(l => { if (l.path) { this.tl.set(l.path, { opacity: 1 }, this.T(t + 0.4)); this.tl.to(l.path, { strokeDashoffset: 0, duration: d, ease: "power1.inOut" }, this.T(t + 0.4)); } if (l.area) this.tl.to(l.area, { opacity: 0.15, duration: 0.6 }, this.T(t + 0.4 + d * 0.6)); });
      dots.forEach(dt => { const u2 = (dt.x + w / 2) / w; this.tl.to(dt.c, { scale: 1, duration: 0.25, ease: "back.out(3)" }, this.T(t + 0.4 + d * u2)); });
      return t + 0.4 + d;
    };
    th.point = (si, i) => { const l = lines.filter(z => z.path)[si]; const [px, py] = l.pts[i]; return { x: x + px, y: y + py }; };
    return th;
  };
  // ------------------------------------------------------------------ pie / donut
  S.pieChart = function (o) {
    o = o || {}; const u = this.u, data = o.data || [], r = (o.r || 220) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer)), total = data.reduce((a, d) => a + d.value, 0), donut = o.donut ? r * (o.donut === true ? 0.55 : o.donut) : 0;
    const rr = donut ? (r + donut) / 2 : r / 2, sw = donut ? r - donut : r, C = 2 * Math.PI * rr;
    const segs = []; let acc = 0;
    data.forEach((d, i) => {
      const len = C * d.value / total;
      const c = SM.el("circle", { cx: 0, cy: 0, r: rr, fill: "none", stroke: this._col(d.color || ["a2", "a1", "a3", "muted"][i % 4]), "stroke-width": sw, "stroke-dasharray": `0 ${C}`, transform: `rotate(${-90 + 360 * acc / total})` }, g);
      segs.push({ c, len }); acc += d.value;
      if (d.label) { const mid = (-90 + 360 * (acc - d.value / 2) / total) * SM.R, lr = r + 60 * u; const tl = svgText(this, g, d.label, lr * Math.cos(mid), lr * Math.sin(mid), { size: 30 }); gsap.set(tl, { opacity: 0 }); segs[segs.length - 1].label = tl; }
    });
    SM.el("circle", { cx: 0, cy: 0, r, fill: "none", stroke: this.theme.ink, "stroke-width": 5 * u }, g);
    if (donut) SM.el("circle", { cx: 0, cy: 0, r: donut, fill: this.theme.paper, stroke: this.theme.ink, "stroke-width": 5 * u }, g);
    let center = null; if (o.center) center = svgText(this, g, o.center, 0, 0, { size: o.centerSize || 64, weight: 800 });
    const th = new SM.Thing(this, g, { x, y });
    th.grow = (t, d) => { d = d || 1.2; let tt = t; segs.forEach(s => { const sd = d * s.len / C; this.tl.to(s.c, { attr: { "stroke-dasharray": `${s.len} ${C}` }, duration: sd, ease: "none" }, this.T(tt)); if (s.label) this.tl.to(s.label, { opacity: 1, duration: 0.25 }, this.T(tt + sd * 0.5)); tt += sd; }); return t + d; };
    th.explode = (i, t, dist) => { const s = segs[i]; let a0 = 0; for (let k = 0; k < i; k++) a0 += data[k].value; const mid = (-90 + 360 * (a0 + data[i].value / 2) / total) * SM.R; dist = (dist || 24) * u; this.tl.to(s.c, { x: dist * Math.cos(mid), y: dist * Math.sin(mid), duration: 0.35, ease: "back.out(2)" }, this.T(t)); return t + 0.35; };
    return th;
  };
  // ------------------------------------------------------------------ progress & gauge
  S.progress = function (o) {
    o = o || {}; const u = this.u, w = (o.w || 800) * u, h = (o.h || 54) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer));
    SM.el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: this.theme.soft, stroke: this.theme.ink, "stroke-width": 5 * u }, g);
    const fill = SM.el("rect", { x: -w / 2 + 6 * u, y: -h / 2 + 6 * u, width: w - 12 * u, height: h - 12 * u, rx: (h - 12 * u) / 2, fill: this._col(o.color || "a2") }, g);
    gsap.set(fill, { scaleX: (o.from || 0) / 100, transformOrigin: "0% 50%" });
    let lab = null; if (o.label !== false) lab = svgText(this, g, fmt(o.from || 0, { suffix: "%" }), w / 2 + 70 * u, 0, { size: 40, weight: 800 });
    const th = new SM.Thing(this, g, { x, y }); let cur = o.from || 0;
    th.to = (pct, t, d) => { d = d || 1; this.tl.to(fill, { scaleX: pct / 100, duration: d, ease: "power2.inOut" }, this.T(t)); if (lab) countUp(this, lab, cur, pct, t, d, { suffix: "%" }); cur = pct; return t + d; };
    return th;
  };
  S.gauge = function (o) {
    o = o || {}; const u = this.u, r = (o.r || 200) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer)), cols = o.colors || ["a1", "a3", "a2"];
    cols.forEach((c, i) => { const a0 = Math.PI + i * Math.PI / cols.length, a1 = Math.PI + (i + 1) * Math.PI / cols.length; SM.el("path", { d: `M${r * Math.cos(a0)},${r * Math.sin(a0)} A${r},${r} 0 0 1 ${r * Math.cos(a1)},${r * Math.sin(a1)}`, fill: "none", stroke: this._col(c), "stroke-width": 34 * u }, g); });
    SM.el("path", { d: `M${-r - 17 * u},0 A${r + 17 * u},${r + 17 * u} 0 0 1 ${r + 17 * u},0`, fill: "none", stroke: this.theme.ink, "stroke-width": 5 * u }, g);
    const needle = SM.el("g", {}, g); SM.el("path", { d: `M0,${-10 * u} L${r * 0.85},0 L0,${10 * u} Z`, fill: this.theme.ink }, needle); SM.el("circle", { cx: 0, cy: 0, r: 18 * u, fill: this.theme.ink }, g);
    const ang = v => 180 + 180 * SM.clamp(v, 0, 100) / 100; gsap.set(needle, { rotation: ang(o.from || 0), transformOrigin: "0% 50%" });
    const th = new SM.Thing(this, g, { x, y });
    th.to = (v, t, d) => { d = d || 1; this.tl.to(needle, { rotation: ang(v), duration: d, ease: "elastic.out(1, 0.6)" }, this.T(t)); return t + d; };
    return th;
  };
  // ------------------------------------------------------------------ flowchart
  // nodes: [{id, label, x, y, icon?, shape?: 'box'|'pill'|'circle'|'diamond', color?}]  edges: [[from,to,label?]]
  S.flow = function (o) {
    o = o || {}; const u = this.u, g = SM.el("g", {}, this.layer(o.layer)), nodes = {}, edges = [];
    const nw = (o.nodeW || 260) * u, nh = (o.nodeH || 110) * u;
    (o.nodes || []).forEach(n => {
      const ng = SM.el("g", {}, g), fill = n.color ? this._col(n.color) : this.theme.paper, w = (n.w || nw / u) * u, h = (n.h || nh / u) * u;
      if (n.shape === "circle") SM.el("circle", { cx: 0, cy: 0, r: h / 2, fill, stroke: this.theme.ink, "stroke-width": 5 * u }, ng);
      else if (n.shape === "diamond") SM.el("path", { d: `M0,${-h * 0.62} L${w * 0.5},0 L0,${h * 0.62} L${-w * 0.5},0 Z`, fill, stroke: this.theme.ink, "stroke-width": 5 * u, "stroke-linejoin": "round" }, ng);
      else SM.el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: n.shape === "pill" ? h / 2 : 16 * u, fill, stroke: this.theme.ink, "stroke-width": 5 * u }, ng);
      let tx = 0; if (n.icon) { const ig = SM.el("g", {}, ng); SM.drawProp(n.icon, ig, { sc: this, size: h * 0.6, accent: n.iconAccent }); gsap.set(ig, { x: n.label ? -w / 2 + h * 0.48 : 0 }); tx = h * 0.3; }
      if (n.label) svgText(this, ng, n.label, n.icon ? tx : 0, 0, { size: n.size || 30, weight: 700 });
      const th = new SM.Thing(this, ng, { x: n.x, y: n.y, hidden: true }); th.w = w; th.h = h; nodes[n.id] = th;
    });
    (o.edges || []).forEach(e => {
      const a = nodes[e[0]], b = nodes[e[1]]; if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y, horiz = Math.abs(dx) >= Math.abs(dy);
      const x1 = a.x + (horiz ? Math.sign(dx) * a.w / 2 : 0), y1 = a.y + (horiz ? 0 : Math.sign(dy) * a.h / 2);
      const x2 = b.x - (horiz ? Math.sign(dx) * (b.w / 2 + 8 * u) : 0), y2 = b.y - (horiz ? 0 : Math.sign(dy) * (b.h / 2 + 8 * u));
      const ar = this.arrow(x1, y1, x2, y2, { bend: (e[3] && e[3].bend) || 0, color: o.edgeColor, layer: o.layer, width: 5, dash: e[3] && e[3].dash });
      g.insertBefore(ar.el, g.firstChild); gsap.set(ar.el, { opacity: 1 });
      let lab = null; if (e[2]) { lab = svgText(this, g, e[2], (x1 + x2) / 2, (y1 + y2) / 2 - 26 * u, { size: 24, weight: 600, color: "muted" }); gsap.set(lab, { opacity: 0 }); }
      edges.push({ from: e[0], to: e[1], arrow: ar, label: lab });
    });
    return {
      nodes, edges, group: g,
      build: (t, step) => {
        step = step || 0.5; const order = (o.nodes || []).map(n => n.id); let tt = t;
        order.forEach((id, i) => { nodes[id].pop(tt, 0.35); edges.filter(e => e.from === id).forEach(e => { e.arrow.draw(tt + 0.3, 0.4); if (e.label) this.tl.to(e.label, { opacity: 1, duration: 0.2 }, this.T(tt + 0.5)); }); tt += step; });
        return tt;
      },
      pulse: (id, t, color) => { const n = nodes[id]; if (color) n.tint(this._col(color), t); return n.pulse(t, 1.12); },
      // send a token along an edge
      token: (from, to, t, d, o2) => { o2 = o2 || {}; const a = nodes[from], b = nodes[to]; const tok = this.circle(a.x, a.y, (o2.r || 14) * u, { fill: this._col(o2.color || "a3"), layer: o.layer, hidden: true }); tok.show(t); tok.moveTo(b.x, b.y, t, d || 0.6, "power1.inOut"); tok.hide(t + (d || 0.6)); return t + (d || 0.6); }
    };
  };
  // ------------------------------------------------------------------ timeline
  S.timeline = function (o) {
    o = o || {}; const u = this.u, items = o.items || [], w = (o.w || 1500) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer));
    const base = SM.el("line", { x1: -w / 2, y1: 0, x2: w / 2, y2: 0, stroke: this.theme.ink, "stroke-width": 6 * u, "stroke-linecap": "round" }, g); SM.prepDraw(base);
    const marks = items.map((it, i) => {
      const mx = -w / 2 + w * (items.length === 1 ? 0.5 : i / (items.length - 1)), mg = SM.el("g", {}, g), up = i % 2 === 0;
      SM.el("circle", { cx: 0, cy: 0, r: 18 * u, fill: this._col(it.color || "a2"), stroke: this.theme.ink, "stroke-width": 5 * u }, mg);
      svgText(this, mg, it.date || "", 0, (up ? -1 : 1) * 56 * u, { size: 34, weight: 800 });
      svgText(this, mg, it.label || "", 0, (up ? -1 : 1) * 100 * u, { size: 28, weight: 500, color: "muted" });
      if (it.icon) { const ig = SM.el("g", {}, mg); SM.drawProp(it.icon, ig, { sc: this, size: 90 * u }); gsap.set(ig, { y: (up ? -1 : 1) * 175 * u }); }
      gsap.set(mg, { x: mx, scale: 0, transformOrigin: "50% 50%" }); return mg;
    });
    const th = new SM.Thing(this, g, { x, y });
    th.build = (t, step) => { step = step || 0.45; this.tl.set(base, { opacity: 1 }, this.T(t)); this.tl.to(base, { strokeDashoffset: 0, duration: step * items.length, ease: "none" }, this.T(t)); marks.forEach((m, i) => this.tl.to(m, { scale: 1, duration: 0.35, ease: "back.out(2)" }, this.T(t + step * i + 0.05))); return t + step * items.length + 0.35; };
    th.markX = i => x - w / 2 + w * (items.length === 1 ? 0.5 : i / (items.length - 1));
    return th;
  };
  // ------------------------------------------------------------------ venn
  S.venn = function (o) {
    o = o || {}; const u = this.u, sets = o.sets || ["A", "B"], r = (o.r || 210) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer)), n = sets.length, circles = [];
    sets.forEach((s, i) => {
      const a = n === 2 ? (i ? 0 : Math.PI) : -Math.PI / 2 + i * 2 * Math.PI / 3, off = r * (n === 2 ? 0.55 : 0.6);
      const cg = SM.el("g", {}, g); SM.el("circle", { cx: 0, cy: 0, r, fill: this._col(["a2", "a1", "a3"][i]), "fill-opacity": 0.28, stroke: this.theme.ink, "stroke-width": 5 * u }, cg);
      svgText(this, cg, s, Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, { size: 36 });
      gsap.set(cg, { x: Math.cos(a) * off, y: Math.sin(a) * off, scale: 0, transformOrigin: "50% 50%" }); circles.push(cg);
    });
    let mid = null; if (o.center) { mid = svgText(this, g, o.center, 0, n === 3 ? 10 * u : 0, { size: 34, weight: 800 }); gsap.set(mid, { opacity: 0 }); }
    const th = new SM.Thing(this, g, { x, y });
    th.build = (t, step) => { step = step || 0.35; circles.forEach((c, i) => this.tl.to(c, { scale: 1, duration: 0.45, ease: "back.out(1.8)" }, this.T(t + i * step))); if (mid) this.tl.to(mid, { opacity: 1, duration: 0.3 }, this.T(t + n * step + 0.2)); return t + n * step + 0.5; };
    return th;
  };
  // ------------------------------------------------------------------ versus split screen
  S.versus = function (o) {
    o = o || {}; const u = this.u, g = SM.el("g", {}, this.layer(o.layer || "back"));
    const left = SM.el("rect", { x: 0, y: 0, width: this.W / 2, height: this.H, fill: this._col(o.leftColor || this.theme.soft) }, g);
    const right = SM.el("rect", { x: this.W / 2, y: 0, width: this.W / 2, height: this.H, fill: this._col(o.rightColor || this.theme.paper) }, g);
    const div = SM.el("line", { x1: this.W / 2, y1: 0, x2: this.W / 2, y2: this.H, stroke: this.theme.ink, "stroke-width": 6 * u }, g);
    const badge = SM.el("g", {}, g); SM.el("circle", { cx: 0, cy: 0, r: 64 * u, fill: this._col(o.badgeColor || "a1"), stroke: this.theme.ink, "stroke-width": 6 * u }, badge); svgText(this, badge, o.label || "VS", 0, 2 * u, { size: 52, weight: 900, color: "#FFFFFF" });
    gsap.set(badge, { x: this.W / 2, y: this.H * 0.18, scale: 0, transformOrigin: "50% 50%" });
    gsap.set(left, { x: -this.W / 2 }); gsap.set(right, { x: this.W / 2 }); gsap.set(div, { scaleY: 0, transformOrigin: "50% 50%" });
    let lt = null, rt = null;
    if (o.leftTitle) lt = this.text(o.leftTitle, { x: this.W * 0.25, y: this.H * 0.12, size: o.titleSize || 64, color: o.leftTitleColor || "a1" });
    if (o.rightTitle) rt = this.text(o.rightTitle, { x: this.W * 0.75, y: this.H * 0.12, size: o.titleSize || 64, color: o.rightTitleColor || "a2" });
    return {
      group: g, leftX: this.W * 0.25, rightX: this.W * 0.75,
      in: t => { this.tl.to(left, { x: 0, duration: 0.5, ease: "power3.out" }, this.T(t)); this.tl.to(right, { x: 0, duration: 0.5, ease: "power3.out" }, this.T(t)); this.tl.to(div, { scaleY: 1, duration: 0.4 }, this.T(t + 0.3)); this.tl.to(badge, { scale: 1, duration: 0.4, ease: "back.out(2.5)" }, this.T(t + 0.5)); if (lt) lt.in(t + 0.4, "pop"); if (rt) rt.in(t + 0.5, "pop"); return t + 0.9; }
    };
  };
  // ------------------------------------------------------------------ network graph
  S.network = function (o) {
    o = o || {}; const u = this.u, n = o.n || 9, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y, R1 = (o.r || 300) * u, rnd = SM.rng(o.seed || 3);
    const g = SM.el("g", {}, this.layer(o.layer)), pts = [[0, 0]];
    for (let i = 1; i < n; i++) { const a = i / (n - 1) * Math.PI * 2 + rnd() * 0.5, rr = R1 * (0.55 + rnd() * 0.45); pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.75]); }
    const edges = [], nodes = [];
    for (let i = 1; i < n; i++) { edges.push([0, i]); if (i > 1 && rnd() > 0.4) edges.push([i - 1, i]); }
    const eg = SM.el("g", {}, g);
    edges.forEach(([a, b]) => { const l = SM.el("line", { x1: pts[a][0], y1: pts[a][1], x2: pts[b][0], y2: pts[b][1], stroke: this._col(o.edgeColor || "muted"), "stroke-width": 4 * u, "stroke-linecap": "round" }, eg); SM.prepDraw(l); edges[edges.indexOf(edges.find(e => e[0] === a && e[1] === b))].el = l; });
    pts.forEach(([px, py], i) => { const c = SM.el("circle", { cx: px, cy: py, r: (i ? 22 : 40) * u, fill: i ? this.theme.paper : this._col(o.hubColor || "a2"), stroke: this.theme.ink, "stroke-width": 5 * u }, g); gsap.set(c, { scale: 0, transformOrigin: "50% 50%" }); nodes.push(c); if (o.icons && o.icons[i]) { const ig = SM.el("g", {}, g); SM.drawProp(o.icons[i], ig, { sc: this, size: (i ? 30 : 54) * u }); gsap.set(ig, { x: px, y: py, scale: 0, transformOrigin: "50% 50%" }); nodes[i]._icon = ig; } });
    const th = new SM.Thing(this, g, { x, y });
    th.build = (t, d) => { d = d || 1.4; nodes.forEach((c, i) => { const tt = t + d * i / n; this.tl.to(c, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, this.T(tt)); if (c._icon) this.tl.to(c._icon, { scale: 1, duration: 0.3 }, this.T(tt + 0.05)); }); edges.forEach((e, i) => { const tt = t + 0.15 + d * i / edges.length; this.tl.set(e.el, { opacity: 1 }, this.T(tt)); this.tl.to(e.el, { strokeDashoffset: 0, duration: 0.35 }, this.T(tt)); }); return t + d + 0.4; };
    th.nodePos = i => ({ x: x + pts[i][0], y: y + pts[i][1] });
    return th;
  };
  // ------------------------------------------------------------------ pyramid / funnel stages / cycle / matrix / table
  S.pyramid = function (o) {
    o = o || {}; const u = this.u, levels = o.levels || [], w = (o.w || 760) * u, h = (o.h || 560) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer)), n = levels.length, lh = h / n, parts = [];
    levels.forEach((l, i) => {
      const yt = -h / 2 + i * lh, wt = w * i / n, wb = w * (i + 1) / n, pg = SM.el("g", {}, g);
      SM.el("path", { d: `M${-wt / 2},${yt} L${wt / 2},${yt} L${wb / 2},${yt + lh - 6 * u} L${-wb / 2},${yt + lh - 6 * u} Z`, fill: this._col(l.color || ["a1", "a3", "a2", "muted", "soft"][i % 5]), stroke: this.theme.ink, "stroke-width": 5 * u, "stroke-linejoin": "round" }, pg);
      svgText(this, pg, l.label || l, 0, yt + lh / 2 + (i === 0 ? lh * 0.22 : 0), { size: (o.size || 30) * (i === 0 ? 0.8 : 1) });
      gsap.set(pg, { opacity: 0, y: -40 * u }); parts.push(pg);
    });
    const th = new SM.Thing(this, g, { x, y });
    th.build = (t, step) => { step = step || 0.35; parts.slice().reverse().forEach((p, i) => this.tl.to(p, { opacity: 1, y: 0, duration: 0.4, ease: "bounce.out" }, this.T(t + i * step))); return t + n * step + 0.4; };
    return th;
  };
  S.funnelStages = function (o) {
    o = o || {}; const u = this.u, stages = o.stages || [], w = (o.w || 900) * u, h = (o.h || 560) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer)), n = stages.length, sh = h / n, parts = [];
    stages.forEach((s, i) => {
      const yt = -h / 2 + i * sh, wt = w * (1 - i / n * 0.7), wb = w * (1 - (i + 1) / n * 0.7), pg = SM.el("g", {}, g);
      SM.el("path", { d: `M${-wt / 2},${yt} L${wt / 2},${yt} L${wb / 2},${yt + sh - 8 * u} L${-wb / 2},${yt + sh - 8 * u} Z`, fill: this._col(s.color || (i === n - 1 ? "a2" : "soft")), stroke: this.theme.ink, "stroke-width": 5 * u, "stroke-linejoin": "round" }, pg);
      svgText(this, pg, s.label || s, 0, yt + sh / 2 - 4 * u, { size: 32 });
      if (s.value != null) { const v = svgText(this, pg, fmt(s.value, o), wt / 2 + 80 * u, yt + sh / 2, { size: 34, weight: 800, anchor: "start" }); }
      gsap.set(pg, { opacity: 0, scaleX: 0.6, transformOrigin: "50% 50%" }); parts.push(pg);
    });
    const th = new SM.Thing(this, g, { x, y });
    th.build = (t, step) => { step = step || 0.35; parts.forEach((p, i) => this.tl.to(p, { opacity: 1, scaleX: 1, duration: 0.4, ease: "back.out(1.6)" }, this.T(t + i * step))); return t + n * step + 0.4; };
    return th;
  };
  S.cycle = function (o) {
    o = o || {}; const u = this.u, steps = o.steps || [], r = (o.r || 280) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y, n = steps.length;
    const g = SM.el("g", {}, this.layer(o.layer)), arcs = [], nodes = [];
    steps.forEach((s, i) => {
      const a0 = -Math.PI / 2 + i * 2 * Math.PI / n + 0.32, a1 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / n - 0.32;
      const ag = SM.el("g", {}, g);
      SM.el("path", { d: `M${r * Math.cos(a0)},${r * Math.sin(a0)} A${r},${r} 0 0 1 ${r * Math.cos(a1)},${r * Math.sin(a1)}`, fill: "none", stroke: this.theme.ink, "stroke-width": 6 * u, "stroke-linecap": "round", "data-draw": "" }, ag);
      const hx = r * Math.cos(a1), hy = r * Math.sin(a1), ta = a1 + Math.PI / 2, hl = 22 * u;
      SM.el("path", { d: `M${hx - hl * Math.cos(ta - 0.5)},${hy - hl * Math.sin(ta - 0.5)} L${hx},${hy} L${hx - hl * Math.cos(ta + 0.5)},${hy - hl * Math.sin(ta + 0.5)}`, fill: "none", stroke: this.theme.ink, "stroke-width": 6 * u, "stroke-linecap": "round", "stroke-linejoin": "round", "data-draw": "" }, ag);
      ag.querySelectorAll("[data-draw]").forEach(p => SM.prepDraw(p)); arcs.push(ag);
      const a = -Math.PI / 2 + i * 2 * Math.PI / n, ng = SM.el("g", {}, g);
      SM.el("circle", { cx: 0, cy: 0, r: 74 * u, fill: this._col(s.color || "paper"), stroke: this.theme.ink, "stroke-width": 5 * u }, ng);
      if (s.icon) { const ig = SM.el("g", {}, ng); SM.drawProp(s.icon, ig, { sc: this, size: 80 * u }); }
      if (s.label) svgText(this, ng, s.label, 0, 110 * u, { size: 30 });
      gsap.set(ng, { x: r * Math.cos(a), y: r * Math.sin(a), scale: 0, transformOrigin: "50% 50%" }); nodes.push(ng);
    });
    const th = new SM.Thing(this, g, { x, y });
    th.build = (t, step) => { step = step || 0.5; nodes.forEach((nd, i) => { this.tl.to(nd, { scale: 1, duration: 0.35, ease: "back.out(2)" }, this.T(t + i * step)); arcs[i].querySelectorAll("[data-draw]").forEach(p => { this.tl.set(p, { opacity: 1 }, this.T(t + i * step + 0.25)); this.tl.to(p, { strokeDashoffset: 0, duration: step * 0.8 }, this.T(t + i * step + 0.25)); }); }); return t + n * step + 0.4; };
    th.spin = (t, d) => { this.tl.to(g, { rotation: "+=360", duration: d || 2, ease: "power2.inOut", transformOrigin: "50% 50%" }, this.T(t)); return t + (d || 2); };
    return th;
  };
  S.matrix = function (o) {
    o = o || {}; const u = this.u, s = (o.size || 640) * u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer)), cells = [];
    (o.quadrants || ["", "", "", ""]).forEach((q, i) => {
      const cx = (i % 2 ? 1 : -1) * s / 4, cy = (i < 2 ? -1 : 1) * s / 4, cg = SM.el("g", {}, g);
      SM.el("rect", { x: -s / 4 + 6 * u, y: -s / 4 + 6 * u, width: s / 2 - 12 * u, height: s / 2 - 12 * u, rx: 18 * u, fill: this._col((o.colors || ["soft", "a2", "soft", "a3"])[i]), "fill-opacity": 0.6, stroke: this.theme.ink, "stroke-width": 5 * u }, cg);
      svgText(this, cg, q, 0, 0, { size: o.fontSize || Math.min(34, s / this.u / 16) });
      gsap.set(cg, { x: cx, y: cy, scale: 0, transformOrigin: "50% 50%" }); cells.push(cg);
    });
    if (o.xLabel) svgText(this, g, o.xLabel, 0, s / 2 + 50 * u, { size: 30, color: "muted" });
    if (o.yLabel) { const yl = svgText(this, g, o.yLabel, -s / 2 - 50 * u, 0, { size: 30, color: "muted" }); yl.setAttribute("transform", `rotate(-90 ${-s / 2 - 50 * u} 0)`); }
    const th = new SM.Thing(this, g, { x, y });
    th.build = (t, step) => { step = step || 0.25; cells.forEach((c, i) => this.tl.to(c, { scale: 1, duration: 0.4, ease: "back.out(2)" }, this.T(t + i * step))); return t + 4 * step + 0.4; };
    th.cell = i => ({ x: x + (i % 2 ? 1 : -1) * s / 4, y: y + (i < 2 ? -1 : 1) * s / 4 });
    return th;
  };
  S.table = function (o) {
    o = o || {}; const u = this.u, rows = o.rows || [], cols = (rows[0] || []).length, cw = (o.colW || 300) * u, rh = (o.rowH || 80) * u;
    const w = cw * cols, h = rh * rows.length, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y;
    const g = SM.el("g", {}, this.layer(o.layer)), rgs = [];
    rows.forEach((r, ri) => {
      const rg = SM.el("g", {}, g);
      SM.el("rect", { x: -w / 2, y: -h / 2 + ri * rh, width: w, height: rh, fill: ri === 0 ? this._col(o.headColor || "ink") : (ri % 2 ? this.theme.paper : this.theme.soft), stroke: this.theme.ink, "stroke-width": 4 * u }, rg);
      r.forEach((c, ci) => svgText(this, rg, String(c), -w / 2 + cw * ci + cw / 2, -h / 2 + ri * rh + rh / 2, { size: o.size || 30, weight: ri === 0 ? 800 : 600, color: ri === 0 ? "bg" : (o.colColors && o.colColors[ci]) || "ink" }));
      gsap.set(rg, { opacity: 0, x: -30 * u }); rgs.push(rg);
    });
    const th = new SM.Thing(this, g, { x, y });
    th.build = (t, step) => { step = step || 0.18; rgs.forEach((r, i) => this.tl.to(r, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, this.T(t + i * step))); return t + rgs.length * step + 0.35; };
    return th;
  };
  // big scale / balance that tips toward the heavier side
  S.balance = function (o) {
    o = o || {}; const u = this.u, x = o.x == null ? this.cx : o.x, y = o.y == null ? this.cy : o.y, w = (o.w || 620) * u;
    const g = SM.el("g", {}, this.layer(o.layer)), ink = this.theme.ink;
    SM.el("path", { d: `M0,${-20 * u} V${300 * u} M${-110 * u},${300 * u} H${110 * u}`, stroke: ink, "stroke-width": 8 * u, fill: "none", "stroke-linecap": "round" }, g);
    const beam = SM.el("g", {}, g);
    SM.el("line", { x1: -w / 2, y1: 0, x2: w / 2, y2: 0, stroke: ink, "stroke-width": 8 * u, "stroke-linecap": "round" }, beam);
    SM.el("circle", { cx: 0, cy: 0, r: 14 * u, fill: ink }, g);
    const pans = [-1, 1].map(s => { const pg = SM.el("g", {}, beam); gsap.set(pg, { x: s * w / 2 }); SM.el("path", { d: `M0,0 L${-70 * u},${150 * u} M0,0 L${70 * u},${150 * u}`, stroke: ink, "stroke-width": 4 * u }, pg); SM.el("path", { d: `M${-100 * u},${150 * u} H${100 * u} Q${80 * u},${200 * u} 0,${200 * u} Q${-80 * u},${200 * u} ${-100 * u},${150 * u} Z`, fill: this._col(s < 0 ? (o.leftColor || "a1") : (o.rightColor || "a2")), stroke: ink, "stroke-width": 5 * u }, pg); const cg = SM.el("g", {}, pg); gsap.set(cg, { y: 110 * u }); return { g: pg, content: cg }; });
    (o.left || []).forEach((p, i) => { const ig = SM.el("g", {}, pans[0].content); SM.drawProp(p, ig, { sc: this, size: 80 * u }); gsap.set(ig, { x: (i - ((o.left.length - 1) / 2)) * 70 * u }); });
    (o.right || []).forEach((p, i) => { const ig = SM.el("g", {}, pans[1].content); SM.drawProp(p, ig, { sc: this, size: 80 * u }); gsap.set(ig, { x: (i - ((o.right.length - 1) / 2)) * 70 * u }); });
    gsap.set(beam, { rotation: 0, transformOrigin: "50% 50%" }); pans.forEach(p => gsap.set(p.g, { transformOrigin: "50% 0%" }));
    const th = new SM.Thing(this, g, { x, y });
    th.tip = (deg, t, d) => { d = d || 1; this.tl.to(beam, { rotation: deg, duration: d, ease: "elastic.out(1,0.5)" }, this.T(t)); pans.forEach(p => this.tl.to(p.g, { rotation: -deg, duration: d, ease: "elastic.out(1,0.5)" }, this.T(t))); return t + d; };
    return th;
  };
})(typeof window !== "undefined" ? window : globalThis);
