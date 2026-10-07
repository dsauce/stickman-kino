# Contributing to Stickman Kino

Thanks for helping stick figures take over the internet. 🕺

Stickman Kino is maintained by [Prerit Ahuja](https://preritahuja.com/) ([LinkedIn](https://www.linkedin.com/in/ahujaprerit/)).

## Ground rules

- Be kind. See the [Code of Conduct](CODE_OF_CONDUCT.md).
- Small, focused pull requests get merged fastest.
- Everything must stay **deterministic** (no `Math.random`, `Date`, timers or network in the engine) and **license-clean** (no copyrighted samples, fonts or images).

## Setup

```bash
git clone https://github.com/dsauce/stickman-kino.git && cd stickman-kino
npm install && node bin/stickman.mjs setup
npm test
```

## Great first contributions

| Contribution | Where | How to verify |
|---|---|---|
| **A new prop** | `engine/sm-props.js` → `def("name", c => {...}, accentSlot, "tags")` in the right section | add it to nothing else; `stickman snapshot samples/gallery --at 5.35,7.85` and check it in the props sheet |
| **A new pose** | `SM.poses` in `engine/sm-rig.js` | gallery poses sheet (`--at 2.85`) |
| **A character preset** | `SM.characters` in `engine/sm-rig.js` | gallery characters sheet |
| **A recipe** | `samples/recipes/scenes.js` (`// @recipe id \| Title` … `// @end`) + a clip in its `film.json` | `node scripts/cookbook.mjs`, `stickman check samples/recipes` |
| **A music style / SFX** | `lib/synth.mjs` (`STYLES` / `S`) | `stickman music --style x -o x.wav`, `npm test` |
| **A theme** | `SM.themes` in `engine/sm-core.js` (+ decor in `sm-world.js`) | gallery theme scenes |
| **Docs / skills** | `docs/`, `skills/` | read it as a newcomer would |

Style for props: line art drawn in a 100×100 box centred on (0,0), stroke = theme ink, white (paper) fill, one accent fill at most, rounded joins, no text unless it's the point (`$`, `?`). Look at neighbours and match them.

After changing the catalogue, regenerate docs: `node scripts/catalog.mjs && node scripts/cookbook.mjs`.

## Pull request checklist

- [ ] `npm test` passes
- [ ] `stickman check` passes for any sample you touched
- [ ] you **looked** at snapshots of what you changed (attach one to the PR!)
- [ ] docs/skills updated if behaviour changed; `CHANGELOG.md` entry under *Unreleased*

## Reporting bugs

Use the bug template. Include `stickman doctor` output, OS, the command, and a minimal `film.json` + `scenes.js` if it's a rendering issue.
