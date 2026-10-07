# Audio

Everything audio is declared in `film.json` and built by `stickman audio <dir>` (also part of `stickman build`). The full playbook agents use is [`skills/stickman-sound/SKILL.md`](../skills/stickman-sound/SKILL.md); this page is the summary.

## Voice-over

```json
"voice": { "provider": "kokoro", "voice": "am_michael", "speed": 1.0 }
```

- **Kokoro** (default, free, local, Apache-2.0 model): `am_michael`, `am_adam`, `af_heart`, `af_nova`, `af_sky`, `bm_george`, `bf_emma`, `bf_isabella`, `ef_dora` (es), `ff_siwis` (fr), `jf_alpha` (ja), `zf_xiaobei` (zh).
- **say** (macOS), **espeak** (Linux), **files** (your own `assets/vo/<clipId>.wav`), **none**.
- Per-clip override: `"voice": { "voice": "af_heart" }` inside a clip.
- VO is loudness-normalised to −16 LUFS; raw takes are kept in `assets/vo/raw/`.
- Cached by a hash of text + voice + speed, so changing one clip only re-synthesises that clip. `--force` rebuilds everything.

Listen to all voices quickly:

```bash
for v in am_michael af_heart bm_george bf_emma; do node_modules/.bin/hyperframes tts "Hello, I am $v." -v $v -o /tmp/$v.wav; done
```

## Music

`"music": { "style": "uplifting" }`: an original bed is synthesised at the film's exact length, with intro and outro fades, normalised to −30 LUFS (sits under the voice).

| Style | BPM | Mood |
|---|---|---|
| `calm-piano` | 84 | quiet, thoughtful piano + soft pad |
| `uplifting` | 112 | bright plucks, steady kick |
| `corporate` | 100 | driving pulse + piano |
| `lofi` | 78 | warm Rhodes, lazy swung drums, vinyl crackle |
| `playful` | 120 | ukulele, glockenspiel, snaps |
| `suspense` | 70 | low drone, ticking, minor pulse |
| `epic` | 90 | strings + taiko |
| `ambient` | 60 | airy pads + bells |
| `pop` | 116 | **catchy** whistle-pluck hook, claps, pumping bass; sectioned arrangement (intro, verse, hook, break, hook, outro) |

Tweak with `bpm`, `key` (`"C"`, `"F#"`…), `seed` (variation), `volume` (0-2). Preview: `stickman music --style epic --duration 20 -o epic.wav`. Your own track: `"music": { "file": "assets/track.mp3" }`.

## Sound effects

41 synthesised effects (`stickman list sfx`): pop, click, tap, whoosh, swoosh, rise, riser, drop, thud, impact, boom, hit, ding, chime, success, error, notify, sparkle, magic, typewriter, keyboard, stamp, boing, zip, slide, coin, cash, camera, page, tick, tock, heartbeat, pluck, bubble, glitch, laugh, applause, alarm, beep, sting, projector.

```json
"sfx": [{ "at": 1.2, "name": "pop", "volume": 0.4 }]          // inside a clip: local seconds
"sfx": [{ "at": 30.5, "name": "assets/door.wav" }]           // top level: global seconds, your file
```

## Licensing

Music and SFX are generated from code at build time; there are no samples, so they're yours to use anywhere. Kokoro's model is Apache-2.0. If you supply your own music, voice or SFX files, you are responsible for their licences.
