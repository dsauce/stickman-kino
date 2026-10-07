/*!
 * Stickman Kino - intros & outros (title sequences)
 *   sc.intro("countdown" | "clapper" | "logo" | "spotlight", { t, title, kicker, subtitle, logo, ... }) → end time
 *   sc.outro("cta" | "credits" | "endcard" | "kino",          { t, title, tagline, cta, url, logo, ... }) → end time
 * All screen-space (unaffected by the camera). Pair with sfx: "beep"/"projector" (countdown), "sting", "stamp", "whoosh".
 */
(function (root) {
  "use strict";
  const SM = root.SM; if (!SM) throw new Error("load sm-core.js first");
  const S = SM.Scene.prototype;

  // Stickman Kino film-frame icon, inline so presets never depend on a file
  const KINO_ICON = '<rect width="512" height="512" rx="112" fill="#111"/><g fill="#fff"><rect x="70" y="58" width="44" height="30" rx="8"/><rect x="146" y="58" width="44" height="30" rx="8"/><rect x="222" y="58" width="44" height="30" rx="8"/><rect x="298" y="58" width="44" height="30" rx="8"/><rect x="374" y="58" width="44" height="30" rx="8"/><rect x="70" y="424" width="44" height="30" rx="8"/><rect x="146" y="424" width="44" height="30" rx="8"/><rect x="222" y="424" width="44" height="30" rx="8"/><rect x="298" y="424" width="44" height="30" rx="8"/><rect x="374" y="424" width="44" height="30" rx="8"/><rect x="56" y="112" width="400" height="288" rx="26"/></g><g stroke="#E63946" stroke-width="16" stroke-linecap="round"><line x1="92" y1="214" x2="150" y2="214"/><line x1="78" y1="256" x2="150" y2="256"/><line x1="100" y1="298" x2="152" y2="298"/></g><g fill="none" stroke="#111" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"><circle cx="300" cy="170" r="30" fill="#fff"/><path d="M290 202 L262 292"/><path d="M285 222 L330 246 L360 212"/><path d="M285 222 L238 238 L212 274"/><path d="M262 292 L312 326 L322 378"/><path d="M262 292 L222 334 L182 344"/></g><path d="M392 136 Q396 160 420 164 Q396 168 392 192 Q388 168 364 164 Q388 160 392 136 Z" fill="#F2B400"/>';
  SM.KINO_ICON = KINO_ICON;

  // a logo: image path, prop name, "kino", or a function(g, size)
  function logoThing(sc, logo, x, y, size, layer) {
    const g = SM.el("g", {}, sc.layer(layer || "ui"));
    if (!logo || logo === "kino") { const inner = SM.el("g", { transform: `translate(${-size / 2},${-size / 2}) scale(${size / 512})` }, g); inner.innerHTML = KINO_ICON; }
    else if (typeof logo === "function") logo(g, size);
    else if (/\.(svg|png|jpe?g|webp)$/i.test(logo)) SM.el("image", { href: logo, x: -size / 2, y: -size / 2, width: size, height: size }, g);
    else SM.drawProp(logo, g, { sc, size });
    return new SM.Thing(sc, g, { x, y, hidden: true });
  }
  SM.logoThing = logoThing;
  function cover(sc, color, parent) { return SM.el("rect", { x: -20, y: -20, width: sc.W + 40, height: sc.H + 40, fill: color }, parent || sc.layer("ui")); }
  function pill(sc, label, x, y, o) {
    o = o || {}; const u = sc.u, size = (o.size || 46) * u, w = (o.w || Math.max(300, label.length * 26 + 120)) * u, h = size * 2.1;
    const g = SM.el("g", {}, sc.layer(o.layer || "ui"));
    SM.el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: sc.col(o.fill || "a1"), stroke: o.stroke ? sc.col(o.stroke) : "none", "stroke-width": 5 * u }, g);
    const t = SM.el("text", { x: 0, y: 2 * u, "text-anchor": "middle", "dominant-baseline": "central", "font-family": "var(--sm-display), Inter, sans-serif", "font-weight": 800, "font-size": size, fill: sc.col(o.color || "#FFFFFF") }, g); t.textContent = label;
    return new SM.Thing(sc, g, { x, y, hidden: true });
  }
  SM.pill = pill;
  S.button = function (label, o) { o = o || {}; return pill(this, label, o.x == null ? this.cx : o.x, o.y == null ? this.cy : o.y, o); };

  // ================================================================ INTROS
  S.intro = function (style, o) {
    o = o || {}; this._titled = true; const sc = this, t = o.t || 0, u = sc.u, W = sc.W, H = sc.H, ui = sc.layer("ui");
    const titleIn = (t0, opt) => {
      opt = opt || {}; const y = opt.y == null ? H * 0.46 : opt.y; let e = t0;
      if (o.kicker) sc.text(o.kicker, { x: sc.cx, y: y - (o.size || 140) * u * 0.85, size: o.kickerSize || 34, font: "body", weight: 700, upper: true, color: o.kickerColor || "a2" }).in(t0, "fade", 0.4);
      if (o.title) { const tt = sc.text(o.title, { x: sc.cx, y, size: o.size || 140, color: o.titleColor || opt.color, accent: o.accent || "a1", width: o.width }); e = tt.in(t0 + 0.05, o.titleFx || opt.fx || "slam", opt.fxD); sc._introTitle = tt; }
      if (o.subtitle) sc.text(o.subtitle, { x: sc.cx, y: y + (o.size || 140) * u * 0.78, size: o.subtitleSize || 44, font: o.subtitleFont || "body", weight: 500, color: o.subtitleColor || opt.subColor || "muted" }).in(t0 + 0.45, "rise");
      return Math.max(e, t0 + 0.9);
    };
    switch (style) {
      // classic film leader 3-2-1 → flash → title
      case "countdown": {
        const per = o.per || 0.62, n = o.from || 3, g = SM.el("g", {}, ui), R = Math.min(W, H) * 0.34, cx = sc.cx, cy = sc.cy;
        cover(sc, o.bg || "#1C1C1E", g);
        const sweepR = R * 1.6, C = 2 * Math.PI * (sweepR / 2);
        const sweep = SM.el("circle", { cx, cy, r: sweepR / 2, fill: "none", stroke: "#2E2E31", "stroke-width": sweepR, "stroke-dasharray": `0 ${C}`, transform: `rotate(-90 ${cx} ${cy})` }, g);
        [R, R * 0.82].forEach(r => SM.el("circle", { cx, cy, r, fill: "none", stroke: "#F4F1EA", "stroke-width": 7 * u }, g));
        SM.el("line", { x1: 0, y1: cy, x2: W, y2: cy, stroke: "#F4F1EA", "stroke-width": 4 * u, opacity: 0.8 }, g);
        SM.el("line", { x1: cx, y1: 0, x2: cx, y2: H, stroke: "#F4F1EA", "stroke-width": 4 * u, opacity: 0.8 }, g);
        const nums = [];
        for (let i = n; i >= 1; i--) { const tx = SM.el("text", { x: cx, y: cy + 8 * u, "text-anchor": "middle", "dominant-baseline": "central", "font-family": "Inter, sans-serif", "font-weight": 900, "font-size": R * 1.25, fill: "#F4F1EA", opacity: 0 }, g); tx.textContent = String(i); nums.push(tx); }
        const scratches = []; const rnd = SM.rng(SM.hash(sc.id) + 3);
        for (let i = 0; i < 6; i++) { const x = rnd() * W; const l = SM.el("line", { x1: x, y1: 0, x2: x + (rnd() - 0.5) * 30, y2: H, stroke: "#FFFFFF", "stroke-width": (1 + rnd() * 2) * u, opacity: 0 }, g); scratches.push(l); }
        nums.forEach((tx, i) => {
          const t0 = t + i * per;
          sc.tl.set(tx, { opacity: 1 }, sc.T(t0)); sc.tl.set(tx, { opacity: 0 }, sc.T(t0 + per));
          sc.tl.set(sweep, { attr: { "stroke-dasharray": `0 ${C}` } }, sc.T(t0));
          sc.tl.to(sweep, { attr: { "stroke-dasharray": `${C} ${C}` }, duration: per, ease: "none" }, sc.T(t0));
          sc.sfx("beep", t0);
        });
        scratches.forEach((l, i) => sc.tl.to(l, { keyframes: [0, 0.6, 0, 0.4, 0, 0.7, 0].map(v => ({ opacity: v, duration: per * n / 7, ease: "steps(1)" })) }, sc.T(t + i * 0.05)));
        const end = t + n * per;
        sc.tl.to(g, { opacity: 0, duration: 0.12 }, sc.T(end));
        sc.fx.flash(end, { d: 0.35 });
        return titleIn(end + 0.05);
      }
      // a clapperboard snaps shut
      case "clapper": {
        const g = SM.el("g", {}, ui), bw = Math.min(W * 0.62, 1100 * u), bh = bw * 0.5, x0 = sc.cx - bw / 2, y0 = H * 0.5 - bh / 2 + 40 * u;
        if (o.bg !== false) cover(sc, o.bg ? sc.col(o.bg) : sc.theme.bg, g);
        const board = SM.el("g", {}, g);
        SM.el("rect", { x: x0, y: y0, width: bw, height: bh, rx: 14 * u, fill: "#161616" }, board);
        SM.el("line", { x1: x0 + 20 * u, y1: y0 + bh * 0.52, x2: x0 + bw - 20 * u, y2: y0 + bh * 0.52, stroke: "#EEE", "stroke-width": 4 * u }, board);
        SM.el("line", { x1: x0 + bw * 0.5, y1: y0 + bh * 0.52, x2: x0 + bw * 0.5, y2: y0 + bh - 20 * u, stroke: "#EEE", "stroke-width": 4 * u }, board);
        const cap = (txt, x, y, s, anchor) => { const te = SM.el("text", { x, y, "text-anchor": anchor || "start", "dominant-baseline": "central", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": s, fill: "#F4F1EA" }, board); te.textContent = txt; };
        cap(o.title || "Untitled", x0 + bw / 2, y0 + bh * 0.28, bh * 0.24, "middle");
        cap("SCENE  " + (o.scene || 1), x0 + 34 * u, y0 + bh * 0.76, bh * 0.13);
        cap("TAKE  " + (o.take || 1), x0 + bw * 0.5 + 34 * u, y0 + bh * 0.76, bh * 0.13);
        const hx = x0, hy = y0 - 6 * u, sh = bh * 0.2, stick = SM.el("g", {}, g);
        SM.el("rect", { x: hx, y: hy - sh, width: bw, height: sh, rx: 8 * u, fill: "#F4F1EA", stroke: "#161616", "stroke-width": 6 * u }, stick);
        for (let i = 0; i < 7; i++) SM.el("path", { d: `M${hx + 40 * u + i * bw / 7},${hy - sh + 3 * u} l${bw / 14},0 l${-bw / 20},${sh - 6 * u} l${-bw / 14},0 Z`, fill: "#161616" }, stick);
        SM.el("circle", { cx: hx + 18 * u, cy: hy - sh / 2, r: 9 * u, fill: sc.theme.accents[0] }, stick);
        gsap.set(stick, { rotation: -32, svgOrigin: `${hx} ${hy}` });
        gsap.set(g, { y: H * 0.15, opacity: 0 });
        sc.tl.to(g, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, sc.T(t));
        sc.tl.to(stick, { rotation: -38, duration: 0.25, ease: "sine.out" }, sc.T(t + 0.45));
        const snap = t + (o.snapAt || 1.0);
        sc.tl.to(stick, { rotation: 0, duration: 0.12, ease: "power4.in" }, sc.T(snap - 0.12));
        sc.sfx("stamp", snap);
        sc.camera.shake(snap, 0.3, 10);
        sc.fx.burst(hx + bw * 0.3, hy, snap, { n: 10, r: 40, len: 50, layer: "ui", color: "a3" });
        if (o.title && o.revealTitle !== false) {
          sc.tl.to(g, { scale: 0.18, x: sc.cx * 0.82, y: -H * 0.32, opacity: 0, duration: 0.5, ease: "power3.in", transformOrigin: "50% 50%" }, sc.T(snap + 0.6));
          return titleIn(snap + 0.85, { y: H * 0.47 });
        }
        return snap + 0.6;
      }
      // logo reveal with burst and title
      case "logo": {
        const size = (o.logoSize || 240) * u, ly = o.title ? H * 0.34 : sc.cy;
        if (o.bg) cover(sc, sc.col(o.bg), ui);
        const L = logoThing(sc, o.logo, sc.cx, ly, size);
        L.pop(t + 0.15, 0.55, { ease: "back.out(2.6)" });
        sc.fx.ripple(sc.cx, ly, t + 0.25, { n: 2, r: size * 0.3 / u, layer: "ui", color: o.rippleColor || "a2" });
        sc.fx.burst(sc.cx, ly, t + 0.35, { n: 12, r: size * 0.55 / u, len: 40, layer: "ui", color: "a3" });
        sc.fx.sparkle(sc.cx, ly, t + 0.4, { n: 6, spread: size * 0.7 / u, layer: "ui" });
        L.wobble(t + 0.75, 0.6, 6);
        sc.sfx("sting", t + 0.2);
        return titleIn(t + 0.75, { y: H * 0.6, fx: "letters", fxD: 0.035 });
      }
      // dark stage, a spotlight sweeps across, then floods the frame
      case "spotlight": {
        const ts = sc.topSvg(), id = sc.id + "-spot", R0 = Math.min(W, H) * 0.22, big = Math.hypot(W, H);
        const defs = SM.el("defs", {}, ts), mask = SM.el("mask", { id }, defs);
        SM.el("rect", { x: 0, y: 0, width: W, height: H, fill: "#fff" }, mask);
        const hole = SM.el("circle", { cx: -R0, cy: H * 0.46, r: R0, fill: "#000" }, mask);
        const dark = SM.el("rect", { x: 0, y: 0, width: W, height: H, fill: o.dark || "#0B0B0D", mask: `url(#${id})` }, ts);
        titleIn(t + 0.1, { y: H * 0.46, fx: "fade", fxD: 0.2 });
        sc.tl.to(hole, { attr: { cx: W * 0.3 }, duration: 0.7, ease: "power2.out" }, sc.T(t + 0.2));
        sc.tl.to(hole, { attr: { cx: W * 0.72 }, duration: 0.8, ease: "sine.inOut" }, sc.T(t + 0.95));
        sc.tl.to(hole, { attr: { cx: sc.cx }, duration: 0.5, ease: "sine.inOut" }, sc.T(t + 1.8));
        sc.tl.to(hole, { attr: { r: big }, duration: 0.7, ease: "power3.in" }, sc.T(t + 2.35));
        sc.tl.set(dark, { opacity: 0 }, sc.T(t + 3.1));
        sc.sfx("whoosh", t + 2.35);
        return t + 3.1;
      }
      default: console.warn("Stickman Kino: unknown intro", style); return t;
    }
  };

  // ================================================================ OUTROS
  S.outro = function (style, o) {
    o = o || {}; this._titled = true; const sc = this, t = o.t || 0, u = sc.u, W = sc.W, H = sc.H, portrait = H > W;
    switch (style) {
      // logo + title + tagline + CTA button + url
      case "cta": {
        let y = portrait ? H * 0.3 : H * 0.26;
        if (o.logo !== false) { const L = logoThing(sc, o.logo, sc.cx, y, (o.logoSize || 190) * u); L.pop(t, 0.5, { ease: "back.out(2.4)" }); y += (o.logoSize || 190) * u * 0.62 + 60 * u; }
        const title = sc.text(o.title || "Thanks for watching", { x: sc.cx, y, size: o.size || 110, accent: o.accent || "a1", width: portrait ? W * 0.9 : undefined }); title.in(t + 0.25, "rise");
        y += (o.size || 110) * u * 0.8;
        if (o.tagline) sc.text(o.tagline, { x: sc.cx, y, size: o.taglineSize || 44, font: "body", weight: 600, color: "muted", width: portrait ? W * 0.86 : undefined }).in(t + 0.55, "fade");
        y += 110 * u;
        let end = t + 1.2;
        if (o.cta) { const b = pill(sc, o.cta, sc.cx, y, { fill: o.ctaColor || "a1", size: o.ctaSize || 46 }); b.pop(t + 0.85, 0.4); for (let k = 0; k < (o.pulses == null ? 3 : o.pulses); k++) b.pulse(t + 1.6 + k * 0.9, 1.08); y += 130 * u; end = t + 1.4; sc.sfx("pop", t + 0.85); }
        if (o.url) sc.text(o.url, { x: sc.cx, y, size: o.urlSize || 36, font: "mono", weight: 600, color: o.urlColor || "a2" }).in(t + 1.1, "type", 0.03);
        if (o.confetti) sc.fx.confetti(sc.cx, H * 0.3, t + 0.3, { n: 40, layer: "ui" });
        return end;
      }
      // rolling credits
      case "credits": {
        const lines = o.credits || [["Directed by", "your AI agent"], ["Animated with", "Stickman Kino"]], gap = (o.gap || 120) * u, d = o.d || 6;
        if (o.bg !== false) cover(sc, o.bg ? sc.col(o.bg) : sc.theme.ink, sc.layer("ui"));
        const fg = o.color || (o.bg === false ? "ink" : "bg");
        const roll = SM.div("sm-credits", sc.ui, { position: "absolute", left: "0px", top: "0px", width: W + "px" });
        lines.forEach((l, i) => {
          const row = SM.div("", roll, { position: "absolute", left: "0px", width: W + "px", top: (i * gap) + "px", textAlign: "center", fontFamily: "var(--sm-font)", color: sc.col(fg) });
          const a = SM.div("", row, { fontSize: 30 * u + "px", fontWeight: 500, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.12em" }); a.textContent = l[0];
          const b = SM.div("", row, { fontSize: 54 * u + "px", fontWeight: 800 }); b.textContent = l[1] || "";
        });
        const total = lines.length * gap;
        gsap.set(roll, { y: H + 40 * u });
        sc.tl.to(roll, { y: H * 0.42 - total, duration: d, ease: "none" }, sc.T(t));
        if (o.title) { const tt = sc.text(o.title, { x: sc.cx, y: H * 0.78, size: o.size || 96, color: fg === "bg" ? sc.theme.bg : undefined, accent: "a1" }); tt.in(t + d - 1.2, "pop"); }
        return t + d;
      }
      // YouTube-style end screen: two "watch next" tiles + subscribe
      case "endcard": {
        const tw = (portrait ? W * 0.78 : W * 0.34), th = tw * 9 / 16;
        const pos = portrait ? [[sc.cx, H * 0.3], [sc.cx, H * 0.56]] : [[W * 0.3, H * 0.42], [W * 0.7, H * 0.42]];
        sc.text(o.title || "Watch next", { x: sc.cx, y: portrait ? H * 0.1 : H * 0.12, size: o.size || 84 }).in(t, "rise");
        pos.forEach(([x, y], i) => {
          const g = SM.el("g", {}, sc.layer("ui"));
          SM.el("rect", { x: -tw / 2, y: -th / 2, width: tw, height: th, rx: 22 * u, fill: sc.theme.soft, stroke: sc.theme.ink, "stroke-width": 6 * u }, g);
          const ig = SM.el("g", {}, g); SM.drawProp("play", ig, { sc, size: th * 0.42 });
          if (o.videos && o.videos[i]) { const tt = SM.el("text", { x: 0, y: th / 2 + 44 * u, "text-anchor": "middle", "font-family": "var(--sm-font)", "font-weight": 700, "font-size": 34 * u, fill: sc.theme.ink }, g); tt.textContent = o.videos[i]; }
          const th2 = new SM.Thing(sc, g, { x, y, hidden: true }); th2.pop(t + 0.3 + i * 0.2, 0.45);
        });
        const sub = pill(sc, o.cta || "Subscribe", sc.cx, portrait ? H * 0.78 : H * 0.8, { fill: o.ctaColor || "a1" }); sub.pop(t + 0.8, 0.4); sub.pulse(t + 1.8); sub.pulse(t + 2.8);
        sc.sfx("pop", t + 0.8);
        return t + 1.3;
      }
      // "Made with Stickman Kino" sting
      case "kino": {
        const L = logoThing(sc, "kino", sc.cx, portrait ? H * 0.34 : H * 0.3, (o.logoSize || 170) * u); L.pop(t, 0.5, { ease: "back.out(2.4)" });
        sc.fx.sparkle(sc.cx, portrait ? H * 0.34 : H * 0.3, t + 0.3, { n: 6, spread: 130, layer: "ui" });
        sc.text(o.kicker || "made with", { x: sc.cx, y: portrait ? H * 0.43 : H * 0.47, size: 34, font: "body", weight: 700, upper: true, color: "muted" }).in(t + 0.3, "fade");
        sc.text(o.title || "Stickman [Kino]", { x: sc.cx, y: portrait ? H * 0.49 : H * 0.56, size: o.size || 104, accent: "a1" }).in(t + 0.4, "rise");
        sc.text(o.tagline || "100% code · open source · free", { x: sc.cx, y: portrait ? H * 0.55 : H * 0.65, size: 40, font: "body", weight: 600, color: "muted" }).in(t + 0.7, "fade");
        let e = t + 1.2;
        if (o.cta !== false) { const b = pill(sc, o.cta || "★  Star on GitHub", sc.cx, portrait ? H * 0.64 : H * 0.77, { fill: o.ctaColor || "ink", size: 40 }); b.pop(t + 1.0, 0.4); b.pulse(t + 1.9, 1.08); b.pulse(t + 2.9, 1.08); e = t + 1.4; }
        if (o.url) sc.text(o.url, { x: sc.cx, y: portrait ? H * 0.71 : H * 0.89, size: 34, font: "mono", weight: 600, color: "a2" }).in(t + 1.3, "type", 0.03);
        return e;
      }
      default: console.warn("Stickman Kino: unknown outro", style); return t;
    }
  };
  SM.intros = ["countdown", "clapper", "logo", "spotlight"];
  SM.outros = ["cta", "credits", "endcard", "kino"];
})(typeof window !== "undefined" ? window : globalThis);
