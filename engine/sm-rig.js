/*!
 * Stickman Kino - the stickman rig
 * Bone hierarchy (HTML divs, GSAP rotation), 40+ poses, gait cycles, 2-link arm IK,
 * faces + emotions, outfits/hats/hair, props in hand, and a library of actions.
 * Angles are ABSOLUTE degrees for a figure facing right: 0 = forward, 90 = down, -90 = up, 180 = back.
 * Every action takes LOCAL scene time and returns the local time it ends (chainable).
 */
(function (root) {
  "use strict";
  const SM = root.SM; if (!SM) throw new Error("load sm-core.js first");
  const R = SM.R;

  // ----------------------------------------------------------------- poses
  const POSES = SM.poses = {
    stand:     { T: -90, uaL: 98, faL: 94, uaR: 82, faR: 86, thL: 94, shL: 92, thR: 86, shR: 88 },
    idle:      { T: -91, uaL: 100, faL: 96, uaR: 84, faR: 90, thL: 96, shL: 93, thR: 84, shR: 87 },
    // walk cycle (contact / passing)
    walkA:     { T: -88, uaL: 120, faL: 102, uaR: 60, faR: 48, thL: 66, shL: 84, thR: 114, shR: 122 },
    walkPA:    { T: -90, uaL: 96, faL: 88, uaR: 84, faR: 74, thL: 91, shL: 90, thR: 78, shR: 138 },
    walkB:     { T: -88, uaL: 60, faL: 48, uaR: 120, faR: 102, thL: 114, shL: 122, thR: 66, shR: 84 },
    walkPB:    { T: -90, uaL: 84, faL: 74, uaR: 96, faR: 88, thL: 78, shL: 138, thR: 91, shR: 90 },
    // run cycle
    runA:      { T: -72, uaL: 140, faL: 62, uaR: 30, faR: -48, thL: 46, shL: 96, thR: 128, shR: 168 },
    runPA:     { T: -74, uaL: 100, faL: 14, uaR: 74, faR: 0, thL: 92, shL: 104, thR: 64, shR: 150 },
    runB:      { T: -72, uaL: 30, faL: -48, uaR: 140, faR: 62, thL: 128, shL: 168, thR: 46, shR: 96 },
    runPB:     { T: -74, uaL: 74, faL: 0, uaR: 100, faR: 14, thL: 64, shL: 150, thR: 92, shR: 104 },
    // sneak (crouched walk)
    sneakA:    { T: -62, H: -80, uaL: 40, faL: -30, uaR: 20, faR: -40, thL: 40, shL: 110, thR: 120, shR: 130 },
    sneakB:    { T: -62, H: -80, uaL: 30, faL: -40, uaR: 30, faR: -30, thL: 110, shL: 130, thR: 40, shR: 110 },
    // jumping / climbing
    crouch:    { T: -76, uaL: 134, faL: 112, uaR: 122, faR: 100, thL: 32, shL: 128, thR: 44, shR: 134 },
    leap:      { T: -94, uaL: -128, faL: -138, uaR: -56, faR: -46, thL: 72, shL: 118, thR: 104, shR: 142 },
    tuck:      { T: -84, uaL: 40, faL: -40, uaR: 30, faR: -50, thL: 10, shL: 120, thR: 20, shR: 128 },
    climbA:    { T: -88, uaL: -96, faL: -78, uaR: -58, faR: -66, thL: 38, shL: 112, thR: 96, shR: 94 },
    climbB:    { T: -88, uaL: -58, faL: -66, uaR: -96, faR: -78, thL: 96, shL: 94, thR: 38, shR: 112 },
    hang:      { T: -90, uaL: -96, faL: -92, uaR: -84, faR: -88, thL: 96, shL: 100, thR: 84, shR: 92 },
    // sitting / lying
    sit:       { T: -92, uaL: 96, faL: 30, uaR: 88, faR: 22, thL: -2, shL: 88, thR: 3, shR: 92 },
    sitEdge:   { T: -88, uaL: 112, faL: 96, uaR: 70, faR: 80, thL: -4, shL: 96, thR: 4, shR: 84 },
    slump:     { T: -56, H: -30, uaL: 104, faL: 92, uaR: 70, faR: 84, thL: -2, shL: 88, thR: 4, shR: 92 },
    sitFloor:  { T: -98, uaL: 122, faL: 112, uaR: 116, faR: 104, thL: -4, shL: -2, thR: 2, shR: 0 },
    relax:     { T: -102, H: -108, uaL: 128, faL: 104, uaR: 112, faR: 96, thL: -3, shL: 84, thR: 5, shR: 90 },
    meditate:  { T: -90, H: -90, uaL: 70, faL: 10, uaR: 60, faR: 0, thL: 18, shL: 168, thR: 12, shR: 172 },
    kneel:     { T: -90, uaL: 100, faL: 92, uaR: 80, faR: 84, thL: 0, shL: 90, thR: 90, shR: 180 },
    lie:       { T: 180, H: 180, uaL: 172, faL: 178, uaR: 166, faR: 176, thL: 0, shL: 2, thR: -3, shR: 0 },
    lieFront:  { T: 0, H: 10, uaL: 10, faL: 2, uaR: 16, faR: 6, thL: 180, shL: 182, thR: 177, shR: 179 },
    // gestures
    point:     { T: -90, H: -88, uaL: 100, faL: 96, uaR: -4, faR: -6, thL: 94, shL: 92, thR: 86, shR: 88 },
    pointUp:   { T: -90, H: -100, uaL: 100, faL: 96, uaR: -58, faR: -72, thL: 94, shL: 92, thR: 86, shR: 88 },
    present:   { T: -92, H: -92, uaL: 100, faL: 96, uaR: -26, faR: -14, thL: 96, shL: 92, thR: 82, shR: 88 },
    waveA:     { T: -90, H: -92, uaL: 100, faL: 96, uaR: -58, faR: -124, thL: 94, shL: 92, thR: 86, shR: 88 },
    waveB:     { T: -90, H: -92, uaL: 100, faL: 96, uaR: -58, faR: -64, thL: 94, shL: 92, thR: 86, shR: 88 },
    cheer:     { T: -92, H: -100, uaL: -130, faL: -125, uaR: -50, faR: -55, thL: 98, shL: 94, thR: 82, shR: 86 },
    think:     { T: -88, H: -100, uaL: 64, faL: 10, uaR: 56, faR: -128, thL: 94, shL: 92, thR: 86, shR: 88 },
    shrug:     { T: -90, H: -86, uaL: 128, faL: 196, uaR: 52, faR: -16, thL: 94, shL: 92, thR: 86, shR: 88 },
    handsHips: { T: -91, H: -92, uaL: 140, faL: 44, uaR: 40, faR: 136, thL: 100, shL: 94, thR: 80, shR: 86 },
    armsCross: { T: -90, H: -92, uaL: 72, faL: -6, uaR: 64, faR: -14, thL: 96, shL: 92, thR: 84, shR: 88 },
    facepalm:  { T: -84, H: -64, uaL: 100, faL: 94, uaR: 30, faR: -112, thL: 94, shL: 92, thR: 86, shR: 88 },
    sad:       { T: -82, H: -55, uaL: 94, faL: 92, uaR: 88, faR: 90, thL: 94, shL: 92, thR: 86, shR: 88 },
    surprise:  { T: -94, H: -104, uaL: -150, faL: -170, uaR: -30, faR: -10, thL: 100, shL: 94, thR: 80, shR: 86 },
    scared:    { T: -100, H: -110, uaL: 40, faL: -80, uaR: 20, faR: -96, thL: 104, shL: 100, thR: 80, shR: 90 },
    thumbsUp:  { T: -90, H: -94, uaL: 100, faL: 96, uaR: 40, faR: -70, thL: 94, shL: 92, thR: 86, shR: 88 },
    salute:    { T: -90, H: -90, uaL: 100, faL: 96, uaR: -18, faR: -146, thL: 96, shL: 92, thR: 84, shR: 88 },
    bow:       { T: -28, H: 0, uaL: 96, faL: 92, uaR: 84, faR: 88, thL: 92, shL: 92, thR: 88, shR: 88 },
    explainA:  { T: -90, H: -92, uaL: 104, faL: 70, uaR: 34, faR: -30, thL: 94, shL: 92, thR: 86, shR: 88 },
    explainB:  { T: -90, H: -88, uaL: 98, faL: 60, uaR: 56, faR: -46, thL: 94, shL: 92, thR: 86, shR: 88 },
    push:      { T: -58, H: -40, uaL: -14, faL: -6, uaR: -8, faR: -2, thL: 58, shL: 82, thR: 128, shR: 118 },
    pull:      { T: -112, H: -100, uaL: 14, faL: 2, uaR: 8, faR: -2, thL: 52, shL: 70, thR: 96, shR: 96 },
    carry:     { T: -92, H: -92, uaL: 62, faL: -18, uaR: 50, faR: -24, thL: 94, shL: 92, thR: 86, shR: 88 },
    lift:      { T: -92, H: -100, uaL: -118, faL: -100, uaR: -62, faR: -80, thL: 100, shL: 94, thR: 80, shR: 86 },
    windup:    { T: -100, H: -92, uaL: 40, faL: 20, uaR: -150, faR: -170, thL: 70, shL: 90, thR: 110, shR: 100 },
    release:   { T: -76, H: -84, uaL: 130, faL: 110, uaR: -6, faR: 4, thL: 64, shL: 86, thR: 116, shR: 110 },
    typing:    { T: -94, H: -86, uaL: 58, faL: 6, uaR: 50, faR: 0, thL: -2, shL: 88, thR: 3, shR: 92 },
    balance:   { T: -90, H: -92, uaL: 182, faL: 176, uaR: -2, faR: 4, thL: 92, shL: 92, thR: 88, shR: 88 },
    danceA:    { T: -96, H: -100, uaL: -150, faL: -120, uaR: 30, faR: 100, thL: 60, shL: 110, thR: 96, shR: 92 },
    danceB:    { T: -84, H: -80, uaL: 150, faL: 80, uaR: -30, faR: -70, thL: 92, shL: 92, thR: 120, shR: 70 },
    stumble:   { T: -50, H: -30, uaL: -40, faL: -10, uaR: -120, faR: -150, thL: 70, shL: 100, thR: 130, shR: 120 },
    victory:   { T: -94, H: -110, uaL: -132, faL: -140, uaR: -48, faR: -40, thL: 100, shL: 94, thR: 80, shR: 86 }
  };
  // poses whose hip sits lower than standing (fraction of leg length above ground)
  const HIP_FRACTION = { crouch: 0.72, tuck: 0.8, kneel: 0.5, sneakA: 0.82, sneakB: 0.82 };

  // ----------------------------------------------------------- character presets
  SM.characters = {
    classic:   {},
    filled:    { head: "filled" },
    zeke:      { hat: "beanie", hatColor: "#E63946", shirt: "#FFC531", shorts: "ink", face: "dots" },
    office:    { shirt: "#3B6FB6", tie: "#E63946", face: "dots" },
    exec:      { shirt: "#2B2D42", tie: "#F2B400", face: "dots", glasses: true },
    builder:   { hat: "hardhat", hatColor: "#FFB703", shirt: "#FB8500", face: "dots" },
    scientist: { glasses: true, shirt: "#FFFFFF", hair: "spiky", face: "dots" },
    grad:      { hat: "grad", face: "dots" },
    king:      { hat: "crown", hatColor: "#F2B400", face: "dots" },
    chef:      { hat: "chef", shirt: "#FFFFFF", face: "dots" },
    dress:     { dress: "#E63946", hair: "bun", face: "dots" },
    kid:       { height: 0.68, hat: "cap", hatColor: "#1D7FE0", face: "dots" },
    robot:     { head: "square", antenna: true, face: "dots" },
    agent:     { head: "square", antenna: true, face: "dots", color: "#1D7FE0" }
  };

  const norm = (a, ref) => a + 360 * Math.round((ref - a) / 360);

  // ----------------------------------------------------------------- Figure
  class Figure {
    constructor(sc, o) {
      o = Object.assign({}, SM.characters[o && o.character] || {}, o || {});
      this.sc = sc; this.o = o;
      const u = sc.u, th = sc.theme;
      const H = (o.size || 300 * u) * (o.height || 1);
      this.H = H;
      this.S = Math.max(3, (o.stroke || 0.03) * H * (H < 200 * u ? 1.15 : 1));
      this.L = { torso: 0.315 * H, sh: 0.29 * H, ua: 0.195 * H, fa: 0.185 * H, th: 0.24 * H, shin: 0.235 * H, head: 0.1 * H };
      this.legLen = this.L.th + this.L.shin;
      this.ink = o.color === "ink" || !o.color ? th.ink : o.color;
      this.paper = th.paper;
      this.speed = (o.speed || 240) * (H / 300);
      this.facing = o.facing === -1 || o.facing === "left" ? -1 : 1;
      this.x = o.x == null ? sc.W / 2 : o.x;
      this.g = o.y == null ? sc.groundY : o.y;
      this.hipY = this.g - this.legLen * 0.995;
      this.rel = {};
      this.moves = [];
      this._build();
      const p = this._pose(o.pose || "stand");
      this._applyNow(p);
      gsap.set(this.el, { x: this.x, y: this.hipY, scaleX: this.facing, transformOrigin: "0 0" });
      gsap.set([this.handR, this.handL], { scaleX: this.facing });
      if (o.hidden) gsap.set(this.el, { opacity: 0 });
      this.moves.push({ t0: -1e9, t1: -1e9, x0: this.x, x1: this.x });
      sc.figures.push(this);
    }
    // ---- construction
    _build() {
      const S = this.S, L = this.L, o = this.o, ink = this.ink;
      const fig = this.el = SM.div("sm-fig", this.sc.mid);
      fig.setAttribute("data-layout-allow-overflow", "");
      if (o.z != null) fig.style.zIndex = o.z;
      this.j = {};
      const bone = (parent, name, len, left) => {
        const b = SM.div("sm-bone", parent, { left: (left || 0) + "px", top: "0px", width: len + "px" });
        b.setAttribute("data-layout-allow-overflow", "");
        this.j[name] = b; b._len = len; return b;
      };
      const limb = (b, color, w, from, to) => {
        const len = b._len; w = w || S; from = from == null ? 0 : from; to = to == null ? 1 : to;
        return SM.div("sm-limb", b, { left: (len * from - w / 2) + "px", top: (-w / 2) + "px", width: (len * (to - from) + w) + "px", height: w + "px", borderRadius: (w / 2) + "px", background: color || ink });
      };
      const cloth = (b, color, w, from, to, outline) => {
        const d = limb(b, color, w, from, to);
        d.style.borderRadius = (w * 0.38) + "px";
        if (outline || color === "#FFFFFF" || color === this.paper) d.style.boxShadow = `inset 0 0 0 ${Math.max(2, S * 0.4)}px ${ink}`;
        return d;
      };
      const col = c => (c === "ink" ? ink : c);
      // back leg
      const thL = bone(fig, "thL", L.th); limb(thL); const shL = bone(thL, "shL", L.shin, L.th); limb(shL);
      if (o.shorts) cloth(thL, col(o.shorts), S * 2.4, 0, 0.45);
      // torso + back arm + head
      const torso = bone(fig, "T", L.torso);
      const uaL = bone(torso, "uaL", L.ua, L.sh); limb(uaL); const faL = bone(uaL, "faL", L.fa, L.ua); limb(faL);
      if (o.shirt) cloth(uaL, col(o.shirt), S * 2.2, 0, 0.42);
      this.handL = SM.div("sm-hand", faL, { left: L.fa + "px", top: "0px" });
      limb(torso);
      if (o.shirt) cloth(torso, col(o.shirt), S * 3.4, 0.04, 0.93);
      if (o.tie) { const t = SM.div("sm-tie", torso, { left: (L.torso * 0.5) + "px", top: (S * 0.9) + "px", width: (L.torso * 0.4) + "px", height: (S * 0.9) + "px", background: col(o.tie), borderRadius: S * 0.3 + "px" }); }
      const neck = bone(torso, "H", L.head * 2, L.torso + S * 0.15);
      this._buildHead(neck);
      // front leg (after torso so it overlaps the shirt hem nicely)
      const thR = bone(fig, "thR", L.th); limb(thR); const shR = bone(thR, "shR", L.shin, L.th); limb(shR);
      if (o.shorts) cloth(thR, col(o.shorts), S * 2.4, 0, 0.45);
      if (o.dress) {
        const dw = this.H * 0.17, dh = L.th * 0.95, top = -L.torso * 0.28;
        const svg = SM.el("svg", { class: "sm-dress", width: 1, height: 1, overflow: "visible", style: "position:absolute;left:0;top:0;overflow:visible" }, fig);
        SM.el("path", { d: `M${-dw * 0.32},${top} L${dw * 0.32},${top} L${dw * 0.62},${top + dh} L${-dw * 0.62},${top + dh} Z`, fill: col(o.dress), stroke: ink, "stroke-width": S * 0.6, "stroke-linejoin": "round" }, svg);
      }
      // front arm (last = on top)
      const uaR = bone(torso, "uaR", L.ua, L.sh); limb(uaR); const faR = bone(uaR, "faR", L.fa, L.ua); limb(faR);
      if (o.shirt) cloth(uaR, col(o.shirt), S * 2.2, 0, 0.42);
      this.handR = SM.div("sm-hand", faR, { left: L.fa + "px", top: "0px" });
      for (const k in this.j) gsap.set(this.j[k], { transformOrigin: "0 0" });
    }
    _buildHead(neck) {
      const r = this.L.head, S = this.S, o = this.o, ink = this.ink, paper = this.paper;
      const box = SM.div("sm-headbox", neck, { left: "0px", top: (-r) + "px", width: 2 * r + "px", height: 2 * r + "px", transform: "rotate(90deg)" });
      const svg = SM.el("svg", { width: 2 * r, height: 2 * r, viewBox: `${-r} ${-r} ${2 * r} ${2 * r}`, overflow: "visible", style: "overflow:visible;position:absolute;left:0;top:0" }, box);
      this.headSvg = svg;
      const hatCol = o.hatColor || this.sc.theme.accents[0];
      // hair behind head
      if (o.hair === "bun") SM.el("circle", { cx: -r * 0.75, cy: -r * 0.7, r: r * 0.38, fill: ink }, svg);
      if (o.hair === "ponytail") SM.el("path", { d: `M${-r * 0.8},${-r * 0.4} q${-r * 0.9},${r * 0.2} ${-r * 0.6},${r * 1.2}`, fill: "none", stroke: ink, "stroke-width": S * 1.6, "stroke-linecap": "round" }, svg);
      if (o.head === "square") {
        SM.el("rect", { x: -r + S / 2, y: -r + S / 2, width: 2 * r - S, height: 2 * r - S, rx: r * 0.25, fill: paper, stroke: ink, "stroke-width": S }, svg);
        if (o.antenna) { SM.el("line", { x1: 0, y1: -r, x2: 0, y2: -r * 1.55, stroke: ink, "stroke-width": S * 0.7, "stroke-linecap": "round" }, svg); SM.el("circle", { cx: 0, cy: -r * 1.65, r: r * 0.18, fill: this.sc.theme.accents[1] }, svg); }
      } else {
        SM.el("circle", { cx: 0, cy: 0, r: r - S / 2, fill: o.head === "filled" ? ink : paper, stroke: ink, "stroke-width": S }, svg);
      }
      if (o.hair === "spiky") SM.el("path", { d: `M${-r * 0.9},${-r * 0.45} l${r * 0.15},${-r * 0.75} l${r * 0.3},${r * 0.4} l${r * 0.25},${-r * 0.65} l${r * 0.28},${r * 0.55} l${r * 0.3},${-r * 0.55} l${r * 0.2},${r * 0.75}`, fill: "none", stroke: ink, "stroke-width": S * 0.8, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
      if (o.hair === "bob") SM.el("path", { d: `M${-r * 1.05},${r * 0.3} A${r * 1.05},${r * 1.05} 0 1 1 ${r * 0.7},${-r * 0.75} Q${0},${-r * 0.55} ${-r * 0.45},${r * 0.35} Z`, fill: ink }, svg);
      // face
      this.faceEls = null;
      if (o.face === "dots" && o.head !== "filled") {
        const e1 = SM.el("circle", { cx: r * 0.16, cy: -r * 0.12, r: r * 0.12, fill: ink }, svg);
        const e2 = SM.el("circle", { cx: r * 0.56, cy: -r * 0.12, r: r * 0.12, fill: ink }, svg);
        const m = SM.el("path", { d: this._mouth("happy"), fill: "none", stroke: ink, "stroke-width": S * 0.55, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
        gsap.set([e1, e2], { transformOrigin: "50% 50%" });
        this.faceEls = { e1, e2, m };
      }
      if (o.glasses) {
        const g = { fill: "none", stroke: ink, "stroke-width": S * 0.45 };
        SM.el("circle", Object.assign({ cx: r * 0.16, cy: -r * 0.12, r: r * 0.24 }, g), svg); SM.el("circle", Object.assign({ cx: r * 0.66, cy: -r * 0.12, r: r * 0.24 }, g), svg);
        SM.el("line", Object.assign({ x1: r * 0.4, y1: -r * 0.12, x2: r * 0.42, y2: -r * 0.12 }, g), svg);
      }
      // hats (drawn over the head)
      const hs = { stroke: ink, "stroke-width": S * 0.7, "stroke-linejoin": "round" };
      switch (o.hat) {
        case "beanie": SM.el("path", Object.assign({ d: `M${-r * 1.06},${-r * 0.12} A${r * 1.06},${r * 1.06} 0 0 1 ${r * 1.06},${-r * 0.12} Z`, fill: hatCol }, hs), svg); SM.el("rect", Object.assign({ x: -r * 1.12, y: -r * 0.32, width: r * 2.24, height: r * 0.32, rx: r * 0.12, fill: hatCol }, hs), svg); break;
        case "cap": SM.el("path", Object.assign({ d: `M${-r * 1.0},${-r * 0.25} A${r * 1.02},${r * 1.0} 0 0 1 ${r * 1.0},${-r * 0.25} Z`, fill: hatCol }, hs), svg); SM.el("path", Object.assign({ d: `M${r * 0.5},${-r * 0.28} L${r * 1.65},${-r * 0.2} Q${r * 1.5},${r * 0.02} ${r * 0.6},${-r * 0.08} Z`, fill: hatCol }, hs), svg); break;
        case "hardhat": SM.el("path", Object.assign({ d: `M${-r * 0.95},${-r * 0.3} A${r * 0.98},${r * 1.0} 0 0 1 ${r * 0.95},${-r * 0.3} Z`, fill: hatCol }, hs), svg); SM.el("rect", Object.assign({ x: -r * 1.35, y: -r * 0.38, width: r * 2.7, height: r * 0.2, rx: r * 0.1, fill: hatCol }, hs), svg); break;
        case "tophat": SM.el("rect", Object.assign({ x: -r * 0.62, y: -r * 2.05, width: r * 1.24, height: r * 1.3, rx: r * 0.08, fill: ink }, hs), svg); SM.el("rect", Object.assign({ x: -r * 1.15, y: -r * 0.85, width: r * 2.3, height: r * 0.2, rx: r * 0.1, fill: ink }, hs), svg); break;
        case "crown": SM.el("path", Object.assign({ d: `M${-r * 0.75},${-r * 0.7} L${-r * 0.85},${-r * 1.55} L${-r * 0.4},${-r * 1.1} L0,${-r * 1.7} L${r * 0.4},${-r * 1.1} L${r * 0.85},${-r * 1.55} L${r * 0.75},${-r * 0.7} Z`, fill: hatCol }, hs), svg); break;
        case "grad": SM.el("path", Object.assign({ d: `M${-r * 1.4},${-r * 0.95} L0,${-r * 1.45} L${r * 1.4},${-r * 0.95} L0,${-r * 0.5} Z`, fill: ink }, hs), svg); SM.el("path", { d: `M${r * 0.9},${-r * 0.95} L${r * 1.1},${-r * 0.2}`, stroke: hatCol, "stroke-width": S * 0.6, "stroke-linecap": "round" }, svg); break;
        case "chef": SM.el("path", Object.assign({ d: `M${-r * 0.7},${-r * 0.6} C${-r * 1.5},${-r * 1.2} ${-r * 0.6},${-r * 2.2} 0,${-r * 1.7} C${r * 0.6},${-r * 2.2} ${r * 1.5},${-r * 1.2} ${r * 0.7},${-r * 0.6} Z`, fill: "#FFFFFF" }, hs), svg); break;
        case "beret": SM.el("ellipse", Object.assign({ cx: -r * 0.1, cy: -r * 0.8, rx: r * 1.05, ry: r * 0.38, fill: hatCol }, hs), svg); break;
        case "party": SM.el("path", Object.assign({ d: `M${-r * 0.55},${-r * 0.75} L${r * 0.1},${-r * 2.1} L${r * 0.6},${-r * 0.7} Z`, fill: hatCol }, hs), svg); SM.el("circle", { cx: r * 0.1, cy: -r * 2.15, r: r * 0.2, fill: this.sc.theme.accents[2] }, svg); break;
      }
    }
    _mouth(e) {
      const r = this.L.head, x0 = r * 0.12, x1 = r * 0.62, y = r * 0.38;
      switch (e) {
        case "sad": return `M${x0},${y + r * 0.12} Q${(x0 + x1) / 2},${y - r * 0.14} ${x1},${y + r * 0.12}`;
        case "neutral": return `M${x0 + r * 0.05},${y} L${x1 - r * 0.05},${y}`;
        case "surprised": return `M${(x0 + x1) / 2 - r * 0.12},${y} a${r * 0.12},${r * 0.14} 0 1 0 ${r * 0.24},0 a${r * 0.12},${r * 0.14} 0 1 0 ${-r * 0.24},0`;
        case "grin": return `M${x0},${y - r * 0.04} Q${(x0 + x1) / 2},${y + r * 0.32} ${x1},${y - r * 0.04} Z`;
        case "worried": return `M${x0},${y + r * 0.06} q${r * 0.12},${-r * 0.1} ${r * 0.25},0 t${r * 0.25},0`;
        default: return `M${x0},${y - r * 0.02} Q${(x0 + x1) / 2},${y + r * 0.2} ${x1},${y - r * 0.02}`; // happy
      }
    }
    // ---- pose math
    _pose(p, over) { const base = typeof p === "string" ? POSES[p] : p; if (!base) throw new Error("unknown pose " + p); const q = Object.assign({}, base, over || {}); if (q.H == null) q.H = q.T; return q; }
    _rel(p) {
      return { T: p.T, H: p.H - p.T, uaL: p.uaL - p.T, faL: p.faL - p.uaL, uaR: p.uaR - p.T, faR: p.faR - p.uaR, thL: p.thL, shL: p.shL - p.thL, thR: p.thR, shR: p.shR - p.thR };
    }
    _applyNow(p) {
      const r = this._rel(p);
      for (const k in r) { gsap.set(this.j[k], { rotation: r[k] }); this.rel[k] = r[k]; }
      gsap.set(this.handR, { rotation: -p.faR }); gsap.set(this.handL, { rotation: -p.faL });
      this.relHandR = -p.faR; this.relHandL = -p.faL;
      this.p = p;
    }
    // tween to a pose. p: name | object; over: overrides
    pose(p, t, d, ease, over) {
      const q = this._pose(p, over), r = this._rel(q), tl = this.sc.tl, T = this.sc.T(t);
      d = d == null ? 0.3 : d; ease = ease || "sine.inOut";
      for (const k in r) {
        const v = norm(r[k], this.rel[k]);
        if (d) tl.to(this.j[k], { rotation: v, duration: d, ease }, T); else tl.set(this.j[k], { rotation: v }, T);
        this.rel[k] = v;
      }
      const hr = norm(-q.faR, this.relHandR), hl = norm(-q.faL, this.relHandL);
      if (d) { tl.to(this.handR, { rotation: hr, duration: d, ease }, T); tl.to(this.handL, { rotation: hl, duration: d, ease }, T); }
      else { tl.set(this.handR, { rotation: hr }, T); tl.set(this.handL, { rotation: hl }, T); }
      this.relHandR = hr; this.relHandL = hl;
      this.p = q;
      return t + d;
    }
    _hipFor(name) { return this.g - this.legLen * (HIP_FRACTION[name] || 0.995); }
    // ---- placement / root motion
    place(x, g) { if (x != null) this.x = x; if (g != null) { this.g = g; } this.hipY = this.g - this.legLen * 0.995; gsap.set(this.el, { x: this.x, y: this.hipY }); this.moves.push({ t0: -1e9, t1: -1e9, x0: this.x, x1: this.x }); return this; }
    face(dir, t) {
      dir = dir === "left" || dir === -1 ? -1 : 1; if (dir === this.facing) return t || 0;
      this.facing = dir;
      if (t == null) { gsap.set(this.el, { scaleX: dir }); gsap.set([this.handR, this.handL], { scaleX: dir }); }
      else { this.sc.tl.set(this.el, { scaleX: dir }, this.sc.T(t)); this.sc.tl.set([this.handR, this.handL], { scaleX: dir }, this.sc.T(t)); }
      return t || 0;
    }
    turn(t) { return this.face(-this.facing, t); }
    _root(vars, t, d, ease) { vars.duration = d; vars.ease = ease || "power2.inOut"; if (d) this.sc.tl.to(this.el, vars, this.sc.T(t)); else this.sc.tl.set(this.el, vars, this.sc.T(t)); }
    _recordX(t0, t1, x1) { this.moves.push({ t0, t1, x0: this.x, x1 }); this.x = x1; }
    xAt(t) { let x = this.moves[0].x0; for (const m of this.moves) { if (t >= m.t1) x = m.x1; else if (t >= m.t0) { x = SM.lerp(m.x0, m.x1, (t - m.t0) / Math.max(1e-6, m.t1 - m.t0)); break; } else break; } return x; }
    moveTo(x, t, d, ease) { d = d == null ? 0.6 : d; this._root({ x }, t, d, ease); this._recordX(t, t + d, x); return t + d; }
    moveXY(x, hipY, t, d, ease) { d = d == null ? 0.6 : d; this._root({ x, y: hipY }, t, d, ease); this._recordX(t, t + d, x); this.hipY = hipY; return t + d; }
    // ---- locomotion
    _gait(x1, t, o, cycle, speed, stepK, bob) {
      o = o || {}; const dx = x1 - this.x; if (Math.abs(dx) < 1) return t;
      if (o.face !== false) this.face(dx > 0 ? 1 : -1, t);
      const d = o.d || Math.abs(dx) / (o.speed || speed);
      const step = this.legLen * stepK;           // ground distance per phase pair
      let pd = step / (2 * (Math.abs(dx) / d)); pd = SM.clamp(pd, 0.11, 0.4);
      const n = Math.max(2, Math.round(d / pd)); pd = d / n;
      for (let i = 0; i < n; i++) this.pose(cycle[i % 4], t + i * pd, pd, "sine.inOut");
      const kf = []; const hip = this.hipY;
      for (let i = 0; i < n; i++) kf.push({ y: hip + (i % 2 ? -bob * 0.6 : bob), duration: pd, ease: "sine.inOut" });
      kf.push({ y: hip, duration: 0.15 });
      this.sc.tl.to(this.el, { x: x1, duration: d, ease: "none" }, this.sc.T(t));
      this.sc.tl.to(this.el, { keyframes: kf }, this.sc.T(t));
      this._recordX(t, t + d, x1);
      const end = t + d;
      if (o.end !== false) this.pose(o.endPose || "stand", end, 0.22);
      return end + (o.end !== false ? 0.22 : 0);
    }
    walkTo(x, t, o) { return this._gait(x, t, o, ["walkA", "walkPA", "walkB", "walkPB"], this.speed, 0.62, 4 * this.H / 300); }
    runTo(x, t, o) { return this._gait(x, t, o, ["runA", "runPA", "runB", "runPB"], this.speed * 2.3, 1.15, 9 * this.H / 300); }
    sneakTo(x, t, o) { o = Object.assign({ endPose: "stand" }, o); const h0 = this.hipY; this.hipY = this._hipFor("sneakA"); this._root({ y: this.hipY }, t, 0.2); const e = this._gait(x, t + 0.2, o, ["sneakA", "sneakB", "sneakA", "sneakB"], this.speed * 0.55, 0.5, 2); this.hipY = h0; this._root({ y: h0 }, e - 0.22, 0.22); return e; }
    walk(dx, t, o) { return this.walkTo(this.x + dx * this.facing, t, o); }
    jumpTo(x, g, t, o) {
      o = o || {}; if (g == null) g = this.g; const d = o.d || 0.75, h = o.h == null ? this.H * 0.45 : o.h;
      if (x !== this.x) this.face(x > this.x ? 1 : -1, t);
      const crouchHip = this.hipY + this.legLen * 0.22;
      this.pose("crouch", t, 0.16); this._root({ y: crouchHip }, t, 0.16, "power1.out");
      const t1 = t + 0.16, x0 = this.x, y0 = this.hipY, y1 = g - this.legLen * 0.995, n = 12, kf = [];
      for (let i = 1; i <= n; i++) { const u = i / n; kf.push({ x: SM.lerp(x0, x, u), y: SM.lerp(y0, y1, u) - 4 * h * u * (1 - u), duration: d / n, ease: "none" }); }
      this.sc.tl.to(this.el, { keyframes: kf }, this.sc.T(t1));
      this.pose(o.tuck ? "tuck" : "leap", t1, d * 0.35, "power2.out");
      this.pose("stand", t1 + d * 0.6, d * 0.4);
      this._recordX(t1, t1 + d, x); this.g = g; this.hipY = y1;
      const tl2 = t1 + d;
      this.pose("crouch", tl2, 0.1); this._root({ y: y1 + this.legLen * 0.15 }, tl2, 0.1, "power2.out");
      this.pose("stand", tl2 + 0.1, 0.22); this._root({ y: y1 }, tl2 + 0.1, 0.22, "power2.out");
      if (o.puff !== false && SM.fx && this.sc.fx) this.sc.fx.puff(x, g, tl2);
      return tl2 + 0.32;
    }
    hop(t, h) { return this.jumpTo(this.x, this.g, t, { h: h || this.H * 0.25, d: 0.45, puff: false }); }
    climbTo(g, t, d) {
      d = d || Math.abs(g - this.g) / (this.H * 0.75); const n = Math.max(2, Math.round(d / 0.32)), pd = d / n;
      for (let i = 0; i < n; i++) this.pose(i % 2 ? "climbA" : "climbB", t + i * pd, pd);
      const y1 = g - this.legLen * 0.995; this._root({ y: y1 }, t, d, "sine.inOut"); this.g = g; this.hipY = y1;
      return t + d;
    }
    sit(t, seatY, o) {
      o = o || {}; const d = o.d || 0.45, name = o.pose || "sit";
      const hip = (seatY == null ? this.g - this.L.shin * 0.98 : seatY) - this.S * 0.6;
      this.pose(name, t, d); this._root({ y: hip }, t, d, "power2.out"); this.hipY = hip; this.seated = true;
      return t + d;
    }
    sitFloor(t, d) { const hip = this.g - this.S * 0.8; this.pose("sitFloor", t, d || 0.5); this._root({ y: hip }, t, d || 0.5); this.hipY = hip; return t + (d || 0.5); }
    standUp(t, g, d) { d = d || 0.45; if (g != null) this.g = g; const hip = this.g - this.legLen * 0.995; this.pose("stand", t, d); this._root({ y: hip }, t, d, "power2.out"); this.hipY = hip; this.seated = false; return t + d; }
    kneel(t, d) { d = d || 0.4; const hip = this.g - this.L.th * 0.98; this.pose("kneel", t, d); this._root({ y: hip }, t, d); this.hipY = hip; return t + d; }
    lie(t, d) { d = d || 0.6; const hip = this.g - this.S * 0.7; this.pose("lie", t, d); this._root({ y: hip }, t, d, "power2.in"); this.hipY = hip; return t + d; }
    fall(t, o) {
      o = o || {}; this.pose("stumble", t, 0.25, "power2.out");
      const hip = this.g - this.S * 0.7; this.pose("lieFront", t + 0.25, 0.4, "power2.in"); this._root({ y: hip }, t + 0.25, 0.4, "power2.in"); this.hipY = hip;
      if (SM.fx && this.sc.fx) this.sc.fx.puff(this.x + this.facing * this.H * 0.3, this.g, t + 0.62, { n: 7 });
      return t + 0.7;
    }
    getUp(t) { this.pose("kneel", t, 0.35); this._root({ y: this.g - this.L.th * 0.98 }, t, 0.35); return this.standUp(t + 0.35); }
    // ---- arms: IK / FK
    shoulder(p) { p = p || this.p; return { x: this.L.sh * Math.cos(p.T * R), y: this.L.sh * Math.sin(p.T * R) }; }
    _toLocal(tx, ty) { return { x: (tx - this.x) * this.facing, y: ty - this.hipY }; }
    _toWorld(lx, ly) { return { x: this.x + lx * this.facing, y: this.hipY + ly }; }
    handPos(arm, p) {
      p = p || this.p; const s = this.shoulder(p), ua = p[arm === "L" ? "uaL" : "uaR"] * R, fa = p[arm === "L" ? "faL" : "faR"] * R;
      return this._toWorld(s.x + this.L.ua * Math.cos(ua) + this.L.fa * Math.cos(fa), s.y + this.L.ua * Math.sin(ua) + this.L.fa * Math.sin(fa));
    }
    headPos(p) { p = p || this.p; const d = this.L.torso + this.L.head; return this._toWorld(d * Math.cos(p.T * R), d * Math.sin(p.T * R)); }
    solveArm(tx, ty, arm, base) {
      base = this._pose(base || this.p); const s = this.shoulder(base), t = this._toLocal(tx, ty);
      const L1 = this.L.ua, L2 = this.L.fa; let dx = t.x - s.x, dy = t.y - s.y;
      const dd = SM.clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 1, L1 + L2 - 0.5), b = Math.atan2(dy, dx);
      const a1 = Math.acos(SM.clamp((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1));
      let best = null;
      for (const sgn of [1, -1]) {
        const ua = b + sgn * a1, ex = s.x + L1 * Math.cos(ua), ey = s.y + L1 * Math.sin(ua);
        const fa = Math.atan2(s.y + dd * Math.sin(b) - ey, s.x + dd * Math.cos(b) - ex);
        if (!best || ey > best.ey) best = { ua, fa, ey };
      }
      const out = Object.assign({}, base); out[arm === "L" ? "uaL" : "uaR"] = best.ua / R; out[arm === "L" ? "faL" : "faR"] = best.fa / R;
      return out;
    }
    reach(tx, ty, t, d, arm, base) { return this.pose(this.solveArm(tx, ty, arm || "R", base), t, d == null ? 0.3 : d); }
    point(tx, ty, t, d, arm) {
      const base = this._pose(this.p), s = this.shoulder(base), l = this._toLocal(tx, ty), a = Math.atan2(l.y - s.y, l.x - s.x) / R;
      const p = Object.assign({}, base); p[arm === "L" ? "uaL" : "uaR"] = a; p[arm === "L" ? "faL" : "faR"] = a - 4;
      p.H = SM.clamp(a, -130, -50);
      return this.pose(p, t, d == null ? 0.3 : d, "back.out(1.6)");
    }
    tap(tx, ty, t, arm) {
      const b = this._pose(this.seated ? this.p : "stand");
      this.reach(tx - 14 * this.facing, ty + 34, t, 0.18, arm, b);
      this.reach(tx, ty, t + 0.18, 0.1, arm, b);
      if (SM.fx && this.sc.fx) this.sc.fx.ripple(tx, ty, t + 0.28, { r: 30 });
      this.reach(tx - 10 * this.facing, ty + 24, t + 0.34, 0.2, arm, b);
      return t + 0.54;
    }
    // ---- gestures (all return end time)
    wave(t, n, arm) { n = n || 3; let e = this.pose("waveA", t, 0.25); for (let i = 0; i < n; i++) e = this.pose(i % 2 ? "waveA" : "waveB", e, 0.22); return this.pose("stand", e, 0.3); }
    cheer(t, d) { this.pose("cheer", t, 0.25, "back.out(2)"); return t + (d || 0.8); }
    celebrate(t, o) {
      o = o || {}; const hip = this.hipY, h = this.H * 0.3;
      this.pose("crouch", t, 0.15, "power2.out", { uaL: -110, faL: -100, uaR: -70, faR: -80 }); this._root({ y: hip + this.legLen * 0.15 }, t, 0.15, "power2.out");
      this.pose("cheer", t + 0.15, 0.2, "back.out(2)", { thL: 80, shL: 120, thR: 100, shR: 140 }); this._root({ y: hip - h }, t + 0.15, 0.28, "power2.out");
      this._root({ y: hip }, t + 0.43, 0.26, "power2.in"); this.pose("cheer", t + 0.5, 0.2);
      if (o.confetti !== false && SM.fx && this.sc.fx) this.sc.fx.confetti(this.x, hip - this.L.torso, t + 0.25, { n: o.n || 26 });
      this.emote("grin", t);
      if (o.hold !== true) this.pose("stand", t + 1.0, 0.35);
      return t + 0.9;
    }
    think(t, d) { this.pose("think", t, 0.35); if (SM.fx && this.sc.fx) { const h = this.headPos(POSES.think.H != null ? this._pose("think") : null); this.sc.fx.thought(h.x + 30 * this.facing, h.y - this.L.head * 1.4, t + 0.3); } return t + (d || 1.2); }
    shrug(t, d) { this.pose("shrug", t, 0.25, "back.out(2)"); return this.pose("stand", t + (d || 0.9), 0.3); }
    facepalm(t, d) { this.pose("facepalm", t, 0.3); return t + (d || 1); }
    surprise(t, d) { this.pose("surprise", t, 0.16, "back.out(2.5)"); this.emote("surprised", t); if (SM.fx && this.sc.fx) { const h = this.headPos(this._pose("surprise")); this.sc.fx.emphasis(h.x, h.y, t + 0.05); } return t + (d || 0.8); }
    sad(t, d) { this.pose("sad", t, 0.6); this.emote("sad", t); return t + (d || 1); }
    present(t, d) { return this.pose("present", t, d || 0.35, "back.out(1.6)"); }
    thumbsUp(t, d) { this.pose("thumbsUp", t, d || 0.3, "back.out(2)"); return t + (d || 0.3); }
    bow(t, d) { this.pose("bow", t, 0.45); return this.pose("stand", t + (d || 1), 0.45); }
    salute(t) { return this.pose("salute", t, 0.3, "back.out(2)"); }
    nod(t, n) { n = n || 2; let e = t; const H0 = this.p.H; for (let i = 0; i < n; i++) { e = this.pose(this.p, e, 0.14, "sine.inOut", { H: H0 + 22 }); e = this.pose(this.p, e, 0.14, "sine.inOut", { H: H0 }); } return e; }
    lookAt(tx, ty, t, d) { const hp = this.headPos(), l = this._toLocal(tx, ty), hl = this._toLocal(hp.x, hp.y); const a = Math.atan2(l.y - hl.y, l.x - hl.x) / R; return this.pose(this.p, t, d || 0.3, "sine.inOut", { H: SM.clamp(a, -150, -40) }); }
    talk(t0, t1) { let t = t0, i = 0; while (t < t1 - 0.3) { t = this.pose(i++ % 2 ? "explainA" : "explainB", t, 0.38); t += 0.12; } return this.pose("stand", t, 0.3); }
    dance(t0, t1) { let t = t0, i = 0; while (t < t1 - 0.25) { this.pose(i % 2 ? "danceA" : "danceB", t, 0.24, "back.out(1.4)"); this._root({ y: this.hipY - (i % 2 ? 0 : 14) }, t, 0.24, "sine.inOut"); t += 0.3; i++; } this._root({ y: this.hipY }, t, 0.2); return this.pose("stand", t, 0.3); }
    typing(t0, t1) { let t = t0, i = 0; while (t < t1 - 0.12) { this.pose("typing", t, 0.12, "sine.inOut", { faR: i % 2 ? 6 : -4, faL: i % 2 ? -2 : 10 }); t += 0.14; i++; } return t1; }
    push(t0, t1, dx) { this.pose("push", t0, 0.3); return Math.max(this._gait(this.x + (dx || 120) * this.facing, t0 + 0.3, { d: t1 - t0 - 0.3, end: false, face: false }, ["push", Object.assign({}, POSES.push, { thL: 120, thR: 62, shL: 118, shR: 82 }), "push", Object.assign({}, POSES.push, { thL: 120, thR: 62, shL: 118, shR: 82 })], 100, 0.4, 2), t1); }
    pull(t0, t1, dx) { this.pose("pull", t0, 0.3); this._root({ x: this.x - (dx || 100) * this.facing }, t0 + 0.3, t1 - t0 - 0.3, "power1.inOut"); this._recordX(t0 + 0.3, t1, this.x - (dx || 100) * this.facing); return t1; }
    carry(t) { return this.pose("carry", t, 0.3); }
    lift(t) { return this.pose("lift", t, 0.4, "back.out(1.4)"); }
    balance(t) { return this.pose("balance", t, 0.4); }
    victory(t) { this.pose("victory", t, 0.25, "back.out(2)"); return t + 0.6; }
    // ---- faces
    emote(expr, t) {
      if (!this.faceEls) return t || 0; const d = this._mouth(expr);
      if (t == null) gsap.set(this.faceEls.m, { attr: { d } }); else this.sc.tl.set(this.faceEls.m, { attr: { d } }, this.sc.T(t));
      if (expr === "surprised") this.sc.tl.to([this.faceEls.e1, this.faceEls.e2], { scale: 1.35, duration: 0.12, yoyo: true, repeat: 1 }, this.sc.T(t || 0));
      return t || 0;
    }
    blink(t) { if (!this.faceEls) return t; this.sc.tl.to([this.faceEls.e1, this.faceEls.e2], { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut" }, this.sc.T(t)); return t + 0.14; }
    blinks(t0, t1, every) { every = every || 2.7; for (let t = t0 + 0.8; t < t1; t += every) this.blink(t); return t1; }
    // ---- props in hand
    hold(name, t, o) {
      o = o || {}; const hand = o.hand === "L" ? this.handL : this.handR;
      const svg = SM.el("svg", { width: 1, height: 1, overflow: "visible", style: "position:absolute;left:0;top:0;overflow:visible" }, hand);
      const size = o.size || this.H * 0.26;
      const g = SM.el("g", {}, svg);
      if (typeof name === "function") name(g, size); else SM.drawProp(name, g, Object.assign({ size }, o, { sc: this.sc }));
      const th = new SM.Thing(this.sc, g, { x: o.dx == null ? size * 0.1 : o.dx, y: o.dy == null ? -size * 0.38 : o.dy });
      if (t != null) th.pop(t, 0.3); return th;
    }
    // throw a prop from the hand to (tx,ty); returns the flying Thing
    throw(name, tx, ty, t, o) {
      o = o || {}; this.pose("windup", t, 0.25); this.pose("release", t + 0.25, 0.14, "power3.out");
      const rel = this._pose("release"), hp = this.handPos("R", rel);
      const th = this.sc.prop(name, Object.assign({ x: hp.x, y: hp.y, layer: o.layer || "front", size: o.size }, o.prop || {}));
      th.hide(); th.show(t + 0.3);
      th.arcTo(tx, ty, t + 0.3, o.d || 0.7, o.h == null ? 200 : o.h, { spin: o.spin == null ? 360 : o.spin });
      this.pose("stand", t + 0.6, 0.35);
      return th;
    }
    // ---- whole-figure visibility
    pop(t, d) { d = d || 0.4; gsap.set(this.el, { opacity: 0, scale: 0.2 }); this.sc.tl.to(this.el, { opacity: 1, scaleX: this.facing, scaleY: 1, duration: d, ease: "back.out(2)" }, this.sc.T(t)); return t + d; }
    fadeIn(t, d) { d = d || 0.4; gsap.set(this.el, { opacity: 0 }); this.sc.tl.to(this.el, { opacity: 1, duration: d }, this.sc.T(t)); return t + d; }
    fadeOut(t, d) { d = d || 0.4; this.sc.tl.to(this.el, { opacity: 0, duration: d }, this.sc.T(t)); return t + d; }
    hide(t) { if (t == null) gsap.set(this.el, { opacity: 0 }); else this.sc.tl.set(this.el, { opacity: 0 }, this.sc.T(t)); return this; }
    show(t) { if (t == null) gsap.set(this.el, { opacity: 1 }); else this.sc.tl.set(this.el, { opacity: 1 }, this.sc.T(t)); return this; }
    spin(t, d) { d = d || 0.6; this.sc.tl.to(this.el, { rotation: "+=360", duration: d, ease: "power2.inOut" }, this.sc.T(t)); return t + d; }
    tintAll(color, t, d) {
      d = d || 0.3; const nodes = this.el.querySelectorAll(".sm-limb"); this.sc.tl.to(nodes, { backgroundColor: color, duration: d }, this.sc.T(t)); return t + d;
    }
  }
  SM.Figure = Figure;
  SM.Scene.prototype.figure = function (o) { return new Figure(this, o); };
  SM.Scene.prototype.character = function (name, o) { return new Figure(this, Object.assign({ character: name }, o || {})); };
})(typeof window !== "undefined" ? window : globalThis);
