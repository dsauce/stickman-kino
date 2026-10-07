/*!
 * Stickman Kino - typography
 * Kinetic text, titles, captions, lower-thirds, labels, speech/thought bubbles, lists, word slams,
 * and annotations (highlight / underline / strike / circle a word).
 *   const t = sc.text("Search ≠ answers.", { x: 1200, y: 160, size: 72, align: "left" });
 *   t.in(1.2, "words"); t.highlight("answers", 2.0); t.out(8.5);
 */
(function (root) {
  "use strict";
  const SM = root.SM; if (!SM) throw new Error("load sm-core.js first");

  const FONT = { body: "var(--sm-font)", display: "var(--sm-display)", hand: "var(--sm-hand)", mono: "ui-monospace, Menlo, Consolas, monospace" };
  const ALIGN = { left: [0, "left"], center: [-50, "center"], right: [-100, "right"] };

  class TextThing extends SM.Thing {
    constructor(sc, str, o) {
      o = o || {};
      const host = o.world ? sc._camText() : sc.ui;
      const el = SM.div("sm-text", host);
      const size = (o.size || 64) * (o.raw ? 1 : sc.u);
      Object.assign(el.style, {
        fontFamily: FONT[o.font || "display"] || o.font, fontSize: size + "px", fontWeight: o.weight || (o.font === "hand" ? 700 : 800),
        color: o.color ? sc._col(o.color) : sc.theme.ink, textAlign: (ALIGN[o.align || "center"] || ALIGN.center)[1],
        lineHeight: o.lineHeight || 1.08, letterSpacing: o.tracking || (o.font === "hand" ? "0" : "-0.015em"),
        whiteSpace: o.width ? "normal" : "nowrap", width: o.width ? o.width + "px" : "auto", left: "0px", top: "0px"
      });
      if (o.italic) el.style.fontStyle = "italic";
      if (o.upper) { el.style.textTransform = "uppercase"; el.style.letterSpacing = "0.08em"; }
      if (o.bg) { el.style.background = sc._col(o.bg); el.style.padding = `${size * 0.18}px ${size * 0.38}px`; el.style.borderRadius = (size * 0.22) + "px"; }
      if (o.shadow) el.style.textShadow = `0 ${size * 0.04}px 0 ${sc._col(o.shadow)}`;
      if (o.outline) { el.style.webkitTextStroke = `${Math.max(2, size * 0.04)}px ${sc._col(o.outline)}`; el.style.paintOrder = "stroke fill"; }
      // words → spans (supports **bold** and [accent] markup)
      const words = []; let inAcc = false;
      String(str).split("\n").forEach((line, li) => {
        if (li) el.appendChild(document.createElement("br"));
        line.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { el.appendChild(document.createTextNode(" ")); return; }
          const w = SM.div("sm-w", null); w.style.display = "inline-block"; w.style.position = "relative";
          let txt = tok, accent = inAcc;
          if (txt.startsWith("[")) { txt = txt.slice(1); accent = true; inAcc = true; }
          const close = /\]([.,!?:;…]*)$/.exec(txt);
          if (close && inAcc) { txt = txt.slice(0, close.index) + close[1]; inAcc = false; }
          if (accent) w.style.color = sc._col(o.accent || "a2");
          const inner = SM.div("sm-wi", w); inner.style.display = "inline-block"; inner.textContent = txt;
          el.appendChild(w); words.push(w);
        });
      });
      const [xp] = ALIGN[o.align || "center"] || ALIGN.center;
      const yp = o.valign === "top" ? 0 : o.valign === "bottom" ? -100 : -50;
      super(sc, el, { x: o.x == null ? sc.cx : o.x, y: o.y == null ? sc.cy : o.y, hidden: o.hidden !== false && o.visible !== true });
      gsap.set(el, { xPercent: xp, yPercent: yp });
      this.words = words; this.size = size; this.o = o;
    }
    _word(q) {
      if (typeof q === "number") return this.words[q];
      const k = String(q).toLowerCase();
      return this.words.find(w => w.textContent.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").startsWith(k.replace(/[^\p{L}\p{N}]/gu, ""))) || this.words[0];
    }
    // entrance effects: rise | fade | pop | words | letters | type | slide | wipe | blur | drop | scale | slam
    in(t, fx, d) {
      fx = fx || "rise"; const tl = this.tl, T = this._g(t); gsap.set(this.el, { opacity: 1 });
      const W = this.words;
      switch (fx) {
        case "fade": gsap.set(this.el, { opacity: 0 }); tl.to(this.el, { opacity: 1, duration: d || 0.5 }, T); return t + (d || 0.5);
        case "pop": gsap.set(this.el, { opacity: 0, scale: 0.4 }); tl.to(this.el, { opacity: 1, scale: 1, duration: d || 0.45, ease: "back.out(2.2)" }, T); return t + (d || 0.45);
        case "scale": gsap.set(this.el, { opacity: 0, scale: 1.6 }); tl.to(this.el, { opacity: 1, scale: 1, duration: d || 0.5, ease: "power3.out" }, T); return t + (d || 0.5);
        case "slam": gsap.set(this.el, { opacity: 0, scale: 2.4 }); tl.to(this.el, { opacity: 1, scale: 1, duration: d || 0.28, ease: "power4.in" }, T); tl.to(this.el, { keyframes: [{ x: this.x + 6, duration: 0.04 }, { x: this.x - 5, duration: 0.04 }, { x: this.x, duration: 0.04 }] }, this._g(t + (d || 0.28))); return t + (d || 0.28) + 0.12;
        case "blur": gsap.set(this.el, { opacity: 0, filter: "blur(18px)" }); tl.to(this.el, { opacity: 1, filter: "blur(0px)", duration: d || 0.6, ease: "power2.out" }, T); return t + (d || 0.6);
        case "drop": gsap.set(this.el, { opacity: 0, y: this.y - 120 }); tl.to(this.el, { opacity: 1, duration: 0.1 }, T); tl.to(this.el, { y: this.y, duration: d || 0.6, ease: "bounce.out" }, T); return t + (d || 0.6);
        case "slide": gsap.set(this.el, { opacity: 0, x: this.x - 80 }); tl.to(this.el, { opacity: 1, x: this.x, duration: d || 0.55, ease: "power3.out" }, T); return t + (d || 0.55);
        case "wipe": gsap.set(this.el, { clipPath: "inset(-20% 100% -20% 0%)" }); tl.to(this.el, { clipPath: "inset(-20% 0% -20% 0%)", duration: d || 0.6, ease: "power2.inOut" }, T); return t + (d || 0.6);
        case "words": {
          const st = d || 0.09; W.forEach(w => gsap.set(w, { opacity: 0, y: this.size * 0.45 }));
          W.forEach((w, i) => tl.to(w, { opacity: 1, y: 0, duration: 0.38, ease: "back.out(1.8)" }, T + i * st)); return t + W.length * st + 0.38;
        }
        case "letters": case "type": {
          const chars = [];
          W.forEach(w => { const inner = w.firstChild, txt = inner.textContent; inner.textContent = ""; for (const ch of txt) { const s = document.createElement("span"); s.textContent = ch; s.style.display = "inline-block"; inner.appendChild(s); chars.push(s); } });
          const st = d || (fx === "type" ? 0.045 : 0.03);
          if (fx === "type") { chars.forEach(s => gsap.set(s, { opacity: 0 })); chars.forEach((s, i) => tl.set(s, { opacity: 1 }, T + i * st)); }
          else { chars.forEach(s => gsap.set(s, { opacity: 0, y: this.size * 0.5, rotation: 12 })); chars.forEach((s, i) => tl.to(s, { opacity: 1, y: 0, rotation: 0, duration: 0.35, ease: "back.out(2)" }, T + i * st)); }
          if (fx === "type" && this.o.caret !== false) {
            const caret = SM.div("sm-caret", this.el, { display: "inline-block", width: Math.max(3, this.size * 0.06) + "px", height: this.size * 0.9 + "px", background: this.el.style.color, marginLeft: this.size * 0.06 + "px", verticalAlign: "-0.1em" });
            const end = T + chars.length * st; const kf = []; for (let i = 0; i < 8; i++) kf.push({ opacity: i % 2 ? 1 : 0, duration: 0.3, ease: "steps(1)" });
            tl.to(caret, { keyframes: kf }, end); tl.set(caret, { opacity: 0 }, end + 2.4);
          }
          return t + chars.length * st + 0.35;
        }
        default: gsap.set(this.el, { opacity: 0, y: this.y + this.size * 0.5 }); tl.to(this.el, { opacity: 1, y: this.y, duration: d || 0.5, ease: "power3.out" }, T); return t + (d || 0.5);
      }
    }
    out(t, fx, d) {
      fx = fx || "fade"; d = d || 0.35; const T = this._g(t);
      if (fx === "rise") this.tl.to(this.el, { opacity: 0, y: this.y - this.size * 0.5, duration: d, ease: "power2.in" }, T);
      else if (fx === "pop") this.tl.to(this.el, { opacity: 0, scale: 0.4, duration: d, ease: "back.in(2)" }, T);
      else if (fx === "wipe") this.tl.to(this.el, { clipPath: "inset(-20% 0% -20% 100%)", duration: d, ease: "power2.inOut" }, T);
      else if (fx === "words") this.words.slice().reverse().forEach((w, i) => this.tl.to(w, { opacity: 0, y: -this.size * 0.3, duration: 0.2 }, T + i * 0.04));
      else this.tl.to(this.el, { opacity: 0, duration: d, ease: "power1.in" }, T);
      return t + d;
    }
    // annotations on a word (or index)
    _deco(q, cls, style) { const w = this._word(q); const s = SM.div(cls, w, style); w.insertBefore(s, w.firstChild); return s; }
    highlight(q, t, color, d) {
      const s = this._deco(q, "sm-mark", { position: "absolute", left: "-0.12em", right: "-0.12em", top: "18%", bottom: "4%", background: this.sc._col(color || "a3"), zIndex: -1, borderRadius: "0.12em", opacity: 0.85 });
      this._word(q).style.zIndex = 0; this.el.style.isolation = "isolate";
      gsap.set(s, { scaleX: 0, transformOrigin: "0% 50%" }); this.tl.to(s, { scaleX: 1, duration: d || 0.35, ease: "power2.out" }, this._g(t)); return t + (d || 0.35);
    }
    underline(q, t, color, d) {
      const s = this._deco(q, "sm-ul", { position: "absolute", left: "0", right: "0", bottom: "-0.06em", height: Math.max(4, this.size * 0.08) + "px", background: this.sc._col(color || "a1"), borderRadius: "99px" });
      gsap.set(s, { scaleX: 0, transformOrigin: "0% 50%" }); this.tl.to(s, { scaleX: 1, duration: d || 0.35, ease: "power2.out" }, this._g(t)); return t + (d || 0.35);
    }
    strike(q, t, color, d) {
      const s = this._deco(q, "sm-strike", { position: "absolute", left: "-0.05em", right: "-0.05em", top: "50%", height: Math.max(4, this.size * 0.09) + "px", background: this.sc._col(color || "a1"), borderRadius: "99px", zIndex: 2 });
      gsap.set(s, { scaleX: 0, transformOrigin: "0% 50%" }); this.tl.to(s, { scaleX: 1, duration: d || 0.3, ease: "power2.out" }, this._g(t)); return t + (d || 0.3);
    }
    circle(q, t, color, d) {
      const w = this._word(q);
      const svg = SM.el("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", style: "position:absolute;left:-18%;top:-30%;width:136%;height:160%;overflow:visible;pointer-events:none" });
      w.appendChild(svg);
      SM.el("path", { d: "M52,6 C82,4 98,30 96,52 C94,80 66,96 44,94 C16,92 2,70 4,48 C6,24 28,8 58,10", fill: "none", stroke: this.sc._col(color || "a1"), "stroke-width": Math.max(4, this.size * 0.07), "vector-effect": "non-scaling-stroke", "stroke-linecap": "round" }, svg);
      gsap.set(svg, { clipPath: "inset(0% 100% 0% 0%)" }); this.tl.to(svg, { clipPath: "inset(0% 0% 0% 0%)", duration: d || 0.45, ease: "power1.inOut" }, this._g(t)); return t + (d || 0.45);
    }
    colorWord(q, color, t, d) { const w = this._word(q); this.tl.to(w, { color: this.sc._col(color), duration: d || 0.25 }, this._g(t)); return t + (d || 0.25); }
    swap(newText, t, d) {
      d = d || 0.3; const T = this._g(t), el = this.el;
      this.tl.to(el, { opacity: 0, y: this.y - this.size * 0.3, duration: d / 2, ease: "power1.in" }, T);
      this.tl.set(this.words[0].firstChild, { textContent: newText }, T + d / 2);
      this.words.slice(1).forEach(w => this.tl.set(w, { display: "none" }, T + d / 2));
      this.tl.fromTo(el, { y: this.y + this.size * 0.3 }, { opacity: 1, y: this.y, duration: d / 2, ease: "power2.out", immediateRender: false }, T + d / 2);
      return t + d;
    }
  }
  SM.TextThing = TextThing;

  const S = SM.Scene.prototype;
  S._col = function (c) { return this.col(c); };
  S._camText = function () { if (!this.camText) { this.camText = SM.div("sm-camtext", this.cam, { width: this.W + "px", height: this.H + "px" }); } return this.camText; };
  S.text = function (str, o) { return new TextThing(this, str, o); };

  // big centred title card (+ optional kicker / subtitle)
  S.title = function (str, o) {
    o = o || {}; const y = o.y == null ? this.cy : o.y, out = {};
    if (o.kicker) out.kicker = this.text(o.kicker, { x: o.x, y: y - (o.size || 120) * this.u * 0.95, size: (o.kickerSize || 30), font: "body", weight: 700, color: o.kickerColor || "a2", upper: true });
    out.main = this.text(str, Object.assign({ size: 120 }, o, { y }));
    if (o.sub) out.sub = this.text(o.sub, { x: o.x, y: y + (o.size || 120) * this.u * 0.85, size: o.subSize || 42, font: "body", weight: 500, color: o.subColor || "muted" });
    out.in = (t, fx) => { let e = t; if (out.kicker) out.kicker.in(t, "fade"); e = out.main.in(t + 0.1, fx || "rise"); if (out.sub) out.sub.in(t + 0.35, "rise"); return Math.max(e, t + 0.85); };
    out.out = (t) => { [out.kicker, out.main, out.sub].forEach(x => x && x.out(t)); return t + 0.35; };
    return out;
  };
  // burned-in caption box (bottom-centre)
  S.caption = function (str, t0, t1, o) {
    o = o || {}; const size = o.size || (this.H > this.W ? 52 : 44);
    const tx = this.text(str, { x: this.cx, y: o.y || this.H * (this.H > this.W ? 0.84 : 0.91), size, font: o.font || "body", weight: o.weight || 700, color: o.color || "#FFFFFF", bg: o.bg || "rgba(0,0,0,0.72)", width: o.width, raw: false });
    tx.in(t0, o.fx || "fade", 0.12); tx.out(t1, "fade", 0.12); return tx;
  };
  // automatic captions from the clip's VO (estimated word timing)
  S.captions = function (o) {
    o = o || {}; if (!this.vo.text) return []; this._captioned = true;
    return this.vo.chunks(o.words || (this.H > this.W ? 3 : 5)).map(ch => {
      if (o.style === "pop") { const tx = this.text(ch.text, { x: this.cx, y: o.y || this.H * (this.H > this.W ? 0.84 : 0.86), size: o.size || (this.H > this.W ? 84 : 64), font: "display", color: o.color || "#FFFFFF", outline: o.outline || "#000000", width: this.W * 0.86 }); tx.in(ch.a, "pop", 0.18); tx.out(Math.max(ch.a + 0.2, ch.b - 0.02), "fade", 0.08); return tx; }
      return this.caption(ch.text, ch.a, Math.max(ch.a + 0.25, ch.b), o);
    });
  };
  // lower third (name + role)
  S.lowerThird = function (name, role, t, o) {
    o = o || {}; const x = o.x || 110 * this.u, y = o.y || this.H - 190 * this.u;
    const bar = SM.div("sm-lt", this.ui, { position: "absolute", left: x + "px", top: (y - 12 * this.u) + "px", width: 10 * this.u + "px", height: 120 * this.u + "px", background: this._col(o.color || "a2"), borderRadius: "4px" });
    gsap.set(bar, { scaleY: 0, transformOrigin: "50% 0%" }); this.tl.to(bar, { scaleY: 1, duration: 0.35, ease: "power2.out" }, this.T(t));
    const a = this.text(name, { x: x + 34 * this.u, y: y + 22 * this.u, size: o.size || 54, align: "left" }); a.in(t + 0.15, "slide");
    const b = this.text(role || "", { x: x + 34 * this.u, y: y + 80 * this.u, size: (o.size || 54) * 0.55, align: "left", font: "body", weight: 500, color: "muted" }); b.in(t + 0.3, "slide");
    if (o.out) { a.out(o.out); b.out(o.out); this.tl.to(bar, { scaleY: 0, duration: 0.3 }, this.T(o.out)); }
    return { name: a, role: b, bar };
  };
  // label with leader line pointing at (px,py)
  S.label = function (str, x, y, px, py, o) {
    o = o || {}; const tx = this.text(str, { x, y, size: o.size || 40, font: o.font || "hand", color: o.color, world: o.world !== false });
    let ln = null;
    if (px != null) { ln = this.arrow(x + (px > x ? 1 : -1) * 20 * this.u, y + 30 * this.u, px, py, { width: 4, head: 16, bend: o.bend == null ? 0.25 : o.bend, color: o.color ? this._col(o.color) : undefined, layer: "front" }); }
    return { text: tx, line: ln, in: t => { tx.in(t, "pop"); if (ln) ln.draw(t + 0.2, 0.45); return t + 0.65; }, out: t => { tx.out(t); if (ln) ln.fadeOut(t); return t + 0.35; } };
  };
  // speech / thought bubble with text or an icon prop
  S.bubble = function (target, content, t, d, o) {
    o = o || {}; let x, y;
    if (target && target.headPos) { const h = target.headPos(); x = h.x + (o.dx == null ? 70 : o.dx) * this.u * target.facing; y = h.y - (o.dy == null ? 140 : o.dy) * this.u; }
    else { x = target.x; y = target.y; }
    const g = SM.el("g", {}, this.layer(o.layer || "front")), u = this.u, isText = typeof content === "string" && !o.icon;
    const w = (o.w || (isText ? Math.max(180, String(content).length * 26 + 70) : 170)) * u, h = (o.h || (isText ? 110 : 150)) * u;
    const ink = this.theme.ink, paper = this.theme.paper;
    if (o.type === "thought") {
      const rx = w / 2, ry = h / 2; let dd = ""; const n = 9;
      for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2; const x1 = rx * Math.cos(a1), y1 = ry * Math.sin(a1); dd += (i ? "" : `M${rx * Math.cos(a0)},${ry * Math.sin(a0)} `) + `Q${rx * 1.25 * Math.cos((a0 + a1) / 2)},${ry * 1.3 * Math.sin((a0 + a1) / 2)} ${x1},${y1} `; }
      SM.el("path", { d: dd + "Z", fill: paper, stroke: ink, "stroke-width": 5 * u }, g);
      const s = target.facing || 1; SM.el("circle", { cx: -s * w * 0.32, cy: h * 0.62, r: 14 * u, fill: paper, stroke: ink, "stroke-width": 4 * u }, g); SM.el("circle", { cx: -s * w * 0.42, cy: h * 0.86, r: 8 * u, fill: paper, stroke: ink, "stroke-width": 4 * u }, g);
    } else {
      const s = (target && target.facing) || 1, tx0 = -s * w * 0.25;
      SM.el("path", { d: `M${-w / 2 + 24 * u},${-h / 2} H${w / 2 - 24 * u} Q${w / 2},${-h / 2} ${w / 2},${-h / 2 + 24 * u} V${h / 2 - 24 * u} Q${w / 2},${h / 2} ${w / 2 - 24 * u},${h / 2} H${tx0 + 18 * u * s} L${tx0 - 30 * u * s},${h / 2 + 44 * u} L${tx0 - 6 * u * s},${h / 2} H${-w / 2 + 24 * u} Q${-w / 2},${h / 2} ${-w / 2},${h / 2 - 24 * u} V${-h / 2 + 24 * u} Q${-w / 2},${-h / 2} ${-w / 2 + 24 * u},${-h / 2} Z`, fill: paper, stroke: ink, "stroke-width": 5 * u, "stroke-linejoin": "round" }, g);
    }
    if (isText) { const tt = SM.el("text", { x: 0, y: 2 * u, "text-anchor": "middle", "dominant-baseline": "central", "font-family": `${this.theme.hand}, Caveat, cursive`, "font-size": (o.size || 52) * u, "font-weight": 700, fill: ink }, g); tt.textContent = content; }
    else if (content) { const ig = SM.el("g", {}, g); SM.drawProp(o.icon || content, ig, { sc: this, size: Math.min(w, h) * 0.7, accent: o.accent }); }
    const th = new SM.Thing(this, g, { x, y, origin: "50% 100%" });
    th.pop(t, 0.35); if (d) th.popOut(t + d, 0.25);
    return th;
  };
  // bullet / checklist that reveals item by item
  S.list = function (items, o) {
    o = o || {}; const x = o.x == null ? this.W * 0.12 : o.x, y = o.y == null ? this.H * 0.3 : o.y, gap = (o.gap || 96) * this.u, size = o.size || 52;
    const rows = items.map((it, i) => {
      const iconName = o.icon || "checkbox";
      const ic = this.prop(iconName, { layer: "ui", x: x + 30 * this.u, y: y + i * gap, size: size * 1.2 * this.u, accent: o.accent || "a2", hidden: true });
      const tx = this.text(it, { x: x + 90 * this.u, y: y + i * gap, size, align: "left", font: o.font || "display", weight: o.weight || 700 });
      return { icon: ic, text: tx };
    });
    return { rows, in: (t, step) => { step = step || 0.6; rows.forEach((r, i) => { r.icon.pop(t + i * step, 0.35); r.text.in(t + i * step + 0.08, "slide"); }); return t + rows.length * step; }, out: t => { rows.forEach(r => { r.icon.fadeOut(t); r.text.out(t); }); return t + 0.35; } };
  };
  // one big word at a time, centre screen ("word slam")
  S.slam = function (words, t, o) {
    o = o || {}; const per = o.per || 0.55, things = [];
    words.forEach((w, i) => {
      const tx = this.text(w, { x: o.x, y: o.y, size: o.size || 170, color: o.colors ? o.colors[i % o.colors.length] : o.color, font: o.font || "display" });
      tx.in(t + i * per, o.fx || "slam", 0.22); if (i < words.length - 1 || o.hold === false) tx.out(t + (i + 1) * per - 0.05, "fade", 0.06); things.push(tx);
    });
    return { items: things, end: t + words.length * per };
  };
  S.quote = function (str, who, t, o) {
    o = o || {}; const q = this.text("“", { x: this.cx - (o.w || 900) * this.u * 0.5, y: this.cy - 120 * this.u, size: 260, color: "a2" });
    const tx = this.text(str, { x: this.cx, y: this.cy, size: o.size || 64, width: (o.w || 1100) * this.u, font: o.font || "display" });
    const by = who ? this.text("- " + who, { x: this.cx, y: this.cy + 160 * this.u, size: 38, font: "body", weight: 500, color: "muted" }) : null;
    q.in(t, "pop"); tx.in(t + 0.15, "words", 0.06); if (by) by.in(t + 0.8, "rise"); return { quote: tx, mark: q, by };
  };
})(typeof window !== "undefined" ? window : globalThis);
