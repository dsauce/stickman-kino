---
name: stickman-sound
description: Voice-over, music and sound effects for Stickman Kino films - choose and tune the narrator (free local Kokoro voices, macOS say, espeak, or your own recordings), pick a procedural music bed by mood, place synthesised SFX on actions, and keep levels broadcast-clean. Use when adding/changing VO, voices, music, SFX, loudness, or when audio timing drives clip length.
---

# Stickman sound

Audio lives in `film.json`; `stickman audio <dir>` builds it into `assets/` and records durations in `assets/audio.json` (clips with `"duration": "auto"` take their length from it). Re-running is cheap: VO is cached by a hash of text + voice + speed.

## Voice-over

```json
"voice": { "provider": "kokoro", "voice": "am_michael", "speed": 1.0, "lufs": -16 }
```

| provider | what | notes |
|---|---|---|
| `kokoro` (default) | free local neural TTS (Kokoro-82M via HyperFrames) | installed by `stickman setup`; first run downloads the model |
| `say` | macOS system voices | `voice`: e.g. `Samantha`, `Daniel` |
| `espeak` | espeak-ng (Linux) | robotic - fine for drafts |
| `files` | your recordings | put `assets/vo/<clipId>.wav` per clip; durations are probed |
| `none` | silent film | lean on text, captions off, music up |

Kokoro voices: **`am_michael`** warm US male (default) · **`af_heart`** bright US female · `af_nova`, `af_sky` US female · `am_adam` US male · **`bm_george`** British male · `bf_emma`, `bf_isabella` British female · `ef_dora` Spanish · `ff_siwis` French · `jf_alpha` Japanese · `zf_xiaobei` Mandarin. Speed 0.9-1.1 sounds natural; slow explainers 0.92-0.97.

Per-clip override: `"voice": { "voice": "af_heart" }` inside a clip (e.g. a second character). Pronunciation: spell numbers/acronyms the way they should be said ("S Q L" vs "sequel"), add commas for breaths, avoid parentheses.

Timing: `voStart` (default 0.4 s) = lead-in before the narrator speaks in that clip; `tail` (default 0.6 s) = hold after. One VO may deliberately span later clips - set `voSpan: true` on that clip and give the following clips fixed durations.

## Music

```json
"music": { "style": "uplifting", "volume": 1, "bpm": 112, "key": "D", "seed": 3, "lufs": -30 }
```

Styles (original, procedural, royalty-free): **`pop`** catchy feel-good hook with claps and pumping bass, arranged in sections (intro → verse → hook → break → hook → outro) to the film length, best for product films, promos and social · `calm-piano` reflective explainers · `uplifting` launches/wins · `corporate` business/data · `lofi` productivity/chill · `playful` comedy/kids · `suspense` problems/risk · `epic` big reveals · `ambient` calm/wellness · `none`. Preview any: `stickman music --style lofi --duration 20 -o lofi.wav`. Bring your own: `"music": { "file": "assets/my-track.mp3" }` (must be cleared for your use).

The bed is generated to the film's exact length with intro and outro fades, normalised to −30 LUFS under a −16 LUFS voice - a clean, ducked-sounding mix without automation. Raise `volume` (0-2) for wordless films.

## Sound effects

Place on actions, in local clip time: `"sfx": [{ "at": 1.2, "name": "pop", "volume": 0.5 }]`. Film-wide: top-level `"sfx": [{ "at": 12.4, "name": "riser" }]` (global time). Your own file: `"name": "assets/sfx/door.wav"`.

Library (`stickman list sfx`): pop · click · tap · whoosh · swoosh · rise · riser · drop · thud · impact · boom · hit · ding · chime · success · error · notify · sparkle · magic · typewriter · keyboard · stamp · boing · zip · slide · coin · cash · camera · page · tick · tock · heartbeat · pluck · bubble · glitch · laugh · applause · alarm · beep · sting · projector. Intro/outro presets add their own SFX automatically (countdown beeps + sting, clapper snap, logo sting…).

Good habits:
- 0.3-0.5 volume for most SFX; impacts/stamps 0.5-0.6; keep ≥ 0.25 s between overlapping SFX.
- Hit the *visual* frame (a prop `pop(t)` → `"at": t`), not the word.
- Fewer is better: 1-3 per clip. Use `whoosh/swoosh` on transitions, `pop` on entrances, `success/chime` on payoffs, `typewriter/keyboard` on code, `page` on documents, `coin/cash` on money.

## Checks

- `stickman audio <dir>` warns when a fixed-length clip's VO overruns it.
- Final mix ≈ −15 to −17 LUFS integrated; check with `ffmpeg -i renders/x.mp4 -af ebur128 -f null -`.
- Listen to the first and last 5 s of the render: no clipped words, music fades cleanly.
