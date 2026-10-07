# Third-party notices

Stickman Kino is MIT-licensed (see [LICENSE](LICENSE)). It builds on the following work.

## Bundled in this repository

| Component | Where | License |
|---|---|---|
| Inter (Rasmus Andersson / The Inter Project Authors) | `engine/fonts/inter-*.woff2` | SIL Open Font License 1.1 |
| Caveat (The Caveat Project Authors) | `engine/fonts/caveat-*.woff2` | SIL Open Font License 1.1 |
| Permanent Marker (Font Diner) | `engine/fonts/permanent-marker-*.woff2` | SIL Open Font License 1.1 |

Full OFL text: [`engine/fonts/OFL.txt`](engine/fonts/OFL.txt).

## Installed from npm (not redistributed here)

| Package | Used for | License |
|---|---|---|
| [hyperframes](https://www.npmjs.com/package/hyperframes) | HTML → video rendering, checks, studio, Kokoro TTS bridge | Apache-2.0 |
| [gsap](https://gsap.com) | animation timeline (copied into each film's `.sm/` at build time) | GSAP Standard "No Charge" License, see https://gsap.com/standard-license |
| [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static) | encoding, loudness normalisation | GPL-3.0-or-later (FFmpeg binaries) |
| [@ffprobe-installer/ffprobe](https://www.npmjs.com/package/@ffprobe-installer/ffprobe) | media probing | LGPL-2.1 (FFprobe binaries) |
| @fontsource/* (dev) | source of the bundled font files | OFL-1.1 |

## Installed by `stickman setup` (optional)

| Component | License |
|---|---|
| [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) + [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) voice model | MIT / Apache-2.0 |
| [soundfile](https://github.com/bastibe/python-soundfile) | BSD-3-Clause |

## Ideas and methods

- **Stickman Video Director** by kaomei, https://github.com/kaomei/stickman-video-director (MIT License, Copyright (c) the Stickman Video Director authors). Stickman Kino's director skill adopts its high-level narrative structure (a five-stage retention arc: hook, disrupt assumptions, reveal, payoff, elevation/discussion), its three-beats-per-clip visual density rule, and the structure of its text-to-video prompt contract (style/character/palette locks, timed beats, audio-only dialogue, narrator and music continuity, negative constraints). No text was copied; the methods were re-expressed for `film.json`. Thank you, kaomei.
- **HyperFrames** composition contract and seek-safe animation guidance by HeyGen.

## Generated media

Music and sound effects produced by Stickman Kino are synthesised procedurally at build time (`lib/synth.mjs`) and contain no third-party samples.
