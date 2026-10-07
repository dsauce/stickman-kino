# FAQ

> **No video-generation AI is involved, anywhere.** Stickman Kino never calls Sora, Veo, Runway, Kling or any other video model or API. It draws every frame itself, from code, on your machine. No keys, no credits, no uploads.

**Do I need an API key or a paid service?**
No. Not for video, not for voice, not for music. Rendering, voice (Kokoro), music and SFX all run locally. Your coding agent is the only thing that might cost money, and you can also write `scenes.js` by hand.

**Which agents work?**
Anything that can read files and run shell commands: Claude Code, OpenAI Codex, Cursor, Windsurf, GitHub Copilot agent mode, Gemini CLI, Aider… See [agents.md](agents.md).

**How long does a render take?**
On a laptop without a GPU (e.g. WSL2), about 2-3 minutes per minute of 1080p at `looks` quality. Draft quality is much faster. Snapshots take seconds.

**Can I use the videos commercially?**
Yes. The code is MIT, and generated music/SFX are original. Check the licence of anything you add (your own music, images, voices).

**Does it use a video-generation model like Sora or Veo?**
No, and that's the point. AI video models *generate* pixels, so characters drift, text garbles, and every fix means regenerating (and paying again). Stickman Kino *renders* a scene description, like a game engine or a slide deck. The only AI in the loop is the coding agent you already use, which writes the script and the scene code. If you *want* AI footage too, `stickman prompts` exports the same storyboard as text-to-video prompts. It's optional and entirely separate.

**How is this different from Stickman Video Director?**
[Stickman Video Director](https://github.com/kaomei/stickman-video-director) is a great prompt-writing skill that produces prompts for AI video models. Stickman Kino renders the film itself from code (consistent characters, real text and charts, editable frames, synced voice), and can *also* export AI-video prompts (`stickman prompts`). We credit SVD's narrative structure in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

**Vertical videos?**
`"format": "9:16"` plus `"captions": "pop"`. The director skill recomposes staging for portrait (bigger figure, stacked layout, captions low).

**Other languages?**
Kokoro has Spanish, French, Japanese and Mandarin voices; set `voice.voice` and write the VO in that language. Fonts cover Latin script out of the box. For other scripts add a font (see [themes.md](themes.md)).

**Can I add my own props, poses, characters?**
Yes: `SM.defineProp(name, drawFn, accent, tags)`, `SM.poses.myPose = {…}`, `SM.characters.myHero = {…}` at the top of `scenes.js`, or contribute them upstream ([CONTRIBUTING.md](../CONTRIBUTING.md)).

**Can I put real screenshots or logos in?**
`sc.image("assets/screenshot.png", { x, y, w, h })`. Keep the files inside the film folder.

**Can I edit in a timeline UI?**
`stickman preview <dir>` opens the HyperFrames studio for scrubbing and inspection. The source of truth stays `film.json` + `scenes.js`.

**Why HyperFrames + GSAP?**
Deterministic frame-by-frame rendering from HTML, with real typography, SVG and CSS, and a mature animation library. See [how-it-works.md](how-it-works.md).
