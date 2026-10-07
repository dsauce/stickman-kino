# Changelog

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-10-02

### Added
- **Agent skills**: `stickman-kino` (producer/QA loop), `stickman-director` (five-beat script + storyboard → film.json), `stickman-animator` (scenes.js), `stickman-sound` (voice, music, SFX).
- **Engine**: rigged stickman (58 poses, 4-phase walk/run, jump/climb/sit/kneel/fall, 2-bone arm IK, faces with 6 emotions, 14 character presets, outfits, hats, hair, props in hand, throwing); 202 props; 19 chart/diagram builders; kinetic typography (12 entrances, word annotations, titles, lower thirds, labels, bubbles, lists, slams, quotes, auto captions); 22 effects; camera (focus/push/follow/whip/shake/tilt); 15 transitions; 12 environments; 8 themes + custom themes.
- **CLI**: `new`, `build`, `audio`, `compose`, `check`, `snapshot`, `preview`, `render`, `gif`, `poster`, `prompts`, `list`, `music`, `sfx`, `setup`, `doctor`, `install-skills`.
- **Audio**: Kokoro local TTS (12 voices) + say/espeak/files/none providers with hash caching and loudness normalisation; 9 procedural music styles; 41 synthesised SFX.
- **Intros & outros**: `sc.intro("countdown" | "clapper" | "logo" | "spotlight")`, `sc.outro("cta" | "credits" | "endcard" | "kino")`, declarable per clip in film.json (`"intro": {…}` / `"outro": {…}`) with automatic durations and sound effects; `sc.button()`.
- **Music**: catchy sectioned `pop` style (intro → verse → hook → break → hook → outro, pentatonic whistle-pluck hook); new SFX `beep`, `sting`, `projector`.
- **Props**: home & chores set (dishes, sink, broom, washer, laundry, trashbag, bin, fridge, sofa, tv, vacuum, spray, sponge), cinema set (clapper, filmreel, filmstrip, popcorn, ticket, director-chair, spotlight), shoe, snowball.
- **Samples**: **chorus** (the 58 s front-page ad), showcase, hello-stickman, compound-interest (paper theme), two-minute-rule (9:16, pop captions), titles (all intro/outro presets, JSON only), recipes (17 tested recipes), gallery (catalogue stills).
- JSON Schema for film.json, tests, CI, docs, brand assets.
