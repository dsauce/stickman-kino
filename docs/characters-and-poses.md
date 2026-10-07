# Characters & poses

![Characters](images/catalog-characters.png)

## Characters (14)

```js
sc.character("zeke", { x: 600 })        // preset
sc.figure({ x: 600, hat: "cap", hatColor: "#1D7FE0", shirt: "#FFC531", face: "dots", glasses: true })
```

| Preset | Options |
|---|---|
| `classic` | `{}` |
| `filled` | `{ head: "filled" }` |
| `zeke` | `{ hat: "beanie", hatColor: "#E63946", shirt: "#FFC531", shorts: "ink", face: "dots" }` |
| `office` | `{ shirt: "#3B6FB6", tie: "#E63946", face: "dots" }` |
| `exec` | `{ shirt: "#2B2D42", tie: "#F2B400", face: "dots", glasses: true }` |
| `builder` | `{ hat: "hardhat", hatColor: "#FFB703", shirt: "#FB8500", face: "dots" }` |
| `scientist` | `{ glasses: true, shirt: "#FFFFFF", hair: "spiky", face: "dots" }` |
| `grad` | `{ hat: "grad", face: "dots" }` |
| `king` | `{ hat: "crown", hatColor: "#F2B400", face: "dots" }` |
| `chef` | `{ hat: "chef", shirt: "#FFFFFF", face: "dots" }` |
| `dress` | `{ dress: "#E63946", hair: "bun", face: "dots" }` |
| `kid` | `{ height: 0.68, hat: "cap", hatColor: "#1D7FE0", face: "dots" }` |
| `robot` | `{ head: "square", antenna: true, face: "dots" }` |
| `agent` | `{ head: "square", antenna: true, face: "dots", color: "#1D7FE0" }` |

**Build-your-own options**: `size` (px, default 300 at 1080p), `height` (multiplier), `color` (ink), `face: "dots"`, `head: "filled" | "square"`, `antenna`, `hat: "beanie" | "cap" | "hardhat" | "tophat" | "crown" | "grad" | "chef" | "beret" | "party"`, `hatColor`, `hair: "bun" | "ponytail" | "spiky" | "bob"`, `glasses`, `shirt`, `shorts`, `dress`, `tie` (colours or `"ink"`), `facing: 1 | -1`, `pose`, `z`.

Faces (`face: "dots"`): `emote("happy" | "grin" | "neutral" | "surprised" | "worried" | "sad", t)`, `blink(t)`, `blinks(t0, t1)`.

## Poses (58)

![Poses](images/catalog-poses.png)

`stand` · `idle` · `walkA` · `walkPA` · `walkB` · `walkPB` · `runA` · `runPA` · `runB` · `runPB` · `sneakA` · `sneakB` · `crouch` · `leap` · `tuck` · `climbA` · `climbB` · `hang` · `sit` · `sitEdge` · `slump` · `sitFloor` · `relax` · `meditate` · `kneel` · `lie` · `lieFront` · `point` · `pointUp` · `present` · `waveA` · `waveB` · `cheer` · `think` · `shrug` · `handsHips` · `armsCross` · `facepalm` · `sad` · `surprise` · `scared` · `thumbsUp` · `salute` · `bow` · `explainA` · `explainB` · `push` · `pull` · `carry` · `lift` · `windup` · `release` · `typing` · `balance` · `danceA` · `danceB` · `stumble` · `victory`

```js
bob.pose("think", 1.2);                        // tween to a named pose (0.3 s)
bob.pose("stand", 2, 0.5, "back.out", { H: -110 });  // with overrides (look up)
bob.pose({ T: -80, H: -60, uaL: 100, faL: 92, uaR: -40, faR: -80, thL: 94, shL: 92, thR: 86, shR: 88 }, 3);
```

Pose objects are **absolute angles** for a right-facing figure: `0` forward, `90` down, `-90` up, `180` back. Keys: `T` torso, `H` head, `uaL/faL` back upper/fore-arm, `uaR/faR` front arm, `thL/shL` back thigh/shin, `thR/shR` front leg. `SM.poses.myPose = {…}` registers a new one.

## Actions

See [engine-api.md → Figures](engine-api.md#figures).
