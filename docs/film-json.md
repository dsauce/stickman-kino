# film.json reference

`film.json` is the data half of a film; `scenes.js` is the choreography. Validate in your editor via the [JSON Schema](../schema/film.schema.json) (the `$schema` line in scaffolded films enables autocomplete in VS Code).

```jsonc
{
  "$schema": "../../schema/film.schema.json",
  "title": "Why compound interest feels like magic",
  "format": "16:9",                 // 16:9 | 9:16 | 1:1 | 4:5 | 4:3   (or "size": [w, h])
  "fps": 30,
  "theme": "paper",                 // or { "extends": "light", "accents": ["#E63946", "#1D7FE0", "#F2B400"] }
  "captions": false,                // true | "box" | "pop" | { "style": "pop", "words": 3, "y": 1600, "size": 80 }
  "voice": { "provider": "kokoro", "voice": "bm_george", "speed": 0.95 },
  "music": { "style": "calm-piano", "volume": 1 },
  "sfx": [{ "at": 12.4, "name": "riser", "volume": 0.4 }],   // film-wide, global seconds
  "clips": [
    {
      "id": "hook",                 // scene id → film.scene("hook", sc => …)
      "label": "Golden hook",       // shown in the studio timeline
      "duration": "auto",           // number of seconds, or "auto" = VO + lead + tail
      "vo": "Put one hundred dollars away today…",
      "voStart": 0.4,               // seconds before the narrator starts in this clip
      "tail": 0.6,                  // seconds held after the VO (auto duration)
      "visual": "Figure drops a coin in a piggy bank; a counter races to $2,172.",
      "beats": [{ "t": "0-3s", "do": "coin drops" }],   // optional, used by `stickman prompts`
      "sfx": [{ "at": 0.9, "name": "coin", "volume": 0.5 }]  // local seconds
    }
  ]
}
```

## Top level

| Field | Type | Default | Notes |
|---|---|---|---|
| `title` | string | folder name | |
| `format` | enum | `16:9` | `16:9` 1920×1080 · `9:16` 1080×1920 · `1:1` 1080×1080 · `4:5` 1080×1350 · `4:3` 1440×1080 |
| `size` | `[w, h]` | none | custom canvas, overrides `format` (banners, social cards) |
| `fps` | int | 30 | 24 / 25 / 30 / 50 / 60 |
| `theme` | string \| object | `light` | see [themes.md](themes.md) |
| `captions` | bool \| `box` \| `pop` \| object | `false` | burned-in captions timed from the VO (per scene: `film.scene(id, fn, { captions: false })` to skip) |
| `voice` | object | Kokoro `am_michael` | see [audio.md](audio.md) |
| `music` | object | `calm-piano` | `style`, `file`, `volume`, `bpm`, `key`, `seed`, `lufs` |
| `sfx` | array | `[]` | film-wide SFX at global times |
| `promptVoice` | string | | narrator description for `stickman prompts` |
| `clips` | array | required | at least one |

## Clips

| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | string | required | letters first; must match a `film.scene(id, …)` |
| `label`, `beat` | string | | documentation / studio labels |
| `duration` | number \| `"auto"` | `"auto"` | auto = `ceil2(voStart + voDuration + tail)`, min `minDuration` (3 s) |
| `vo` | string | | narration, about 2.4 words per second |
| `voStart` | number | 0.4 | |
| `tail` | number | 0.6 | |
| `voSpan` | bool | false | this clip's VO deliberately continues into the next clips (silences the overrun warning) |
| `voice` | object | | per-clip voice override, e.g. `{ "voice": "af_heart" }` for a second character |
| `visual` | string | | the on-screen idea; used by the animator skill and `stickman prompts` |
| `beats` | array | | `[{ "t": "0-3s", "do": "…" }]` |
| `sfx` | array | `[]` | `{ at, name, volume }`, `at` in local seconds; `name` is a built-in or a file path |

## Intro & outro clips

A clip can be a title-sequence preset instead of a scene. No `scenes.js` code is needed, the duration defaults to the preset's length, and matching sound effects are added:

```json
{ "id": "intro", "intro": { "style": "countdown", "title": "Whose [turn] is it?", "kicker": "a very short film about chores" } }
{ "id": "outro", "outro": { "style": "cta", "logo": "assets/logo.svg", "title": "Try [Chorus]", "tagline": "chores, in harmony", "cta": "Get early access", "url": "chorus.app" } }
```

| `intro.style` | options |
|---|---|
| `countdown` | `title` `kicker` `subtitle` `per` (s per number) `from` (3) `size` `titleFx` `bg` |
| `clapper` | `title` `scene` `take` `snapAt` |
| `logo` | `logo` (image path, prop name or `"kino"`) `logoSize` `title` `subtitle` |
| `spotlight` | `title` `kicker` `subtitle` `dark` |

| `outro.style` | options |
|---|---|
| `cta` | `logo` `title` `tagline` `cta` `url` `confetti` |
| `credits` | `credits: [[role, name]…]` `d` `title` `bg` |
| `endcard` | `title` `videos: [..]` `cta` |
| `kino` | `title` `tagline` `cta` `url` |

`"sfx": false` inside the preset object disables its automatic sounds. Write `film.scene("intro", …)` to add extras on top (see the [Chorus sample](../samples/chorus/scenes.js)).

## What gets generated (don't edit, it's rebuilt)

| File | By | Purpose |
|---|---|---|
| `assets/vo/*.wav`, `assets/vo/raw/` | `stickman audio` | normalised VO (−16 LUFS) + raw takes |
| `assets/music/bed.wav` | `stickman audio` | music bed (−30 LUFS) at the exact film length |
| `assets/sfx/*.wav` | `audio` / `compose` | synthesised SFX |
| `assets/audio.json` | `stickman audio` | durations + cache hashes |
| `film.js` | `compose` | runtime metadata (`window.SM_FILM`): clip timings, VO text for cues/captions |
| `index.html` | `compose` | the HyperFrames composition (scenes.js is inlined) |
| `.sm/` | `compose` | engine + GSAP + fonts copied in, so the folder renders standalone |
| `renders/`, `snapshots/` | `render`, `snapshot` | outputs |
