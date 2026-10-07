---
name: stickman-director
description: Direct a stickman film - turn a topic, notes, article, product, repo or transcript into a retention-shaped script and a scene-by-scene storyboard, written as Stickman Kino's film.json + storyboard.md. Use for scripting, storyboarding, pacing, hooks, narration word budgets and visual metaphors for stick-figure explainers, shorts and launch videos. Also exports AI text-to-video prompt packages.
---

# Stickman director

Output two files in the film folder: **`storyboard.md`** (human-readable plan) and **`film.json`** (the machine contract). Schema: `<home>/schema/film.schema.json` · spec: `<home>/docs/film-json.md`.

## 1. Settle the frame (decide or ask once)

| Setting | Default | Notes |
|---|---|---|
| length | 45-60 s | round to ~8-10 s clips; 30 s = 3-4 clips, 60 s = 6-7, 90 s = 9-10 |
| format | `16:9` | `9:16` for Shorts/Reels/TikTok, `1:1` / `4:5` for feeds |
| theme | `light` | `dark`, `paper` (hand-drawn), `chalkboard` (teaching), `blueprint` (engineering), `neon` (tech/night), `studio` (Apple-keynote, use `zeke` character), `sunset` (warm stories), or a custom brand theme |
| voice | `am_michael` (warm US male) | `af_heart` (bright US female), `bm_george` (British male), `bf_emma` (British female); see stickman-sound |
| music | match tone | `pop` catchy promos/products/social · `calm-piano` reflective · `uplifting` launches/wins · `corporate` business · `lofi` productivity · `playful` comedy/kids · `suspense` problems/risk · `epic` climaxes · `ambient` calm |

## 2. Shape the story - pick ONE engine

**A. Five-beat retention arc (default for explainers & shorts).**
1. *Hook* (first 2-4 s): a counter-intuitive question, a surprising number, or a visual paradox. Never "In this video…".
2. *Disrupt*: state what people assume, then break it in one sentence.
3. *Reveal*: the hidden mechanism / the real obstacle.
4. *Payoff* (1-2 clips): the core insight with a concrete example or number.
5. *Close*: a punchy takeaway + an open question or a clear CTA.

**B. Problem → Solution → Proof → CTA** (product/launch films). Show the pain physically, introduce the product as the turn, prove with real UI/output/metric from the source, end on access/CTA.

**C. Story arc** (motivational): want → obstacle → attempt fails → insight → transformation → invitation.

**D. Listicle** ("3 ways to…"): hook → item 1 → item 2 → item 3 (strongest last) → recap/CTA. One clip per item.

**E. Tutorial**: outcome first (show the result), then steps with one action per clip, then recap.

## 2b. Bookend it: intro + outro (always)

Every film opens with a **3-4 s intro** and closes with a **4-6 s outro**. They're presets declared straight in `film.json`, so no scene code is needed:

| Intro | Feels like | Use for |
|---|---|---|
| `countdown` | film-leader 3-2-1 → slam title | stories, "a very short film about…", playful promos |
| `clapper` | clapperboard snaps shut → title | behind-the-scenes, tutorials, episodic series ("Scene 1") |
| `logo` | logo pops with burst + sparkles → title | brands, products, channels |
| `spotlight` | dark stage, a spotlight sweeps → reveal | dramatic reveals, launches, "and now…" |

| Outro | Use for |
|---|---|
| `cta` | logo + title + tagline + CTA button + URL (product, signup, link) |
| `endcard` | YouTube-style "watch next" tiles + Subscribe |
| `credits` | rolling credits (story films, class projects) |
| `kino` | "Made with Stickman Kino" + Star on GitHub (showcases of this tool) |

The intro title doubles as the **hook**: make it a question or a promise ("Whose turn is it?", "The 2-minute rule"). The outro carries the **CTA**. The narration starts in the first content clip.

## 3. Write the narration

- Spoken English, short sentences, concrete nouns. Read it aloud in your head.
- Budget: **≈ 2.4 words/second** (≈ 22-25 words per 10 s clip). Kokoro at speed 1.0 runs ~2.5 w/s.
- One idea per clip; the clip's VO must make sense with its picture.
- Numbers: write them the way they should be spoken ("two thousand", "forty years") unless you want digits read literally.
- Faithfulness: keep the source's claims, names and numbers; strengthen structure, don't invent facts. Mark illustrations as such on screen.
- Put a **callback** at the end to the hook (same object, same line, same place).

## 4. Direct the pictures (what makes it feel premium)

For every clip write a `visual` line and plan **three beats**: *establish (0-3 s) → escalate (3-7 s) → payoff/hand-off (7-10 s)*. Rules:

- **A visible change every 2-3 s**: a pose change, a prop pop, a camera move, a chart growing, a word highlighting.
- **Concrete metaphors over labels**: a mountain that shrinks, a snowball that grows, a funnel that floods, a wall that crumbles, a thread that links a claim to its source.
- **Physical action**: the figure walks, points, pushes, climbs, throws, sits, celebrates. Never idle for more than ~2 s.
- **One focal point** at a time; screen text ≤ 6 words, max 2 text blocks on screen.
- **Continuity**: end each clip on a pose/object/direction the next clip opens on, or use matching transitions (`exit("wipe-left")` → `enter("wipe-left")`).
- **Semantic colour**: theme accents are slots - `a1` problem/danger/old way, `a2` hero/solution, `a3` reward/evidence. Keep it to these three.
- **Format-aware**: 16:9 → left/centre/right staging, lateral moves, clean third for text. 9:16 → stacked vertically, bigger figure (size 420+), captions low (`captions: "pop"`), action in the middle 60 %.

Catalogue to draw from (run `stickman list props|poses|characters|themes|transitions`): ~190 props (documents, devices, money, charts, nature, transport, science, cinema…), 58 poses, 14 characters (classic, zeke, office, exec, builder, scientist, grad, king, chef, dress, kid, robot, agent…), 8 themes, 15 transitions, environments (city, hills, mountains, road, ocean, room, office, stage, space, night, park), charts (bar, line, pie/donut, counter, stat, progress, gauge, flow, timeline, venn, versus, network, pyramid, cycle, matrix, funnel, table, balance).

## 5. Write the files

`storyboard.md` - one table row per clip:

| Clip | Beat | On screen (3 beats) | VO | SFX / music | Transition out |
|---|---|---|---|---|---|

`film.json` - example:

```json
{
  "$schema": "../../schema/film.schema.json",
  "title": "Why compound interest feels like magic",
  "format": "16:9",
  "theme": "paper",
  "voice": { "provider": "kokoro", "voice": "bm_george", "speed": 0.95 },
  "music": { "style": "calm-piano", "volume": 1 },
  "captions": false,
  "clips": [
    { "id": "intro", "intro": { "style": "logo", "logo": "piggybank", "title": "The [magic] of time", "subtitle": "compound interest in 50 seconds" } },
    { "id": "hook", "label": "Golden hook", "duration": "auto",
      "vo": "Put one hundred dollars away today. In forty years, it could be worth over two thousand.",
      "visual": "Figure drops a coin in a piggy bank; a counter races from $100 to $2,172.",
      "sfx": [{ "at": 0.9, "name": "coin", "volume": 0.5 }] },
    { "id": "outro", "outro": { "style": "cta", "title": "Start [today]", "cta": "Subscribe", "url": "youtube.com/@you" } }
  ]
}
```

- `id`: short, letters first (`hook`, `c2`, `demo-1`). Becomes the scene id in `scenes.js`.
- `duration: "auto"` = VO length + 0.4 s lead + 0.6 s tail (rounded to 0.5 s). Use a number for wordless clips; `tail` to hold an ending; `voSpan: true` when one VO intentionally spans the next clips.
- `sfx[].at` is local seconds inside the clip; names from `stickman list sfx` (pop, whoosh, ding, success, stamp, typewriter, keyboard, coin, page, impact, riser…).

## 6. Optional: AI-video prompt package

After `film.json` exists, `stickman prompts <dir>` writes `prompts.md`: one self-contained text-to-video prompt per clip (style lock, character lock, 3 timed beats, quoted VO, narrator + music continuity, negatives) for Gemini Omni Flash / Veo / Sora / Kling. Give each clip a strong `visual` (and optional `beats: [{ "t": "0-3s", "do": "…" }]`) to make these good.

## Checklist before handing to the animator

- [ ] intro preset (3-4 s, title = hook) and outro preset (CTA) are in `film.json`
- [ ] hook lands in the first 3 s after the intro; last content clip closes with takeaway + question/CTA
- [ ] ≈ 2.4 words/s per clip; total length on target
- [ ] every clip has `visual`, a distinct job, and 3 planned beats
- [ ] no unsupported facts; illustrative numbers flagged
- [ ] format-specific staging decided; theme + accents assigned meanings
- [ ] `film.json` validates (`stickman compose <dir>` fails loudly if not)
