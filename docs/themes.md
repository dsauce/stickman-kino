# Themes

Set in `film.json → theme`, or per scene with `film.scene(id, fn, { theme: "chalkboard" })`.

![Themes](images/catalog-themes.png)

| Theme | Look | Good for |
|---|---|---|
| `light` | white canvas, black ink; red · blue · gold | default explainers, business, education |
| `dark` | near-black canvas, white ink; pink · sky · amber | tech, night, high-contrast shorts |
| `paper` | warm paper with speckle + vignette, Caveat + Permanent Marker fonts | personal finance, stories, "hand-drawn" feel |
| `chalkboard` | green board with smudges and a wooden frame, chalk-white ink | teaching, history, maths |
| `blueprint` | engineering blue with a grid | product, engineering, architecture |
| `neon` | black with a soft glow | gaming, nightlife, AI/tech hype |
| `studio` | bright studio, perspective floor grid, cyan glow (pair with `character: "zeke"`) | Apple-keynote-style product explainers |
| `sunset` | warm peach sky with a low sun | motivational, wellness, travel |

## Semantic accents

Every theme has three accents. Use them by **meaning**, not decoration:

| Slot | Token | Meaning |
|---|---|---|
| accent 1 | `"a1"` | problem · danger · the old way · alerts |
| accent 2 | `"a2"` | hero · solution · the product · links |
| accent 3 | `"a3"` | reward · evidence · highlights · money |

Plus `"ink"`, `"muted"`, `"soft"`, `"paper"`, `"bg"`. All engine colour options accept these tokens or any CSS colour.

## Custom / brand themes

```json
"theme": {
  "extends": "light",
  "bg": "#FFFFFF",
  "ink": "#00343E",
  "muted": "#5B6B70",
  "soft": "#E6F2EF",
  "accents": ["#7B0024", "#007272", "#FFC000"],
  "font": "Inter",
  "display": "Inter",
  "decor": null
}
```

To use a brand font, add `@font-face` rules to a CSS file in your film folder and reference it. Or edit `engine/sm.css` in your fork. Keep text readable: the checker flags contrast below WCAG AA.
