# Security policy

## Supported versions

The latest release on `main` receives security fixes.

## Reporting a vulnerability

Please **do not** open a public issue. Use GitHub's [private vulnerability reporting](https://github.com/dsauce/stickman-kino/security/advisories/new). We aim to acknowledge reports within 3 working days and to ship a fix or mitigation within 30 days.

## Scope notes

- Stickman Kino runs locally. `scenes.js` is executed in headless Chrome during checks and renders, so **treat films from untrusted sources like code**: read `scenes.js` before building someone else's film.
- `stickman setup` downloads packages (`apt-get download`, `pip`/`uv`, Chrome via HyperFrames/Playwright) from their official sources. Review the setup code (`lib/setup.mjs`) if your environment requires it.
- No telemetry: the CLI disables HyperFrames telemetry (`HYPERFRAMES_NO_TELEMETRY=1`).
