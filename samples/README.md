# Samples

Each folder is a complete film: `film.json` (script) + `scenes.js` (choreography). Build any of them:

```bash
node bin/stickman.mjs build samples/<name>        # → samples/<name>/renders/<name>.mp4
```

| Sample | Format · theme | What it shows |
|---|---|---|
| [`chorus`](chorus) | 16:9 · custom brand theme · 58 s | **The front-page film.** A fictional app ad: countdown intro with props bursting around the title, night-kitchen standoff, failed fixes, phone-app reveal, leaderboard, a camera-whip trash race, product lockup, "made with" outro. Pop music, female narrator. |
| [`titles`](titles) | 16:9 · light · 33 s | All 8 intro/outro presets, declared purely in `film.json` (no scene code). |
| [`hello-stickman`](hello-stickman) | 16:9 · light · 15 s | **Start here.** The smallest complete film: walk, wave, idea, chart, celebrate, voice cues. |
| [`showcase`](showcase) | 16:9 · light → chalkboard → neon · 44 s | Five-beat arc, spotlight, rain of props, office scene with flow + typed code, camera-follow run with a feature list, theme switching, logo end card. |
| [`compound-interest`](compound-interest) | 16:9 · paper · 50 s | Data storytelling: counter, snowball rolling down a hill, bar comparison, a figure walking along a growth curve, labels and annotations. British voice. |
| [`two-minute-rule`](two-minute-rule) | **9:16** · dark · 21 s | Vertical short with pop captions from the VO, big figure staging, momentum run with speed lines, checklist. Female voice, lo-fi bed. |
| [`recipes`](recipes) | 16:9 · light · 17 × 5 s | The tested cookbook: one scene per recipe (generates `skills/stickman-animator/references/cookbook.md`). |
| [`gallery`](gallery) | 16:9 · all themes | Catalogue stills: every pose, prop, character, chart, diagram, text effect, FX, theme and environment. |

Watch them all on the [film page](https://dsauce.github.io/stickman-kino/). Rendered files live in [`docs/media`](../docs/media).
