# AI-video prompt export

Sometimes you want AI-generated footage (Gemini Omni Flash / Veo in Google Flow, Sora, Kling, Runway) instead of, or alongside, the code-rendered film. `stickman prompts <dir>` turns the same `film.json` into a **prompt package**: one self-contained prompt per clip.

```bash
stickman prompts samples/compound-interest     # → samples/compound-interest/prompts.md
```

Each prompt repeats every lock, because text-to-video clips are generated independently:

1. output spec (duration, ratio, 720p, 24 fps, synced audio)
2. environment lock for the theme (e.g. *flat pure-white canvas, no gradients*)
3. character lock (hollow-head faceless stick figure, or the red-beanie/yellow-tee "Zeke" for `studio`)
4. palette by meaning, in plain colour words (no hex codes, which models render as text)
5. composition for the format (left/centre/right for 16:9; stacked for 9:16)
6. three timed beats (from `clips[].beats`, or derived from `clips[].visual`)
7. the exact VO as audio-only dialogue (no captions, no speech bubbles)
8. an identical narrator description and music-continuity line in every prompt
9. a hand-off frame for the next clip
10. negatives (no photorealism, no drifting proportions, no text/logos, no morphing)

**Tips**
- Write strong `visual` lines in `film.json`: concrete physical actions and oversized props beat abstract ideas.
- Generation varies voice and music per clip. For a consistent result, keep the AI clips' SFX and lay Stickman Kino's own VO + music bed (`assets/`) over the stitched clips.
- Want precise text, numbers or charts? Use the code render. AI models still garble them.

The prompt structure follows the open method of [kaomei/stickman-video-director](https://github.com/kaomei/stickman-video-director) (MIT), adapted to `film.json`.
