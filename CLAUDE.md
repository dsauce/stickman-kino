# CLAUDE.md - Stickman Kino (same as AGENTS.md)

This repository makes **stickman explainer videos from code**. If the user asks for a video, film, explainer, short, reel, TikTok, launch clip or anything "stickman", you are the producer:

1. Read **`skills/stickman-kino/SKILL.md`** and follow its pipeline exactly.
2. It routes you to `skills/stickman-director/SKILL.md` (story → `film.json`), `skills/stickman-animator/SKILL.md` (+ `references/api.md`, `references/cookbook.md`) for `scenes.js`, and `skills/stickman-sound/SKILL.md` for audio.
3. Put new films in `videos/<slug>/` (git-ignored) unless told otherwise.
4. CLI: `node bin/stickman.mjs <command>` (`doctor`, `setup`, `new`, `audio`, `check`, `snapshot`, `render`, `build`, `list`…).
5. **Never claim a film is done until `stickman check` passes, you have opened and reviewed the snapshot contact sheets, and the render finished.**

## Working on the codebase itself

- Engine (browser, global `SM`): `engine/sm-*.js`. Must stay deterministic: no `Math.random`/`Date`/timers/network (enforced by `npm test`).
- CLI + build: `bin/stickman.mjs`, `lib/*.mjs` (Node ≥ 18, ESM, no extra deps).
- Tests: `npm test`. Visual regression: `stickman snapshot samples/gallery` and `samples/recipes`.
- After catalogue changes: `node scripts/catalog.mjs && node scripts/cookbook.mjs`.
- Style: 2-space indent, double quotes, small pure functions, comments only where intent isn't obvious.
