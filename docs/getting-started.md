# Getting started

> **No video-generation AI is involved, anywhere.** Stickman Kino never calls Sora, Veo, Runway, Kling or any other video model or API. It draws every frame itself, from code, on your machine: no video API keys, no video credits, no uploads. The only AI in the loop is the coding agent you use to direct it.

## Requirements

| | |
|---|---|
| **Node.js 18+** | the CLI and build tools |
| **Chrome / Chromium** | rendering. `stickman setup` finds Playwright's Chromium or downloads one via HyperFrames |
| **Python 3.10+** *(optional)* | for the free local Kokoro voice. `stickman setup` creates a private venv (uses [`uv`](https://docs.astral.sh/uv/) if present) |
| ffmpeg | bundled via `ffmpeg-static`, nothing to install |

Works on macOS, Linux, Windows and **WSL2**. On Linux/WSL without sudo, `stickman setup` extracts Chrome's missing shared libraries into `.stickman/libs` for you.

## Install

```bash
git clone https://github.com/dsauce/stickman-kino.git
cd stickman-kino
npm install
node bin/stickman.mjs setup        # add --no-tts to skip the voice engine
node bin/stickman.mjs doctor       # everything green?
npm link                            # optional: puts `stickman` on your PATH
```

## Your first render

```bash
stickman build samples/hello-stickman
open samples/hello-stickman/renders/hello-stickman.mp4   # or xdg-open / start
```

`build` = `audio` (voice, music, SFX) → `compose` (writes index.html) → `check` → `render`.

## Your first film

```bash
stickman new videos/my-film --clips 4 --format 16:9 --theme light --music uplifting
```

You get:

```text
videos/my-film/
├── film.json      ← the script: format, theme, voice, music, clips (VO + sfx)
├── scenes.js      ← the choreography: one film.scene(id, sc => …) per clip
├── storyboard.md  ← human plan (optional but recommended)
└── .gitignore     ← ignores everything generated
```

1. Write the narration in `film.json` (`clips[].vo`), about 22 words per 10 s.
2. `stickman audio videos/my-film`: synthesises the voice, and `"duration": "auto"` clips now match it.
3. Animate in `scenes.js` (see the [engine API](engine-api.md) and the [cookbook](../skills/stickman-animator/references/cookbook.md)).
4. `stickman check videos/my-film` until it says **Check passed**.
5. `stickman snapshot videos/my-film`: look at `snapshots/contact-sheet*.jpg`.
6. `stickman render videos/my-film --quality draft` (fast), then `--quality looks` for the final.

Live editing: `stickman preview videos/my-film` opens the HyperFrames studio. Re-run `stickman compose` after editing `scenes.js` and refresh.

## With an agent (recommended)

Open the repo in Claude Code / Codex / Cursor / Gemini CLI and ask for a film. See [agents.md](agents.md).

## CLI reference

| Command | What it does |
|---|---|
| `stickman new <dir> [--format 16:9\|9:16\|1:1\|4:5] [--theme] [--clips] [--music] [--voice] [--title]` | scaffold a film |
| `stickman audio <dir> [--force] [--provider kokoro\|say\|espeak\|files\|none]` | voice-over, music, SFX (cached by content hash) |
| `stickman compose <dir>` | write `index.html`, `film.js`, copy the engine into `.sm/` |
| `stickman check <dir>` | HyperFrames lint, runtime, layout, motion and contrast checks |
| `stickman snapshot <dir> [--at 1,4.5,9]` | PNGs + contact sheets (defaults: two moments per clip) |
| `stickman preview <dir>` | live studio |
| `stickman render <dir> [--quality draft\|looks\|delivery] [--format mp4\|webm\|gif] [--fps 30] [--out file] [--workers n] [--low-memory]` | render (switches to low-memory streaming automatically when disk space is short) |
| `stickman build <dir> [--quality] [--no-render] [--ignore-check]` | everything |
| `stickman gif <dir> [--from 0 --to 8 --width 640 --fps 12]` | GIF from the render |
| `stickman poster <dir> [--at 3]` | JPG still |
| `stickman prompts <dir>` | AI text-to-video prompt package |
| `stickman list props\|poses\|characters\|themes\|transitions\|music\|sfx` | catalogue |
| `stickman music --style <s> --duration <sec> -o file.wav` | standalone music bed |
| `stickman sfx <name> -o file.wav` | standalone sound effect |
| `stickman setup [--no-tts]` · `stickman doctor` | toolchain |
| `stickman install-skills [--target all\|claude\|codex\|agents] [--project <dir>]` | install agent skills |

Set `STICKMAN_DEBUG=1` for stack traces.
