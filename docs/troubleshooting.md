# Troubleshooting

Run `stickman doctor` first: it pinpoints most problems.

## Setup

**`Chrome is missing shared libraries` (Linux / WSL)**
`stickman setup` downloads the missing `.deb` packages with `apt-get download` and extracts them into `.stickman/libs` (no sudo). If that's not possible: `sudo apt-get install -y libnss3 libnspr4 libasound2 libatk-bridge2.0-0 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libpango-1.0-0 libcairo2`.

**No Chrome found**
`npx playwright install chromium` (or `chromium-headless-shell`), or set `HYPERFRAMES_BROWSER_PATH=/path/to/chrome`, then `stickman setup` again.

**Kokoro TTS failed**
`stickman setup` installs it into `.stickman/venv`. It needs Python 3.10-3.12; install [`uv`](https://docs.astral.sh/uv/) and setup will fetch a matching Python for you. The first synthesis downloads the model (~300 MB). Alternatives: `"provider": "say"` (macOS), `"espeak"`, `"files"`, `"none"`.

## Check / render

**`page_error: …` in `stickman check`**
Your `scenes.js` threw. The message names the problem (typo'd method, undefined variable). Common: a scene id that doesn't exist in `film.json`, or calling `sc.text(...).in()` with a misspelt effect.

**`Missing window.__timelines registration` / timeline didn't advance**
You edited `index.html` by hand or `scenes.js` doesn't call `SM.film()`. Re-run `stickman compose`.

**Render stalls with "Navigation timeout" (WSL)**
Orphaned headless browsers hold the software-GL context: `pkill -f chrome-headless-shell; pkill -f chrome-linux`. Then retry with `--workers 2`.

**Render is slow**
WSL2 / no GPU renders via software GL (~2-3 min per minute of 1080p). Use `--quality draft` while iterating, snapshots for layout work, and render `looks`/`delivery` once.

**Something appears before it should / flickers**
An element was created visible and animated in later. Create it with `{ hidden: true }` and use `.pop(t)` / `.fadeIn(t)`; text is hidden until `.in(t)` by default.

**A figure "snaps" or ignores an action**
Actions on one figure must be scheduled in time order. A later call at an earlier time fights tweens already scheduled. `celebrate()` schedules a return to `stand` 1 s later; pass `{ hold: true }` if you pose again soon after.

**Arms pass through the head**
Steep overhead targets do that with any 2-bone arm. Use `present`/`pointUp`, or pass pose overrides (`bob.pose("cheer", t, 0.3, null, { uaL: -140, faL: -150 })`).

**Text overlaps / contrast warnings**
`stickman check` lists overlapping text blocks and low-contrast text. Move one block or use `muted` → `ink`. Accents on light themes pass AA at large sizes.

**Audio out of sync with visuals**
Run `stickman audio` after changing VO text, so `film.js` gets real durations (before that, cue times are word-count estimates). Then `sc.cue("word")` lands within about 0.2 s.

## Still stuck?

Open an issue with `stickman doctor` output, your OS, and the failing command (set `STICKMAN_DEBUG=1` for a stack trace).
