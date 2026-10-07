# Publishing checklist (maintainers)

The repo is set up for **github.com/dsauce/stickman-kino** (MIT © Prerit Ahuja).

## First push

```bash
gh repo create dsauce/stickman-kino --public --source . --description "Stickman films, directed by your AI agent, rendered as code. No video-generation APIs." --homepage "https://github.com/dsauce/stickman-kino"
git add -A && git commit -m "Stickman Kino 1.0.0"
git push -u origin main
gh repo edit dsauce/stickman-kino --enable-discussions --add-topic stickman,animation,explainer-video,agent-skills,claude-code,codex,ai-agents,text-to-video,motion-graphics,hyperframes
gh release create v1.0.0 --title "Stickman Kino 1.0.0" --notes-file CHANGELOG.md docs/media/chorus.mp4
```

## In the GitHub UI (2 minutes)

1. **Social preview**: Settings → General → Social preview → upload `assets/brand/social-preview.png`.
2. **Inline video player on the front page (optional)**: GitHub only plays videos uploaded through its editor. Edit `README.md` on github.com, drag `docs/media/chorus.mp4` onto the editor, and paste the generated `https://github.com/user-attachments/assets/…` line just under the hero GIF.
3. **Security**: Settings → Code security → enable *Private vulnerability reporting*.
4. Check that the **CI** badge is green (the `render-smoke` job installs Chromium and renders `samples/recipes`).

## Regenerating media after engine changes

```bash
node scripts/catalog.mjs && node scripts/cookbook.mjs     # docs from source
node bin/stickman.mjs build samples/chorus --quality delivery && cp samples/chorus/renders/chorus.mp4 docs/media/
node bin/stickman.mjs gif samples/chorus --from 0 --to 57.8 --width 720 --fps 12 --out docs/images/chorus.gif
node bin/stickman.mjs snapshot samples/gallery          # catalogue stills → docs/images/catalog-*.png
node scripts/brand.mjs                                    # logo/icon PNGs
node bin/stickman.mjs snapshot assets/brand/social-card --at 1.9 && cp assets/brand/social-card/snapshots/frame-00-at-1.9s.png assets/brand/social-preview.png
```

## Optional: npm

`npm publish` (package `stickman-kino`, `files` already scoped). Users could then run `npx stickman-kino`.
