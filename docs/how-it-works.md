# How it works

> **No video-generation AI is involved, anywhere.** Stickman Kino never calls Sora, Veo, Runway, Kling or any other video model or API. It draws every frame itself, from code, on your machine: no video API keys, no video credits, no uploads. The only AI in the loop is the coding agent you use to direct it.

```text
film.json ──► stickman audio ──► assets/ (VO, music, SFX) + audio.json (durations)
    │                                      │
    └──────────── stickman compose ◄───────┘
                      │   copies engine → .sm/, writes film.js + index.html (scenes.js inlined)
                      ▼
               HyperFrames composition
               one paused GSAP timeline on window.__timelines["stickman"]
                      │
       check · snapshot · preview · render   (headless Chrome seeks the timeline frame by frame)
                      ▼
               renders/<slug>.mp4
```

## The pieces

| Layer | Files | Role |
|---|---|---|
| **Skills** | `skills/*/SKILL.md` | playbooks that tell an agent how to direct, animate, score and QA a film |
| **CLI** | `bin/stickman.mjs`, `lib/*.mjs` | scaffolding, audio, composition, tool resolution, rendering wrapper |
| **Engine** | `engine/sm-*.js`, `sm.css`, `fonts/` | browser-side library: rig, props, text, charts, FX, camera, worlds, transitions |
| **Renderer** | [HyperFrames](https://github.com/heygen-com/hyperframes) (npm dependency) | turns an HTML composition with a seekable timeline into video |
| **Audio** | `lib/synth.mjs` + Kokoro via HyperFrames | procedural music & SFX in pure Node; neural TTS locally |

### Engine modules

| File | Exposes |
|---|---|
| `sm-core.js` | `SM.film()`, `film.scene()`, `Scene` (layers, primitives, `cue()`), `Thing` (the animatable wrapper), themes, seeded RNG |
| `sm-rig.js` | `Figure` (bones, poses, gaits, IK, faces, outfits, hand props), `SM.poses`, `SM.characters` |
| `sm-props.js` | `sc.prop()`, `SM.drawProp()`, `SM.defineProp()`, ~190 line-art props |
| `sm-type.js` | `sc.text()`, titles, captions, lower thirds, labels, bubbles, lists, slams, quotes |
| `sm-charts.js` | counters, stats and 17 chart/diagram builders |
| `sm-fx.js` | `sc.fx` (effects), `sc.camera`, `sc.enter()` / `sc.exit()` transitions |
| `sm-world.js` | theme decor, `sc.env` environments |

### Scene layers

```text
section#clipId (HyperFrames clip: visible between data-start and data-start + data-duration)
└── .sm-stage                 ← transitions move/scale this
    ├── svg.sm-decor          theme backdrop (paper speckle, grid, studio floor…)
    ├── .sm-cam               ← camera transform (x, y, scale)
    │   ├── svg.sm-world      environments
    │   ├── svg.sm-back       props behind figures
    │   ├── .sm-mid           figures (HTML bone rigs)
    │   └── svg.sm-front      props over figures
    ├── svg.sm-uisvg          screen-space vector UI
    └── .sm-ui                screen-space text
└── .sm-top / svg.sm-topsvg   transition covers
```

### The stickman rig

Each figure is a tree of zero-height `div` "bones" rotated by GSAP: hip → torso → neck/head and shoulders → upper arm → forearm → hand, plus hip → thigh → shin for each leg. Poses are stored as **absolute** angles for a right-facing figure and converted to relative bone rotations, normalised to the shortest path so limbs never spin the long way round. Facing left is a mirror (`scaleX: -1`). Arms use analytic two-bone IK (choosing the elbow-down solution). Walk and run are 4-phase cycles (contact → passing → contact → passing) with hip bob, with stride timing derived from the ground speed so feet don't skate.

## Determinism (why renders are reproducible)

HyperFrames renders by **seeking** the timeline to each frame's time. So everything must be a pure function of time:

- one GSAP timeline, built synchronously at load, never auto-playing;
- no `Math.random`, `Date`, timers, `requestAnimationFrame` or network in scenes (the engine provides `SM.rng(seed)`; a test enforces this for the engine);
- no `onUpdate` callbacks for visible state (seek may suppress callbacks), so number counters use discrete `tl.set` steps;
- each film folder is self-contained (`.sm/` holds a copy of the engine, GSAP and fonts).

Same `film.json` + `scenes.js` + audio = byte-identical frames.

## Voice cue timing

`sc.cue("word")` estimates when a word is spoken: the clip's VO text is split into words, each weighted by length plus pauses for commas and full stops, and the weights are mapped onto the measured VO duration. For Kokoro voices this lands within about 0.2 s, plenty to hit a visual "on the word". Use an offset (`sc.cue("word", -0.15)`) to land slightly early.

## Why scenes.js is inlined

The HyperFrames compiler hoists external `<script src>` tags into `<head>`, so they run before the page body exists. `compose` therefore inlines `scenes.js` at the end of `<body>`. Engine files stay external because they only define functions.
