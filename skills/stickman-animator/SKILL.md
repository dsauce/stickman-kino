---
name: stickman-animator
description: Animate a Stickman Kino film - write scenes.js from film.json/storyboard using the stickman engine (rigged stick figures with 58 poses and IK, ~190 props, charts and diagrams, kinetic text, captions, camera moves, effects, environments, themes, transitions), synced to the voice-over, then verify with check + snapshots. Use for any scene choreography, motion, layout or visual-fix work on a Stickman Kino film.
---

# Stickman animator

You write **`scenes.js`** - one `film.scene(id, sc => { … })` per clip in `film.json`, same ids, same order. Everything is plain browser JS against the global `SM` engine. Read `references/api.md` (full cheat-sheet) and `references/cookbook.md` (copy-paste recipes) before writing.

## Mental model

- **Local time.** Inside a scene every time is seconds from the clip's start. `sc.dur` = clip length.
- **Chainable.** Every action returns the time it ends: `const t = bob.walkTo(900, 0.2); bob.wave(t);`
- **Voice-synced.** `sc.cue("word")` = estimated local time the narrator says that word (`sc.cue(["word", 1])` = 2nd occurrence, `sc.cue(0.5)` = halfway through the VO). Put the visual *on or just before* the word (`sc.cue("idea") - 0.15`).
- **Layers.** `world` (environment) → `back` (props) → figures → `front` (props over figures) → `ui` (screen-space, ignores camera) → `top` (transitions). Pass `{ layer: "front" }` / `"ui"` to props.
- **Coordinates.** Canvas is `sc.W × sc.H` (1920×1080, 1080×1920 or 1080×1080). `sc.groundY` is the floor (80 % down in landscape, 74 % in portrait). Figures stand on `y` = their feet.
- **Things.** Props, text, charts, shapes are `Thing`s: `.pop(t) .fadeIn(t) .rise(t) .dropIn(t) .slideIn(t,d,dir) .moveTo(x,y,t,d) .arcTo(x,y,t,d,h) .scaleTo .rotateTo .spin .pulse .shake .wobble .bob(t0,t1) .glow .tint .draw .fadeOut .popOut .hide .show`.
- **Hidden-until-entrance.** Create with `{ hidden: true }` then `.pop(t)`; text is hidden until `.in(t, fx)`.

## Scene skeleton

```js
const film = SM.film();                       // theme/format come from film.json

film.scene("hook", sc => {
  sc.enter("fade");                           // optional, match previous exit
  sc.ground();                                // floor line (style: "grass" | "none")
  const bob = sc.figure({ x: -150, face: "dots" });        // or sc.character("zeke", {...})
  const t1 = bob.walkTo(sc.W * 0.35, 0.2);
  bob.point(sc.W * 0.7, sc.H * 0.4, sc.cue("this"));
  const chart = sc.barChart({ x: sc.W * 0.68, y: sc.H * 0.45, data: [{ label: "2024", value: 4 }, { label: "2025", value: 9 }] });
  chart.grow(sc.cue("grew"));
  sc.text("Revenue [doubled]", { x: sc.W * 0.68, y: 150, size: 80 }).in(sc.cue("doubled") - 0.1, "words");
  sc.camera.focus(sc.W * 0.6, sc.H * 0.5, 1.12, 1.0, 3);   // slow push
  sc.exit("wipe-left");
});
```

## Intros & outros

Clips that declare `"intro"` / `"outro"` in `film.json` build themselves. You don't need a scene for them. To add extras (props bursting around the title, a figure waving at the CTA), write the scene and call the preset yourself; the auto version is then skipped:

```js
film.scene("intro", sc => {
  const t = sc.intro("countdown", sc.clip.intro);          // returns when the title has landed
  sc.prop("rocket", { x: 1500, y: 300, size: 120, layer: "ui", hidden: true }).pop(t - 0.8);
  sc.exit("wipe-left");
});
film.scene("outro", sc => {
  sc.enter("fade", { color: "bg" });
  sc.outro("kino", sc.clip.outro);
  sc.figure({ x: 1500 }).point(1150, 830, 1.2);
});
```

## Direction rules (what makes it look good)

1. **Something changes every 2-3 s.** Plan 3 beats per clip; fill gaps with a camera push, a blink/nod, a prop bob, a highlight.
2. **Stage before you animate.** Decide where the figure, the main prop and the text live (thirds in 16:9; stacked in 9:16). Keep text away from the figure's head and from other text.
3. **Figures act, not stand.** Use gestures that mean something: `point` at what's discussed, `think` before an idea, `surprise` on a reveal, `shrug` on a myth, `celebrate` on a win, `push`/`climb`/`runTo` for effort.
4. **One focal entrance at a time**; stagger by 0.1-0.2 s when several things appear.
5. **Match exits and entrances** across clips (same transition type) or match-cut (same pose/object position).
6. **Accents carry meaning**: `"a1"` problem, `"a2"` solution, `"a3"` reward. Pass colour names: `"a1" | "a2" | "a3" | "ink" | "muted" | "soft" | "paper"` or hex.
7. **Ground truth**: figures stand on `sc.groundY` (or a surface you computed); props that rest on the floor use `y = sc.groundY - size*0.4`.
8. **Portrait**: figure `size: 420-460`, props 200-300, text 70-120, keep the middle band busy and captions low.

## Verify (mandatory loop)

1. `stickman check <dir>` → must say **Check passed**. `page_error` = your JS threw; fix it.
2. `stickman snapshot <dir>` (or `--at` times on key beats) → **open `snapshots/contact-sheet*.jpg` and the PNGs and look.** Fix: clipping, overlaps, floating figures, empty moments, unreadable text, arms through heads (adjust pose overrides), wrong accent colours.
3. Re-run until clean, then render.

## Gotchas

- Schedule each figure chronologically. `celebrate()` schedules a return to `stand` at +1.0 s; pass `{ hold: true }` if you'll pose again soon after.
- `bob.hold(prop)` attaches to the right hand and stays upright; create before use and `.pop(t)` it.
- Text markup: `"[accented words]"` colours a phrase with the `accent` option (default `a2`).
- Charts count numbers with discrete steps; give `prefix`/`suffix`/`decimals` in the chart options.
- Don't use `Math.random`/`Date`/`setTimeout`. Use `SM.rng(seed)`.
- Raw GSAP is allowed: `sc.tl.to(el, vars, sc.T(localTime))` - keep it a pure function of time.
