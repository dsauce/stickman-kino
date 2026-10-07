# Engine API

> This page mirrors `skills/stickman-animator/references/api.md` (the copy agents read). Regenerate with `node scripts/catalog.mjs`. For worked examples see the [cookbook](../skills/stickman-animator/references/cookbook.md) and [samples](../samples).

Every scene function receives `sc`. Load order and contract: see [how-it-works.md](how-it-works.md).

All times are **local seconds** within the scene; every action returns its end time. Colours accept `"a1" | "a2" | "a3" | "ink" | "muted" | "soft" | "paper" | "bg"` or any CSS colour.

## Film & scene
```js
const film = SM.film({ theme?, autoSfx? });     // theme defaults to film.json → theme
film.scene(id, sc => { … }, { theme?, captions? })  // per-scene theme override
```
`sc` fields: `W H cx cy u groundY dur t0 theme vo clip tl` · helpers: `sc.T(local) → global`, `sc.cue(word|[word,n]|fraction, offset?)`, `sc.to/set/fromTo(target, vars, t)`.

## Figures
```js
const f = sc.figure({ x, y /*feet*/, size: 300, character?, color?, facing: 1|-1, pose?: "stand", face?: "dots", hat?, hatColor?, shirt?, shorts?, dress?, tie?, glasses?, hair?: "bun"|"ponytail"|"spiky"|"bob", head?: "filled"|"square", antenna?, hidden?, z? });
sc.character("zeke", { x })   // presets: classic filled zeke office exec builder scientist grad king chef dress kid robot agent
```
**Locomotion**: `walkTo(x, t, {d?, speed?, end?})` · `runTo` · `sneakTo` · `walk(dx, t)` · `jumpTo(x, groundY, t, {d, h, tuck})` · `hop(t, h)` · `climbTo(groundY, t, d)` · `moveTo(x, t, d)` (slide) · `moveXY(x, hipY, t, d)` · `face(dir, t)` · `turn(t)`.
**Body**: `pose(name|obj, t, d=0.3, ease?, overrides?)` · `sit(t, seatY, {pose: "sit"|"sitEdge"|"typing"|"relax"|"slump"})` · `sitFloor(t)` · `standUp(t, groundY?)` · `kneel(t)` · `lie(t)` · `fall(t)` · `getUp(t)`.
**Arms**: `reach(x, y, t, d, "R"|"L")` (2-bone IK) · `point(x, y, t)` · `tap(x, y, t)` (with ripple) · `present(t)`.
**Gestures**: `wave(t, n)` · `cheer(t)` · `celebrate(t, {hold?, confetti?})` · `think(t, d)` · `shrug(t)` · `facepalm(t)` · `surprise(t)` · `sad(t)` · `thumbsUp(t)` · `bow(t)` · `salute(t)` · `nod(t, n)` · `lookAt(x, y, t)` · `talk(t0, t1)` · `dance(t0, t1)` · `typing(t0, t1)` · `push(t0, t1, dx)` · `pull(t0, t1, dx)` · `carry(t)` · `lift(t)` · `balance(t)` · `victory(t)`.
**Face** (`face: "dots"`): `emote("happy"|"grin"|"neutral"|"surprised"|"worried"|"sad", t)` · `blink(t)` · `blinks(t0, t1)`.
**Props in hand**: `const p = f.hold("coffee", t?, { size, dx, dy, hand: "R"|"L", accent })` · `f.throw("coin", x, y, t, { size, h, d, spin })` → flying Thing.
**Whole figure**: `pop(t)` `fadeIn(t)` `fadeOut(t)` `hide(t)` `show(t)` `spin(t)` · queries `handPos("R")`, `headPos()`, `xAt(t)`.
Poses (58): stand idle walkA walkB runA runB sneakA sneakB crouch leap tuck climbA climbB hang sit sitEdge slump sitFloor relax meditate kneel lie lieFront point pointUp present waveA waveB cheer think shrug handsHips armsCross facepalm sad surprise scared thumbsUp salute bow explainA explainB push pull carry lift windup release typing balance danceA danceB stumble victory (+ walk/run passing poses). Pose objects use absolute angles (facing right): `{ T, H, uaL, faL, uaR, faR, thL, shL, thR, shR }` - 0 = forward, 90 = down, −90 = up.

## Props & shapes
```js
sc.prop(name, { x, y, size: 120, layer: "back"|"front"|"world"|"ui", accent?, accent2?, fill?, color?, rotation?, scale?, hidden?, origin? })
sc.props(name|[names], n, { x, y, cols, gap, size, … })   // a row/grid
sc.rect(x, y, w, h, { r, fill, color, width, layer }) · sc.circle(x, y, r, {…})
sc.path(d, { color, width, dash, layer }) .draw(t, d) · sc.line(x1,y1,x2,y2,o) · sc.curve(x1,y1,x2,y2,{bend}) · sc.arrow(x1,y1,x2,y2,{bend, head, dash}) .draw(t)
sc.image(src, { x, y, w, h, layer })   // file inside the film folder
sc.ground({ y?, style: "line"|"grass"|"none" })
```
`stickman list props` prints all ~190 names (documents, devices, money, charts, nature, transport, science, cinema, symbols…).

## Thing methods (props, text, charts, shapes)
`pop(t, d, {origin})` `popOut` `fadeIn(t, d, {x,y})` `fadeOut` `rise` `dropIn` `slideIn(t, d, "left"|"right"|"up"|"down")` `slideOut` `moveTo(x, y, t, d, ease)` `moveBy` `arcTo(x, y, t, d, height, {spin})` `scaleTo` `rotateTo` `spin(t, d, turns)` `pulse(t, k)` `shake(t, d, amp)` `wobble` `bob(t0, t1, amp, period)` `tint(color, t)` `glow(t, d, color)` `draw(t, d)` `undraw` `hide(t)` `show(t)` `at(x, y)` `front()`.

## Text
```js
const tx = sc.text("Search ≠ [answers].", { x, y, size: 64, font: "display"|"body"|"hand"|"mono", weight, color, accent, align: "left"|"center"|"right", width, bg, outline, shadow, upper, world? });
tx.in(t, "rise"|"fade"|"pop"|"words"|"letters"|"type"|"slide"|"wipe"|"blur"|"drop"|"scale"|"slam", d?)
tx.out(t, "fade"|"rise"|"pop"|"wipe"|"words")
tx.highlight(word|index, t, color) · tx.underline(...) · tx.strike(...) · tx.circle(...) · tx.colorWord(word, color, t) · tx.swap(newText, t)
sc.title(text, { y, size, kicker, sub }).in(t)        sc.caption(text, t0, t1)      sc.captions({ style: "box"|"pop", words })
sc.lowerThird(name, role, t, { out })                sc.label(text, x, y, pointX, pointY, { color }).in(t)
sc.bubble(figure|{x,y}, "text" | propName, t, d?, { type: "speech"|"thought", icon })
sc.list(["a","b"], { x, y, gap, icon: "checkbox" }).in(t, step)     sc.slam(["ONE","TWO"], t, { per })     sc.quote(text, who, t)
```
Film-level burned-in captions: `"captions": "pop" | "box"` in film.json.

## Charts & diagrams (all `.grow/.build/.draw/.to(t)` animate)
`sc.counter(value, { from, prefix, suffix, decimals, size, color }).count(t, d)` · `sc.stat(value, label, opts).in(t)` · `sc.barChart({ x, y, w, h, data: [{label, value, color, icon}], max, prefix, suffix, values }).grow(t, d, stagger)` (+ `.highlight(i, t)`, `.setValue(i, v, t)`) · `sc.hbarChart({...}).grow(t)` · `sc.lineChart({ series: [{values, color, label}] | values, labels, area, grid, dots, smooth }).draw(t, d)` (+ `.point(si, i)`) · `sc.pieChart({ data, donut, center }).grow(t)` (+ `.explode(i, t)`) · `sc.progress({ w, from }).to(pct, t, d)` · `sc.gauge({ r }).to(v, t)` · `sc.flow({ nodes: [{id, label, x, y, icon, shape, color}], edges: [[from, to, label]] }).build(t, step)` (+ `.pulse(id, t)`, `.token(from, to, t)`) · `sc.timeline({ items: [{date, label, icon}] }).build(t)` · `sc.venn({ sets, center }).build(t)` · `sc.versus({ leftTitle, rightTitle }).in(t)` · `sc.network({ n, icons }).build(t)` · `sc.pyramid({ levels }).build(t)` · `sc.cycle({ steps: [{icon, label}] }).build(t)` · `sc.matrix({ quadrants, xLabel, yLabel }).build(t)` · `sc.funnelStages({ stages }).build(t)` · `sc.table({ rows }).build(t)` · `sc.balance({ left: [props], right: [props] }).tip(deg, t)`.

## Effects - `sc.fx`
`confetti(x, y, t)` `burst(x, y, t)` `sparkle(x, y, t)` `puff(x, y, t)` `ripple(x, y, t, {n})` `emphasis(x, y, t)` `thought(x, y, t)` `sweat(x, y, t)` `zzz(x, y, t)` `hearts(x, y, t)` `impact(x, y, t)` `zap(x1, y1, x2, y2, t)` `smoke(x, y, t0, t1)` `explode(x, y, t)` `flash(t)` `speedLines(t0, t1)` `rain(propName|[names], t0, t1, { n, pile, size })` `orbit(things, cx, cy, t0, t1, { rx, ry, turns })` `gather(things, x, y, t)` `scatter(things, t)` `flow(pathThing, t0, t1)` `stars(t0, t1)`.

## Camera - `sc.camera`
`focus(x, y, zoom, t, d, ease)` `zoom(k, t, d)` `pan(x, y, t, d)` `panBy(dx, dy, t, d)` `push(t, d, k)` `pull(t, d)` `reset(t, d)` `shake(t, d, amp)` `follow(figure, t0, t1, { k, lead, y })` `whip(x, y, t, d)` `tilt(deg, t, d)` `set(x, y, k)`.

## Environments - `sc.env`
`city({ y, height, wide })` `hills()` `mountains()` `clouds({ n, drift })` `trees({ n, x0, x1, size })` `road({ scroll: [t0, t1] })` `ocean()` `room({ window, frame, lamp, night })` `office({ x })` → `{ seatX, seatY, deskTop, keyboard, laptop }` `stage({ x })` `space()` `night()` `park()`.

## Intros & outros (title sequences)
Declare in film.json (no code): `{ "id": "intro", "intro": { "style": "countdown", "title": "Whose [turn] is it?", "kicker": "…", "subtitle": "…" } }` - default duration + SFX are added automatically. Or call in a scene (returns the end time):
`sc.intro("countdown" | "clapper" | "logo" | "spotlight", { t, title, kicker, subtitle, logo, size, per, from, scene, take, snapAt, titleFx, bg })`
`sc.outro("cta" | "credits" | "endcard" | "kino", { t, title, tagline, cta, url, logo, credits: [[role, name]], videos: [..], d, confetti })`
`logo` = image path in the film folder, a prop name, or `"kino"`. Extras on top of a preset: write `film.scene("intro", sc => { const t = sc.intro("logo", {...}); sc.prop(...).pop(t); })`. Also `sc.button("Try it free", { x, y, fill, color, size, w })` → Thing.

## Transitions
`sc.enter(type, { d, color, x, y })` at the clip start · `sc.exit(type, {...})` at the clip end. Types: `fade flash wipe-left wipe-right wipe-up wipe-down bars iris ink slide-left slide-right slide-up slide-down zoom blur`. Use the same type on both sides of a cut.

## Themes
`light dark paper chalkboard blueprint neon studio sunset` or custom: `{ extends: "dark", bg, ink, paper, muted, soft, accents: [a1, a2, a3], font, display, hand }`.
