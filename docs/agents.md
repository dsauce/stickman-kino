# Using Stickman Kino with AI agents

Stickman Kino ships four [agent skills](../skills): plain-Markdown playbooks any capable coding agent can follow.

| Skill | Job |
|---|---|
| [`stickman-kino`](../skills/stickman-kino/SKILL.md) | producer: runs the whole pipeline, enforces the QA loop |
| [`stickman-director`](../skills/stickman-director/SKILL.md) | brief → retention-shaped script + storyboard → `film.json` |
| [`stickman-animator`](../skills/stickman-animator/SKILL.md) | storyboard → `scenes.js` using the engine, synced to the VO |
| [`stickman-sound`](../skills/stickman-sound/SKILL.md) | voices, music, SFX, loudness |

## What counts as an "agent"

Stickman Kino needs an AI coding agent that can **read and write files and run terminal commands on your computer**. That agent is the only AI involved: it writes the script and the scene code, and the engine renders the frames locally.

| Works | Doesn't work on its own |
|---|---|
| Claude Code, OpenAI Codex CLI, Cursor, Windsurf, GitHub Copilot (agent mode), Gemini CLI, Aider | chat-only web apps (ChatGPT, claude.ai, Gemini web): they can't run the renderer, but they can draft `film.json` / `scenes.js` that you then build with `stickman build` |

Cloud-hosted coding agents (e.g. agents that run in a remote sandbox) may work if the sandbox can install Node and Chrome, but they're untested.

## The fastest path: open the repo and ask

Every agent below reads `AGENTS.md` and/or `CLAUDE.md` at the repo root, which points it at the skills. So:

```text
cd stickman-kino
<start your agent>
> Make a 60-second stickman explainer about how vaccines train the immune system.
  16:9, calm tone, British narrator.
```

Good prompts include: **topic or source** (paste text, a URL's content, or point at a file/repo), **length**, **format** (16:9 / 9:16 / 1:1), **tone**, optionally **theme / voice / music**. Say "don't ask me anything, decide" if you want zero questions.

Useful follow-ups:
- "Make a 9:16 cut for TikTok with pop captions."
- "Swap to the chalkboard theme and a female voice."
- "Clip 3 is too static, add a camera push and have him point at the chart."
- "Export AI-video prompts too."

## Claude Code

- **In this repo**: works out of the box (reads `CLAUDE.md`; skills are under `skills/`).
- **Everywhere**: `node bin/stickman.mjs install-skills --target claude` copies the skills to `~/.claude/skills/`. Restart Claude Code; they show up in the skill list.
- **As a plugin**: `/plugin marketplace add dsauce/stickman-kino`, then `/plugin install stickman-kino`.
- Per project: `node bin/stickman.mjs install-skills --project /path/to/project` → `.claude/skills/`.

## OpenAI Codex (CLI / IDE)

- In this repo: Codex reads `AGENTS.md`.
- Everywhere: `node bin/stickman.mjs install-skills --target codex` → `$CODEX_HOME/skills` (default `~/.codex/skills`). Invoke with `$stickman-kino` or just describe the film.

## Cursor · Windsurf · GitHub Copilot (agent mode) · Gemini CLI · Aider · others

They read `AGENTS.md` at the repo root (Gemini CLI also reads `GEMINI.md` if you symlink or copy it). If yours doesn't, start with:

```text
Read AGENTS.md and skills/stickman-kino/SKILL.md, then make a film about …
```

Generic location: `node bin/stickman.mjs install-skills --target agents` → `~/.agents/skills/`.

## What the agent will do

1. `stickman doctor` (and `setup` if needed)
2. Write `videos/<slug>/storyboard.md` + `film.json`
3. `stickman audio` → real VO durations
4. Write `scenes.js`
5. `stickman check` → fix until **Check passed**
6. `stickman snapshot` → **open the contact sheets and look**, fix and repeat
7. `stickman render` → MP4 and a short summary of what it decided

The skills require the agent to look at its own frames before claiming success. That one rule is the difference between "it compiled" and "it looks right".

## Globally installed skills: how they find the engine

`install-skills` writes a `STICKMAN_HOME` file next to each installed `SKILL.md` containing the absolute path of your clone. The skills tell the agent to run `node <STICKMAN_HOME>/bin/stickman.mjs …`. Move the clone? Re-run `install-skills`.
