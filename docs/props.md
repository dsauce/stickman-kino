# Props

202 line-art props, theme-aware, with constant line weight at any size. Generated from `engine/sm-props.js` by `node scripts/catalog.mjs`.

![Props 1](images/catalog-props-1.png)
![Props 2](images/catalog-props-2.png)

```js
sc.prop("rocket", { x: 960, y: 500, size: 160, accent: "a1", layer: "front", hidden: true }).pop(1.2);
bob.hold("coffee", 0.5);            // in hand, stays upright
bob.throw("coin", 1200, 600, 2.0);   // arcs to a target
sc.fx.rain(["document", "clock"], 0, 3, { pile: true });
```

`accent` = default colour slot (`a1` alert · `a2` hero · `a3` reward); override with `accent: "a2"` or any colour. Add your own with `SM.defineProp(name, c => { c.P(pathData); c.C(x, y, r); … }, "a2", "tags")`: see the existing definitions for the drawing helpers (`P` path, `C` circle, `E` ellipse, `R` rect, `L` line, `T` text, `lines`).

## Documents & office

| Prop | Accent | Tags |
|---|---|---|
| `document` | - | doc paper report page file |
| `report` | a2 | report chart doc |
| `stack` | - | papers pile stack documents |
| `folder` | a3 | folder files |
| `book` | a1 | book read |
| `openbook` | - | book learn |
| `notebook` | - | notes notebook |
| `clipboard` | a3 | checklist clipboard tasks |
| `pencil` | a3 | pencil write edit |
| `pen` | a2 | pen sign |
| `envelope` | - | mail email message envelope |
| `mailopen` | - | mail inbox read |
| `calendar` | a1 | calendar date schedule deadline |
| `clock` | - | time clock deadline |
| `hourglass` | a3 | time wait hourglass |
| `stopwatch` | - | timer speed stopwatch |
| `briefcase` | a3 | work job business briefcase |
| `chair` | - | chair seat |
| `desk` | a3 | desk table office |
| `whiteboard` | a2 | board teach present chart |
| `presentation` | a2 | slides presentation pitch |

## Tech

| Prop | Accent | Tags |
|---|---|---|
| `laptop` | a2 | laptop computer work |
| `monitor` | a2 | screen monitor desktop |
| `phone` | a2 | phone mobile app smartphone |
| `tablet` | a2 | tablet ipad |
| `keyboard` | - | keyboard type |
| `mouse` | - | mouse click |
| `cursor` | - | cursor pointer click |
| `server` | a2 | server backend hosting infra |
| `database` | - | database data storage db |
| `cloud` | - | cloud weather saas |
| `chip` | a2 | chip cpu ai processor hardware |
| `code` | a2 | code developer brackets programming |
| `terminal` | a2 | terminal cli command shell |
| `browser` | a2 | browser website web page |
| `app` | a2 | app icon |
| `wifi` | - | wifi internet network signal |
| `signal` | a2 | signal bars strength |
| `battery` | a2 | battery energy power charge |
| `plug` | - | plug power connect integration |
| `robot` | a2 | robot ai bot agent automation |
| `brain` | a1 | brain mind think intelligence ai |
| `gear` | a2 | gear settings process engineering cog |
| `gears` | a2 | gears machine system process |
| `magnifier` | - | search find magnifier zoom research |
| `funnel` | - | funnel filter conversion |
| `filter` | a2 | filter |
| `lock` | a3 | lock security secure privacy |
| `unlock` | a2 | unlock open access |
| `key` | a3 | key access secret solution |
| `shield` | a2 | shield security protection safe trust |
| `bug` | a1 | bug error issue defect |
| `warning` | a3 | warning alert caution risk |
| `error` | a1 | error fail wrong cross |
| `success` | a2 | success done ok tick check |
| `bell` | a3 | bell notification alert reminder |
| `chat` | - | chat message talk conversation support |
| `chats` | a2 | chat conversation messages dm |
| `thought` | - | thought idea think bubble |
| `megaphone` | a1 | megaphone announce marketing launch |
| `mic` | a2 | mic podcast voice speak audio |
| `headphones` | a2 | music listen audio headphones |
| `camera` | a2 | camera photo picture |
| `video` | a1 | video record film |
| `play` | a1 | play video start youtube |
| `music` | - | music note song |

## Money & business

| Prop | Accent | Tags |
|---|---|---|
| `coin` | a3 | coin money cash dollar cost price |
| `coins` | a3 | coins savings money stack |
| `cash` | a2 | cash money banknote bill payment |
| `moneybag` | a3 | money bag wealth revenue profit |
| `wallet` | a1 | wallet payment spend |
| `creditcard` | a2 | card payment credit fintech |
| `piggybank` | a1 | savings piggy bank save money |
| `chartup` | a2 | growth chart up trend increase gains |
| `chartdown` | a1 | decline chart down loss drop |
| `barchart` | a2 | bar chart statistics data |
| `piechart` | a2 | pie share market chart |
| `target` | a1 | target goal aim focus bullseye |
| `trophy` | a3 | trophy win award champion success |
| `medal` | a3 | medal winner first rank |
| `crown` | a3 | crown king best premium leader |
| `star` | a3 | star favourite rating quality |
| `flag` | a1 | flag goal milestone finish |
| `rocket` | a1 | rocket launch startup growth fast |
| `lightbulb` | a3 | idea lightbulb insight innovation |
| `puzzle` | a2 | puzzle solution fit integration |
| `handshake` | a3 | deal partnership agreement handshake |
| `scale` | a3 | balance scale justice compare legal weigh |
| `gavel` | a3 | law legal judge court gavel |
| `building` | - | building company office corporate |
| `bank` | a3 | bank finance institution |
| `factory` | a3 | factory industry manufacturing production |
| `house` | a1 | home house real estate |
| `shop` | a1 | shop store retail ecommerce |
| `cart` | a2 | cart shopping buy ecommerce |
| `box` | a3 | box package delivery shipping product |
| `gift` | a1 | gift present reward bonus |
| `tag` | a3 | price tag sale discount label |
| `receipt` | - | receipt invoice bill |

## Transport

| Prop | Accent | Tags |
|---|---|---|
| `truck` | a2 | truck delivery logistics shipping |
| `car` | a1 | car drive vehicle |
| `bike` | - | bike cycle commute |
| `plane` | a2 | plane travel flight fly |
| `ship` | a1 | ship cargo boat freight |
| `train` | a2 | train rail transport |

## Nature

| Prop | Accent | Tags |
|---|---|---|
| `tree` | #3FA34D | tree nature growth plant |
| `plant` | a1 | plant grow pot sprout |
| `seedling` | - | seed sprout start beginning growth |
| `leaf` | - | leaf green eco sustainability |
| `mountain` | - | mountain challenge climb summit |
| `sun` | a3 | sun day weather bright |
| `moon` | a3 | moon night sleep |
| `raincloud` | a2 | rain weather storm cloud |
| `lightning` | a3 | lightning energy fast power zap |
| `fire` | a1 | fire hot burn trending |
| `drop` | a2 | water drop liquid |
| `snowflake` | a2 | snow winter cold freeze |
| `globe` | a2 | globe world global international earth |
| `mappin` | a1 | location pin map place |
| `map` | a1 | map route journey plan |
| `compass` | a1 | compass direction strategy navigation |
| `signpost` | a2 | decision choice direction signpost options |
| `road` | - | road path journey way |

## Cinema (Kino!)

| Prop | Accent | Tags |
|---|---|---|
| `clapper` | a1 | clapper film movie action director kino |
| `filmreel` | a1 | film reel movie cinema |
| `filmstrip` | a2 | film strip frames movie |
| `popcorn` | a1 | popcorn cinema movie fun |
| `ticket` | a3 | ticket cinema admit event |
| `director-chair` | a1 | director chair film |
| `spotlight` | a3 | spotlight stage light focus |

## Home & chores

| Prop | Accent | Tags |
|---|---|---|
| `dishes` | a2 | dishes plates bowl kitchen chores washing up |
| `sink` | a2 | sink kitchen tap water dishes |
| `broom` | a3 | broom sweep clean chores |
| `washer` | a2 | washing machine laundry clothes chores |
| `laundry` | a1 | laundry basket clothes washing chores |
| `trashbag` | a1 | trash bag rubbish garbage bin chores |
| `bin` | a2 | bin trash can garbage recycling |
| `fridge` | a3 | fridge kitchen food home |
| `sofa` | a2 | sofa couch living room relax home |
| `tv` | a2 | tv television screen movie night |
| `vacuum` | a1 | vacuum cleaner hoover clean chores |
| `spray` | a2 | spray bottle cleaner clean chores |
| `sponge` | a3 | sponge wash dishes clean |

## Science & misc

| Prop | Accent | Tags |
|---|---|---|
| `flask` | a2 | science experiment lab chemistry test |
| `atom` | a2 | atom science physics research |
| `dna` | a1 | dna biology health genetics |
| `microscope` | a2 | microscope research science analysis |
| `pill` | a1 | pill health medicine pharma |
| `heart` | a1 | heart love like health care |
| `heartbeat` | a1 | heartbeat health pulse monitor |
| `magnet` | a1 | magnet attract leads |
| `anchor` | - | anchor stable stuck |
| `ladder` | - | ladder climb career progress steps |
| `stairs` | a3 | stairs steps progress growth levels |
| `door` | a2 | door opportunity entry exit |
| `window` | - | window |
| `bed` | a2 | bed sleep rest night |
| `coffee` | a1 | coffee break morning energy |
| `pizza` | a3 | pizza food lunch fun |
| `umbrella` | a2 | umbrella insurance protection rain |
| `balloon` | a1 | balloon party celebrate |
| `dice` | - | dice chance luck risk random |
| `hammer` | a3 | hammer build fix tool |
| `wrench` | a3 | wrench tool fix settings maintenance |
| `toolbox` | a1 | tools toolbox kit |
| `battery-low` | a1 | battery low tired energy |
| `eye` | a2 | eye see view vision watch |
| `hand` | - | hand stop raise |
| `thumbsup` | a2 | like approve thumbs up good |
| `user` | a2 | user person profile account customer |
| `users` | a2 | users team group people community |
| `idcard` | a2 | id card identity profile |
| `question` | a3 | question faq help unknown |
| `exclamation` | a1 | exclamation important alert |
| `plus` | a2 | plus add new create |
| `minus` | a1 | minus remove less |
| `percent` | a3 | percent rate discount interest |
| `arrowup` | a2 | arrow up increase growth |
| `arrowdown` | a1 | arrow down decrease |
| `arrowright` | a2 | arrow next forward |
| `refresh` | - | refresh cycle repeat loop update |
| `infinity` | a2 | infinity forever unlimited loop |
| `link` | a2 | link chain connect url |
| `chain` | - | chain blockchain connected dependency |
| `network` | a2 | network graph nodes connections |
| `brick` | a1 | wall brick blocker obstacle |
| `bomb` | a1 | bomb crisis danger explode |
| `ghost` | - | ghost ghosting fear spooky |
| `skull` | - | skull death danger |
| `sparkle` | a3 | sparkle shine magic ai new |
| `wand` | a3 | magic wand automation easy |
| `checkbox` | a2 | checkbox done task todo |
| `toggle` | a2 | toggle switch on settings |
| `slider` | a2 | slider adjust control |
| `qrcode` | - | qr scan code |
| `hashtag` | a2 | hashtag social trending |
| `at` | a2 | at email mention |
| `pin` | a1 | pin pushpin note |
| `shoe` | a1 | shoe sneaker run start habit |
| `snowball` | - | snowball growth compound momentum |
| `sticky` | a3 | sticky note reminder postit |
| `bulb-off` | - | idea missing no idea |

