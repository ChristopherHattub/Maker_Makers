# Slot registry

Snapshot of `GENERATORS` in [`js/programs.js`](../js/programs.js), the source of truth. If this table and the file disagree, the file wins; update this page in the same change that adds a generator.

## Ranges

| Slots | State |
| --- | --- |
| 1-75 | Built, except **slots 14 and 39, which are unused** (gaps; the homepage only shows slots with a `programUrl`; 39 was the Balloon Twister, removed). 73 generators. |
| 76-90 | Built: the fifteen animal generators ([animals.md](animals.md)). |
| 91-100 | Built: the ten Flexi Creatures. |
| 101 | Built: Text Generator. |
| 102 | Built: Fancy Ring. |
| 103 | Built: Pin Maker. |
| 104 | Built: Paper Towel Holder. |
| 105 | Built: Sedan Maker. |
| 106 | Built: Console Faceplate. |
| 107 | Built: Holiday Tree Topper. |
| 108 | Built: Nutcracker (print-in-place jaw). |
| 109 | Built: Marble Run. |
| 110 | Built: Energy Saber. |
| 111 | Built: Battery Dispenser. |
| 112 | Built: Pet Bowl Housing. |
| 113 | Built: Gingerbread House. |
| 114 | Built: Fidget Spinner. |
| 115 | Built: Stamp Maker. |
| 116 | Built: Wall Panel Maker. |
| 117 | Built: Cable Organizer. |
| 118 | Built: Self-Watering Planter. |
| 119 | Built: Headphone & Controller Stand. |
| 120 | Built: Kalimba Maker. |
| 121 | Built: Zoetrope. |
| 122 | Built: Gravity Walker (print-in-place rear legs, with a ramp). |
| 123 | Built: Bird Feeder (three-part kit, no supports). |
| 129 | Built: Bee & Beetle Bugs (bee, ladybug, stag beetle, dragonfly; no supports). |
| 124+ | Free (check open PRs first). Any number works. |

Total built: 121 generators in 20 groups (the `BUNDLES` list in `js/programs.js`). Each generator's `code` in its config (`MM-00N`) matches its slot number.

## Built generators

| Slot | Title | Group | Page in `programs/` |
| --- | --- | --- | --- |
| 1 | Ghost Builder | halloween | `ghost-builder.html` |
| 2 | Pumpkin Plotter | halloween | `pumpkin-plotter.html` |
| 3 | Spider | halloween | `spider.html` |
| 4 | Snowman Stacker | christmas | `snowman.html` |
| 5 | Witch Hat | halloween | `witch-hat.html` |
| 6 | Snowflake Studio | christmas | `snowflake.html` |
| 7 | Skull Sculptor | halloween | `skull-sculptor.html` |
| 8 | Holiday Tree | christmas | `holiday-tree.html` |
| 9 | Holiday Gift Box | christmas | `gift-box.html` |
| 10 | Key Clicker | fidgets | `key-clicker.html` |
| 11 | Name Keychain | personal | `name-keychain.html` |
| 12 | Image Clicker | fidgets | `image-clicker.html` |
| 13 | Snowman 2.0 Generator | christmas | `ornament-stacker.html` |
| 15 | Pottery Wheel | pottery | `pottery-wheel.html` |
| 16 | Gift Box 2.0 | christmas | `gift-box-2.html` |
| 17 | Turkey Builder | thanksgiving | `turkey-builder.html` |
| 18 | Cornucopia | thanksgiving | `cornucopia.html` |
| 19 | Leaf Press Ornament | thanksgiving | `leaf-press.html` |
| 20 | Pumpkin Pie Slice | thanksgiving | `pumpkin-pie-slice.html` |
| 21 | Acorn & Pinecone Set | thanksgiving | `acorn-pinecone-set.html` |
| 22 | Scarecrow Stacker | thanksgiving | `scarecrow-stacker.html` |
| 23 | Gratitude Place Cards | thanksgiving | `gratitude-place-cards.html` |
| 24 | Countdown Clock Topper | newyear | `countdown-clock.html` |
| 25 | Confetti Cannon | newyear | `confetti-cannon.html` |
| 26 | Party Hat Spinner | newyear | `party-hat.html` |
| 27 | Party Whistle | newyear | `party-whistle.html` |
| 28 | Conversation Hearts | valentines | `conversation-hearts.html` |
| 29 | Valentine Card | valentines | `valentines-card.html` |
| 30 | Egg Decorator | easter | `egg-decorator.html` |
| 31 | Bunny Builder | easter | `bunny-builder.html` |
| 32 | Chick Hatcher | easter | `chick-hatcher.html` |
| 33 | Flower Pot Planter | easter | `flower-pot.html` |
| 34 | Butterfly Wings | easter | `butterfly-wings.html` |
| 35 | Egg Hunt Basket | easter | `egg-basket.html` |
| 36 | Cake Stacker | birthday | `cake-stacker.html` |
| 37 | Candle Number Topper | birthday | `candle-number.html` |
| 38 | Pull-String Pinata | birthday | `pinata.html` |
| 40 | Banner Letters | birthday | `banner-letters.html` |
| 41 | Party Popper Spinner | birthday | `party-popper.html` |
| 42 | Cupcake Maker | birthday | `cupcake-maker.html` |
| 43 | Birthday Crown | birthday | `birthday-crown.html` |
| 44 | Gear Train Spinner | fidgets | `gear-train.html` |
| 45 | Fidget Slider | fidgets | `fidget-slider.html` |
| 46 | Spinner Ring | fidgets | `spinner-ring.html` |
| 47 | Twisty Spiral Tower | fidgets | `spiral-tower.html` |
| 48 | Rattle Ball Cage | fidgets | `rattle-ball.html` |
| 49 | Chain-Link Fidget Chain | fidgets | `chain.html` |
| 50 | Flip-Flop Flipper | fidgets | `flipper.html` |
| 51 | Pot of Gold | stpatricks | `pot-of-gold.html` |
| 52 | Leprechaun Hat | stpatricks | `leprechaun-hat.html` |
| 53 | Lucky Horseshoe | stpatricks | `lucky-horseshoe.html` |
| 54 | Clover Chain | stpatricks | `clover-chain.html` |
| 55 | Firework Burst | july4 | `firework-burst.html` |
| 56 | Star-Spangled Star | july4 | `star-spangled-star.html` |
| 57 | Geo Vase | decor | `geo-vase.html` (flute style and fade, belly roundness) |
| 58 | Tea Light Lantern | decor | `tealight-lantern.html` (body shapes Straight, Tapered, Flared, Round drum; Stamps tab; fire warning is a second export modal) |
| 59 | Coaster Set | decor | `coaster-set.html` (Stripes and Crosshatch patterns, pattern turn) |
| 60 | Photo Frame Maker | decor | `photo-frame.html` (Ogee and Double bead edges, loop and easel leg sizes) |
| 61 | Wall Hook Rack | organization | `wall-hook-rack.html` (end margin, peg height) |
| 62 | Floating Shelf Bracket | decor | `shelf-bracket.html` (frame bar width, lattice holes, plate corners) |
| 63 | Bookend Builder | decor | `bookend-builder.html` (each style has its own sliders) |
| 64 | Cable and Remote Caddy | organization | `remote-caddy.html` (finger scoop, foot corners) |
| 65 | Tray Maker | organization | `tray-maker.html` (first column and row size) |
| 66 | Dice Tower | tabletop | `dice-tower.html` |
| 67 | Dice Vault | tabletop | `dice-vault.html` |
| 68 | Custom Dice Maker | tabletop | `custom-dice.html` |
| 69 | Miniature Base | tabletop | `miniature-base.html` |
| 70 | Hex Terrain Tile | tabletop | `hex-terrain-tile.html` |
| 71 | Card Deck Box | tabletop | `card-deck-box.html` |
| 72 | Game Piece Pawn | tabletop | `game-pawn.html` |
| 73 | Spinner Dial | tabletop | `spinner-dial.html` |
| 74 | Chess Piece Set | tabletop | `chess-set.html` |
| 75 | Character Standee | tabletop | `character-standee.html` |
| 76 | Dino Builder | animals | `dino-builder.html` |
| 77 | Dragon Maker | animals | `dragon-maker.html` |
| 78 | Cat Sculptor | animals | `cat-sculptor.html` |
| 79 | Dog Builder | animals | `dog-builder.html` |
| 80 | Articulated Snake | animals | `flexi-snake.html` |
| 81 | Flexi Fish | animals | `flexi-fish.html` |
| 82 | Turtle & Tortoise | animals | `turtle-tortoise.html` |
| 83 | Owl Stacker | animals | `owl-stacker.html` |
| 84 | Penguin Pals | animals | `penguin-pals.html` |
| 85 | Octopus & Squid | animals | `octopus-squid.html` |
| 86 | Mushroom Critters | animals | `mushroom-critters.html` |
| 87 | Shark Fin Trophy | animals | `shark-trophy.html` |
| 88 | Elephant Builder | animals | `elephant-builder.html` |
| 89 | Alien & Monster Maker | animals | `monster-maker.html` |
| 90 | Horse Builder | animals | `horse-builder.html` |
| 91 | Flexi Dragon | flexi | `flexi-dragon.html` |
| 92 | Flexi Gecko | flexi | `flexi-gecko.html` |
| 93 | Flexi Crocodile | flexi | `flexi-crocodile.html` |
| 94 | Flexi Octopus | flexi | `flexi-octopus.html` |
| 95 | Flexi Scorpion | flexi | `flexi-scorpion.html` |
| 96 | Flexi Centipede | flexi | `flexi-centipede.html` |
| 97 | Flexi Turtle | flexi | `flexi-turtle.html` |
| 98 | Flexi Shark | flexi | `flexi-shark.html` |
| 99 | Flexi Seahorse | flexi | `flexi-seahorse.html` |
| 100 | Flexi Caterpillar | flexi | `flexi-caterpillar.html` |
| 101 | Text Generator | personal | `text-generator.html` |
| 102 | Fancy Ring | jewelry | `fancy-ring.html` |
| 103 | Pin Maker | jewelry | `pin-maker.html` |
| 104 | Paper Towel Holder | organization | `paper-towel-holder.html` (countertop, wall and under-cabinet mounts; stamps; split rod; magnets) |
| 105 | Sedan Maker | toys | `sedan-maker.html` (print-in-place wheels; Car parts stamps) |
| 106 | Console Faceplate | toys | `console-faceplate.html` (Switch / Switch 2 dock, PS5 panel, Xbox Series X front; eight designs; sizes are estimates) |
| 107 | Holiday Tree Topper | christmas | `holiday-tree-topper.html` (faceted star, heart or gem on a print-in-place spinning fluted bell and socket) |
| 108 | Nutcracker | christmas | `nutcracker.html` (print-in-place jaw on diamond pins, about 40 mix-and-match options) |
| 109 | Marble Run | toys | `marble-run.html` (zigzag marble tower; Simulate tab drops balls) |
| 110 | Energy Saber | toys | `energy-saber.html` (telescoping print-in-place blade tubes; hilt styles) |
| 111 | Battery Dispenser | organization | `battery-dispenser.html` (AA and AAA gravity stacks, pull one and the next drops; one part, no supports) |
| 112 | Pet Bowl Housing | organization | `pet-bowl-housing.html` (holder with a pocket for your own bowl; single or double; outlines, patterns, tray / link bar / platform) |
| 113 | Gingerbread House | christmas | `gingerbread-house.html` (one piece, hollow, open underneath) |
| 114 | Fidget Spinner | fidgets | `fidget-spinner.html` (six styles; print-in-place hub or 608 bearing; arm pockets; raised name) |
| 115 | Stamp Maker | personal | `stamp-maker.html` (mirrored relief text + 18 icons, 5 layouts, one-piece tapered grip) |
| 116 | Wall Panel Maker | decor | `wall-panel.html` (text panel; Elements tab with drag-and-drop print-in-place checkboxes, sliders, progress bars, dials) |
| 117 | Cable Organizer | organization | `cable-organizer.html` (desk edge clip, under-desk tray, clip strip; slot count and cable thickness) |
| 118 | Self-Watering Planter | garden | `self-watering-planter.html` (pot, wicking insert and saucer printed in place) |
| 119 | Headphone & Controller Stand | organization | `headphone-controller-stand.html` (desk and wall headphone stands, controller rack and shelf; Console Faceplate designs) |
| 120 | Kalimba Maker | toys | `kalimba-maker.html` (tines cut into the board, tuned from beam theory; roof closes with no supports; click-to-hear) |
| 121 | Zoetrope | toys | `zoetrope.html` (spinning slotted drum, print-in-place pin, printable picture strip) |
| 122 | Gravity Walker | toys | `gravity-walker.html` (walks down a ramp: body foot plus two print-in-place rear legs, printable ramp; unprinted) |
| 123 | Bird Feeder | garden | `bird-feeder.html` (hanging gazebo kit: tray with posts, seed hopper with arched ports, cone roof; prints as three flat parts) |
| 129 | Bee & Beetle Bugs | animals | `bee-beetle-bugs.html` (bug picker: honey bee, ladybug, stag beetle, dragonfly; flat, raised or folded wings, patterns, antennae, legs; unprinted) |

## Groups (BUNDLES)

| id | Name | Members |
| --- | --- | --- |
| halloween | Halloween | 5 |
| christmas | Christmas | 8 |
| easter | Easter & Spring | 6 |
| valentines | Valentine's | 2 |
| thanksgiving | Thanksgiving & Fall | 7 |
| newyear | New Year & Party | 4 |
| birthday | Birthdays | 7 |
| stpatricks | St. Patrick's Day | 4 |
| july4 | Fourth of July | 2 |
| fidgets | Fidgets & Clickers | 10 |
| personal | Personalised | 2 |
| pottery | Pottery | 1 |
| decor | Home & Decor | 6 |
| organization | Organisation | 4 |
| organization | Organisation | 3 |
| toys | Toys & Games | 1 |
| garden | Garden | 1 |
| toys | Toys & Games | 3 |
| toys | Toys & Games | 2 |
| garden | Garden | planned (empty) |
| flexi | Flexi Creatures | 10 |
| animals | Animals & Creatures | 15 |
| jewelry | Jewellery & Wearables | 1 |
| tabletop | Tabletop & Gaming | 10 |
A generator in no group lands in an automatic "More" region, so a missing `bundle` is visible on the map.

## Regenerating this table

Evaluate `js/programs.js` (swap `const` for `var` so `PROGRAMS` and `BUNDLES` become globals; a group's members are its `generators` ids plus every entry whose `bundle` names it), then list `PROGRAMS.filter(p => p.programUrl)` with `slot`, `title`, `bundles` and `programUrl`. The tables above were produced that way.
