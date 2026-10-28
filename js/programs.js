// Slot registry. Add a generator by adding an entry to GENERATORS with the next free slot number.
const MIN_SLOTS = 40; // internal lookup table size only; the homepage shows filled slots, not empty ones
const GRID_COLUMNS = 4;

const GENERATORS = [
  {
    slot: 1,
    title: 'Ghost Builder',
    bundle: 'halloween',
    category: 'SPOOKY // FIGURES',
    thumbnailUrl: 'assets/thumbnails/ghost-builder.svg',
    programUrl: 'programs/ghost-builder.html',
    description: 'Parametric ghost with folds, arms, a face and embossed stamps and carved jack-o-lantern faces. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 2,
    title: 'Pumpkin Plotter',
    bundle: 'halloween',
    category: 'SPOOKY // HARVEST',
    thumbnailUrl: 'assets/thumbnails/pumpkin-plotter.svg',
    programUrl: 'programs/pumpkin-plotter.html',
    description: 'Parametric pumpkin with adjustable ribs, texture, a curly stem, an optional hollow inside and embossed stamps and carved jack-o-lantern faces. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 5,
    title: 'Witch Hat',
    bundle: 'halloween',
    category: 'SPOOKY // HEADWEAR',
    thumbnailUrl: 'assets/thumbnails/witch-hat.svg',
    programUrl: 'programs/witch-hat.html',
    description: 'Parametric witch hat with adjustable cone height, swoop, lean and floppy tip, a curled or wavy brim, a raised hat band and a flat solid or hollow underside. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 7,
    title: 'Skull Sculptor',
    bundle: 'halloween',
    category: 'SPOOKY // BONES',
    thumbnailUrl: 'assets/thumbnails/skull-sculptor.svg',
    programUrl: 'programs/skull-sculptor.html',
    description: 'Parametric skull with adjustable eye sockets (size, tilt, shape, asymmetry), nose cavity, jaw and cheeks, plus a Mouth tab of picture presets (grin, fangs, gap tooth, open jaw and more) for the teeth. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 3,
    title: 'Spider',
    bundle: 'halloween',
    category: 'SPOOKY // CREATURES',
    thumbnailUrl: 'assets/thumbnails/spider.svg',
    programUrl: 'programs/spider.html',
    description: 'Parametric spider: shape the head and abdomen, set the eyes and number of legs, and bend, thicken and taper each leg. Emboss stamps like a mini spider, skull, web or bat. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 4,
    title: 'Snowman Stacker',
    bundle: 'christmas',
    category: 'CHRISTMAS // FIGURES',
    thumbnailUrl: 'assets/thumbnails/snowman.svg',
    programUrl: 'programs/snowman.html',
    description: 'Parametric snowman: size and stack the three balls, then pick a top hat, beanie or Santa hat, a scarf, a drooping carrot nose, coal eyes, mouth and buttons, and stubby arms. A Styles tab of picture cards sets a whole look. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 6,
    title: 'Snowflake Studio',
    bundle: 'christmas',
    category: 'CHRISTMAS // ORNAMENTS',
    thumbnailUrl: 'assets/thumbnails/snowflake.svg',
    programUrl: 'programs/snowflake.html',
    description: 'Flat printable snowflake ornament: set the number and length of arms, add rows of branches, change the centre and arm tips, and add a hanging loop. A Styles tab of picture cards (fern, lace, crystal and more) sets a whole look. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 8,
    title: 'Holiday Tree',
    bundle: 'christmas',
    category: 'CHRISTMAS // TREES',
    thumbnailUrl: 'assets/thumbnails/holiday-tree.svg',
    programUrl: 'programs/holiday-tree.html',
    description: 'Tiered Christmas tree with adjustable height, width, tier count and wavy bough edges, a trunk, a snow base, baubles and a ball or sparkle topper. Every bough has a self-supporting underside. A Styles tab of picture cards sets a whole look. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 9,
    title: 'Holiday Gift Box',
    bundle: 'christmas',
    category: 'CHRISTMAS // GIFTS',
    thumbnailUrl: 'assets/thumbnails/gift-box.svg',
    programUrl: 'programs/gift-box.html',
    description: 'Solid gift box with a lid, ribbon bands and a bow: set width, depth, height, corner rounding, lid overhang, ribbon width and raise, and bow size, height and spread. A Styles tab of picture cards (tall, flat, cube, plain) sets a whole look. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 10,
    title: 'Key Clicker',
    category: 'DESK // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/key-clicker.svg',
    programUrl: 'programs/key-clicker.html',
    description: 'Pad of connected clicker buttons: pick how many (1 to 12), rows, button shape, body shape, keycap height and rounding, and type a character on every keycap. Optional switch socket under each key. Caps print flat beside the body with no supports. Paint body, caps and characters in the Color tool and export .STL.'
  },
  {
    slot: 11,
    title: 'Name Keychain',
    category: 'KEYCHAINS // PERSONAL',
    thumbnailUrl: 'assets/thumbnails/name-keychain.svg',
    programUrl: 'programs/name-keychain.html',
    description: 'Personalised name keychain: type one or two lines, pick a lettering style, plate shape, border and key ring hole, then tune size and thickness. Prints flat with no supports. Paint plate, border and letters in the Color tool and export .STL.'
  },
  {
    slot: 12,
    title: 'Image Clicker',
    category: 'FIDGET // CLICKERS',
    thumbnailUrl: 'assets/thumbnails/image-clicker.svg',
    programUrl: 'programs/image-clicker.html',
    description: 'Upload a PNG, JPG or SVG, or pick a shape, and turn it into a print-in-place fidget clicker: the picture becomes the button outline or is raised on a badge. Set button size, travel, hinge softness, housing wall and an optional keyring loop. Everything runs in your browser. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 13,
    title: 'Snowman 2.0 Generator',
    category: 'CHRISTMAS // SNOWMAN',
    thumbnailUrl: 'assets/thumbnails/ornament-stacker.svg',
    programUrl: 'programs/ornament-stacker.html',
    description: 'A snowman-building game: pick one to four snowballs, then drag hats, faces, scarves, buttons and stick arms from a picture catalog onto the snowman, with a guide showing where each lands. Add as many as you like, paint parts in the Color tool and export .STL.'
  },
  {
    slot: 15,
    title: 'Pottery Wheel',
    category: 'POTTERY // WHEEL',
    thumbnailUrl: 'assets/thumbnails/pottery-wheel.svg',
    programUrl: 'programs/pottery-wheel.html',
    description: 'Spin a lump of clay on a wheel and mold it with the mouse or your finger: press, pinch, swell, smooth and pull it taller. Add throwing rings, fluting, facets and a mug handle, with an overhang limit that keeps it printable. Paint glaze in the Color tool and export .STL.'
  },
  {
    slot: 16,
    title: 'Gift Box 2.0',
    bundle: 'christmas',
    category: 'CHRISTMAS // GIFTS',
    thumbnailUrl: 'assets/thumbnails/gift-box-2.svg',
    programUrl: 'programs/gift-box-2.html',
    description: 'A working gift box with a lid that slips over a hollow box, shown in a cozy Christmas workshop with a turning table, fireplace, tree and falling snow. Ten presets plus square, round or hexagon shapes, wall, lid fit, ribbon bands and a classic, pom-pom or flat bow, then tap the box to stick on stars, hearts, trees and more. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 17,
    title: 'Turkey Builder',
    bundle: 'thanksgiving',
    category: 'FALL // FIGURES',
    thumbnailUrl: 'assets/thumbnails/turkey-builder.svg',
    programUrl: 'programs/turkey-builder.html',
    description: 'A plump turkey with a fan of tail feathers: set body size, head, neck and beak, then feather count, length, width and spread, an inner feather row and a base plate. Prints without supports at the default spread. Paint every part in the Color tool and export .STL.'
  },
  {
    slot: 18,
    title: 'Cornucopia',
    bundle: 'thanksgiving',
    category: 'FALL // HARVEST',
    thumbnailUrl: 'assets/thumbnails/cornucopia.svg',
    programUrl: 'programs/cornucopia.html',
    description: 'A woven horn of plenty lying on its side with fruit spilling from the mouth: set length, mouth size, curl, taper, wall and inside depth, then the weave ribs and up to six apples, gourds and grape bunches. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 19,
    title: 'Leaf Press Ornament',
    bundle: 'thanksgiving',
    category: 'FALL // LEAVES',
    thumbnailUrl: 'assets/thumbnails/leaf-press.svg',
    programUrl: 'programs/leaf-press.html',
    description: 'A maple, oak or birch leaf with raised veins, made as a hanging ornament, a coaster or a cookie stamp. Set size, thickness, jagged edge and vein width, height and count. Paint the leaf and veins in the Color tool and export .STL.'
  },
  {
    slot: 20,
    title: 'Pumpkin Pie Slice',
    bundle: 'thanksgiving',
    category: 'FALL // KITCHEN',
    thumbnailUrl: 'assets/thumbnails/pumpkin-pie-slice.svg',
    programUrl: 'programs/pumpkin-pie-slice.html',
    description: 'A pie slice trinket box with a drop-in lid: set the pie radius, slice angle and height, wall and lid fit, then the crimped crust and a whipped cream dollop. Tin and lid print side by side with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 21,
    title: 'Acorn & Pinecone Set',
    bundle: 'thanksgiving',
    category: 'FALL // FOREST',
    thumbnailUrl: 'assets/thumbnails/acorn-pinecone-set.svg',
    programUrl: 'programs/acorn-pinecone-set.html',
    description: 'Textured acorns and scaled pinecones to print as a set or as tree ornaments with hang loops. Set how many of each, their sizes, the cap bumps and the scale rows and depth. Everything stands on a flat base. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 22,
    title: 'Scarecrow Stacker',
    bundle: 'thanksgiving',
    category: 'FALL // FIGURES',
    thumbnailUrl: 'assets/thumbnails/scarecrow-stacker.svg',
    programUrl: 'programs/scarecrow-stacker.html',
    description: 'A patched-shirt scarecrow on a post with straw arms, a face and a hat: pick the hat and face style, then size the shirt, post, arms and head. Arms droop so it prints without supports. Paint every part in the Color tool and export .STL.'
  },
  {
    slot: 23,
    title: 'Gratitude Place Cards',
    bundle: 'thanksgiving',
    category: 'FALL // TABLE',
    thumbnailUrl: 'assets/thumbnails/gratitude-place-cards.svg',
    programUrl: 'programs/gratitude-place-cards.html',
    description: 'A standing name card for the Thanksgiving table: type a name and optional second line, pick a lettering style, card shape and a leaf, acorn, pumpkin or turkey motif. The easel foot is built in. Paint card, lettering and motif in the Color tool and export .STL.'
  },
  {
    slot: 24,
    title: 'Countdown Clock Topper',
    bundle: 'newyear',
    category: 'NEW YEAR // COUNTDOWN',
    thumbnailUrl: 'assets/thumbnails/countdown-clock.svg',
    programUrl: 'programs/countdown-clock.html',
    description: 'A flat New Year clock face: drag the hands on a live clock to set the time, pick the year, then add ticks, numbers, a starburst and an optional cake stick or hang loop. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 25,
    title: 'Confetti Cannon',
    bundle: 'newyear',
    category: 'NEW YEAR // PARTY POPPER',
    thumbnailUrl: 'assets/thumbnails/confetti-cannon.svg',
    programUrl: 'programs/confetti-cannon.html',
    description: 'A party popper firing a spray of confetti. Drag on the aiming box to set the angle and how far it flies, then choose how many dots, stars and streamers. Everything prints flat on one plate. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 26,
    title: 'Party Hat Spinner',
    bundle: 'newyear',
    category: 'NEW YEAR // PARTY HATS',
    thumbnailUrl: 'assets/thumbnails/party-hat.svg',
    programUrl: 'programs/party-hat.html',
    description: 'A hollow cone party hat you decorate: paint raised and carved patterns on a wrap-around grid, mirror them around the hat, or click shapes straight onto it. Add a brim band and a pom-pom, point or flat top. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 27,
    title: 'Party Whistle',
    bundle: 'newyear',
    category: 'NEW YEAR // NOISE MAKERS',
    thumbnailUrl: 'assets/thumbnails/party-whistle.svg',
    programUrl: 'programs/party-whistle.html',
    description: 'A noise maker you blow into: a duct whistle with a tunable chamber length, air slot and window, plus party bands and a lanyard loop. Prints flat. Tune the sound with the sliders (the pitch depends on your printer, so test a few). Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 28,
    title: 'Conversation Hearts',
    bundle: 'valentines',
    category: "VALENTINE'S // CANDY",
    thumbnailUrl: 'assets/thumbnails/conversation-hearts.svg',
    programUrl: 'programs/conversation-hearts.html',
    description: 'Stackable candy hearts, squares, rounds, ovals and stars with embossed love notes you type or pick from popular phrases. Pile up to three, twist them, and add a key ring loop. Paint candy and letters in the Color tool and export .STL.'
  },
  {
    slot: 29,
    title: 'Valentine Card',
    bundle: 'valentines',
    category: "VALENTINE'S // CARDS",
    thumbnailUrl: 'assets/thumbnails/valentines-card.svg',
    programUrl: 'programs/valentines-card.html',
    description: 'A flat greeting card with a thin hinge so the leg folds back into an easel stand. Type your message and names, pick a heart picture and border, and click the card to stick on hearts, stars and rings. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 30,
    title: 'Egg Decorator',
    bundle: 'easter',
    category: 'EASTER // EGGS',
    thumbnailUrl: 'assets/thumbnails/egg-decorator.svg',
    programUrl: 'programs/egg-decorator.html',
    description: 'An Easter egg you decorate: paint raised and carved patterns on the unrolled egg, mirror them around it, or click shapes straight onto the egg. Choose a solid or hollow egg with a flat bottom and optional hang loop. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 31,
    title: 'Bunny Builder',
    bundle: 'easter',
    category: 'EASTER // BUNNIES',
    thumbnailUrl: 'assets/thumbnails/bunny-builder.svg',
    programUrl: 'programs/bunny-builder.html',
    description: 'A sitting Easter bunny: size the body and head, then pose the ears (length, spread, lean and droop), turn the head, and set the eyes, cheeks, nose, tail and feet. Add a bow tie or a carrot. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 32,
    title: 'Chick Hatcher',
    bundle: 'easter',
    category: 'EASTER // HATCHING',
    thumbnailUrl: 'assets/thumbnails/chick-hatcher.svg',
    programUrl: 'programs/chick-hatcher.html',
    description: 'A cracked egg with a chick inside. Draw the crack line on the unrolled egg, then raise Hatch to tip the cap open (over 20 degrees needs supports). Resize the chick and beak. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 33,
    title: 'Flower Pot Planter',
    bundle: 'easter',
    category: 'SPRING // GARDEN',
    thumbnailUrl: 'assets/thumbnails/flower-pot.svg',
    programUrl: 'programs/flower-pot.html',
    description: 'A pot with a planting bed: shape the pot, then plant tulips, daisies, daffodils and crocuses by clicking the soil in 3D or on the plan view. Hollow underneath to save plastic. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 34,
    title: 'Butterfly Wings',
    bundle: 'easter',
    category: 'SPRING // BUTTERFLIES',
    thumbnailUrl: 'assets/thumbnails/butterfly-wings.svg',
    programUrl: 'programs/butterfly-wings.html',
    description: 'A flat butterfly: drag the wing handles on a live canvas while the other wing mirrors, then add veins, a raised edge and spots by clicking the wings. Prints flat. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 35,
    title: 'Egg Hunt Basket',
    bundle: 'easter',
    category: 'EASTER // BASKETS',
    thumbnailUrl: 'assets/thumbnails/egg-basket.svg',
    programUrl: 'programs/egg-basket.html',
    description: 'A woven Easter basket with an arched handle and striped mini eggs. Drag eggs around the top-down plan, add or remove them, and set the weave, rim and egg size. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 36,
    title: 'Cake Stacker',
    bundle: 'birthday',
    category: 'BIRTHDAY // CAKES',
    thumbnailUrl: 'assets/thumbnails/cake-stacker.svg',
    programUrl: 'programs/cake-stacker.html',
    description: 'Tiered birthday cake: drag each tier wider or taller in the Tiers tab, then add fluted sides, frosting drips, sprinkles, candle rings and a plate. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 37,
    title: 'Candle Number Topper',
    bundle: 'birthday',
    category: 'BIRTHDAY // CANDLES',
    thumbnailUrl: 'assets/thumbnails/candle-number.svg',
    programUrl: 'programs/candle-number.html',
    description: 'Chunky age numbers on a cake spike: set the number, size and stroke width, add a coloured border, beads, an inlay line and a flame. Prints flat. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 38,
    title: 'Pull-String Pinata',
    bundle: 'birthday',
    category: 'BIRTHDAY // PINATAS',
    thumbnailUrl: 'assets/thumbnails/pinata.svg',
    programUrl: 'programs/pinata.html',
    description: 'A hollow party pinata in two halves: choose a round, star or flower shape, add rows of tissue fringe, a hang loop and a pull tab, and pull the string to place the lid. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 39,
    title: 'Balloon Twister',
    bundle: 'birthday',
    category: 'BIRTHDAY // BALLOONS',
    thumbnailUrl: 'assets/thumbnails/balloon-twister.svg',
    programUrl: 'programs/balloon-twister.html',
    description: 'A flat-lying balloon animal made of fat lobes pinched at twist knots: a dog, sword, flower, heart, snake or a curly chain. Set lobe length, puffiness and twists. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 40,
    title: 'Banner Letters',
    bundle: 'birthday',
    category: 'BIRTHDAY // BANNERS',
    thumbnailUrl: 'assets/thumbnails/banner-letters.svg',
    programUrl: 'programs/banner-letters.html',
    description: 'Type a message and get a string of letter pennants on a ribbon: triangle, swallowtail, round or block flags with raised letters, edge trim and hang loops. Each word is its own banner. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 41,
    title: 'Party Popper Spinner',
    bundle: 'birthday',
    category: 'BIRTHDAY // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/party-popper.svg',
    programUrl: 'programs/party-popper.html',
    description: 'A print-in-place fidget: a confetti-finned ring spins on a cone and clicks over matching teeth as it turns. Set clicks per turn, click strength, fit gap and fins. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 42,
    title: 'Cupcake Maker',
    bundle: 'birthday',
    category: 'BIRTHDAY // CUPCAKES',
    thumbnailUrl: 'assets/thumbnails/cupcake-maker.svg',
    programUrl: 'programs/cupcake-maker.html',
    description: 'A fluted cupcake liner with a muffin top and a piped frosting swirl: set the turns, height and star nozzle, then add a cherry, candle, flag or sprinkles. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 43,
    title: 'Birthday Crown',
    bundle: 'birthday',
    category: 'BIRTHDAY // HATS',
    thumbnailUrl: 'assets/thumbnails/birthday-crown.svg',
    programUrl: 'programs/birthday-crown.html',
    description: 'A wearable birthday crown sized by head circumference: choose points, arches, castle or wave peaks, add jewels, band dots and a front plaque with the age. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 44,
    title: 'Gear Train Spinner',
    bundle: 'fidgets',
    category: 'DESK // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/gear-train.svg',
    programUrl: 'programs/gear-train.html',
    description: 'A chain of meshing involute gears that each turn on their own pin, with an optional crank knob. Set the number of gears, teeth, tooth size and layout (line, zigzag or arc). Gears print already on their pins with cone-shaped pin heads, no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 45,
    title: 'Fidget Slider',
    bundle: 'fidgets',
    category: 'DESK // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/fidget-slider.svg',
    programUrl: 'programs/fidget-slider.html',
    description: 'A flared knob that slides along a dovetail track and clicks over ridges on the track walls. Set travel, click spacing, click strength, slot width and knob height. The slider prints already captured in its track on 45 degree flanks, no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 46,
    title: 'Spinner Ring',
    bundle: 'fidgets',
    category: 'WEARABLE // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/spinner-ring.svg',
    programUrl: 'programs/spinner-ring.html',
    description: 'A finger ring whose outer band spins around the inner band on a locked V rib, with optional raised pixel text wrapped around it. Set finger size, band width, thickness, fit gap and type your own text. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 47,
    title: 'Twisty Spiral Tower',
    bundle: 'fidgets',
    category: 'DESK // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/spiral-tower.svg',
    programUrl: 'programs/spiral-tower.html',
    description: 'A tapered stack of polygon tiers that each spin freely on one central post, so one flick twists the tower into a spiral. Set tiers, shape (3 sides to round), size, taper, thickness and starting twist. Prints in place with a cone-shaped head on the post. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 48,
    title: 'Rattle Ball Cage',
    bundle: 'fidgets',
    category: 'DESK // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/rattle-ball.svg',
    programUrl: 'programs/rattle-ball.html',
    description: 'A loose ball trapped inside a lattice cage built from an octahedron, icosahedron, dodecahedron or cuboctahedron. Set cage size, bar thickness, ball size and rattle room. The diamond ball is held by a thin snap-off pin for printing. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 49,
    title: 'Chain-Link Fidget Chain',
    bundle: 'fidgets',
    category: 'DESK // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/chain.svg',
    programUrl: 'programs/chain.html',
    description: 'Flat links that print already hooked together: each link is a frame at one end and a tent-shaped tunnel at the other. Set the number of links, width, thickness, looseness and an optional key ring. Prints flat with 45 degree tunnel roofs, no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 50,
    title: 'Flip-Flop Flipper',
    bundle: 'fidgets',
    category: 'DESK // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/flipper.svg',
    programUrl: 'programs/flipper.html',
    description: 'A kaleidocycle: a ring of six hinged tetrahedra with print-in-place pin hinges that turns itself inside out when you push it. Set piece length, slimness, hinge size, pin gap and the pose it prints in. Print it with supports under the three raised pieces and around the hinges. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 51,
    title: 'Pot of Gold',
    bundle: 'stpatricks',
    category: "ST PATRICK'S // GOLD",
    thumbnailUrl: 'assets/thumbnails/pot-of-gold.svg',
    programUrl: 'programs/pot-of-gold.html',
    description: 'A black cauldron brimming with a mound of gold coins, with an optional belt and clover badge and a few coins spilled beside it. Set pot width and height, rim, pile height, coin count and size. Rests on a flat base with gentle slopes, so it prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 52,
    title: 'Leprechaun Hat',
    bundle: 'stpatricks',
    category: "ST PATRICK'S // HATS",
    thumbnailUrl: 'assets/thumbnails/leprechaun-hat.svg',
    programUrl: 'programs/leprechaun-hat.html',
    description: 'A tall top hat with a rolled brim, a band, and a buckle or clover on the front. Set crown width and height, how wide the top is, the brim width, thickness and roll-up, and the band. Prints brim down with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 53,
    title: 'Lucky Horseshoe',
    bundle: 'stpatricks',
    category: "ST PATRICK'S // LUCKY CHARMS",
    thumbnailUrl: 'assets/thumbnails/lucky-horseshoe.svg',
    programUrl: 'programs/lucky-horseshoe.html',
    description: 'A flat horseshoe with real square nail holes, an optional clover on top and an optional hang loop. Set width, band width, thickness, how open it is, and the number and size of the holes. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 54,
    title: 'Clover Chain',
    bundle: 'stpatricks',
    category: "ST PATRICK'S // LUCKY CHARMS",
    thumbnailUrl: 'assets/thumbnails/clover-chain.svg',
    programUrl: 'programs/clover-chain.html',
    description: 'One clover or a whole row of them joined by bridges, with three or four leaves, leaf veins and hang rings at one or both ends. Set 1 to 8 clovers, leaf size, bridge length and thickness (thin bridges bend) and a twist for each link. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 55,
    title: 'Firework Burst',
    bundle: 'july4',
    category: "FOURTH OF JULY // FIREWORKS",
    thumbnailUrl: 'assets/thumbnails/firework-burst.svg',
    programUrl: 'programs/firework-burst.html',
    description: 'A flat radial burst of tapered spokes with ball, star or diamond tips, a centre hub, an optional inner ring and an optional hang loop. Set the number, length and width of the spokes, long and short lengths, tip style and thickness. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 56,
    title: 'Star-Spangled Star',
    bundle: 'july4',
    category: "FOURTH OF JULY // STARS",
    thumbnailUrl: 'assets/thumbnails/star-spangled-star.svg',
    programUrl: 'programs/star-spangled-star.html',
    description: 'A chunky star plaque with a raised rim, a centre star and small spangle stars on each point. Use it as a coaster, ornament or wall star. Set the number of points, size, how spiky it is, thickness, rim width and the decoration. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  }
];

// Group registry. A group (BUNDLES) is a region of the homepage world map. Related groups sit next to
// each other (Halloween beside Christmas), so the map reads like a heatmap of what exists.
// Add a group by appending an entry; add a generator to it with the `bundle: '<group id>'` field
// (a string, or an array for several groups) or the `generators` list.
//   id / name / description: region header and search text
//   accent: CSS hex colour of the region's tint, connectors and hover glow
//   at / size: ignored. The homepage sizes each region to its tiles and packs regions in rings around the Workshop
//       tile automatically (see docs/homepage.md), so a new group needs no coordinates.
//   planned: true for a region with no generators yet. It shows as empty slots to be filled later.
//   generators: optional ordered list of ids ('SLOT-01') to control tile order
const BUNDLES = [
  // Holidays
  { id: 'halloween', name: 'Halloween', accent: '#ff8a1f', at: [0, 0], size: [4, 2],
    description: 'A ghost, a pumpkin, a spider, a witch hat and a skull.',
    generators: ['SLOT-02', 'SLOT-03', 'SLOT-05', 'SLOT-07', 'SLOT-01'] },
  { id: 'christmas', name: 'Christmas', accent: '#ff4d6d', at: [4, 0], size: [4, 2],
    description: 'Snowmen, snowflakes, a tiered tree and gift boxes.',
    generators: ['SLOT-04', 'SLOT-13', 'SLOT-08', 'SLOT-09', 'SLOT-06'] },
  { id: 'easter', name: 'Easter & Spring', accent: '#c4f04a', at: [8, 0], size: [3, 2],
    description: 'Decorate eggs, hatch a chick, build a bunny and plant flowers.',
    generators: ['SLOT-30', 'SLOT-31', 'SLOT-32', 'SLOT-33', 'SLOT-34', 'SLOT-35'] },
  { id: 'valentines', name: "Valentine's", accent: '#ff6ec7', at: [0, 3], size: [2, 1],
    description: 'Candy hearts with love notes and a fold-up card.',
    generators: ['SLOT-28', 'SLOT-29'] },
  { id: 'thanksgiving', name: 'Thanksgiving & Fall', accent: '#d9822b', at: [2, 3], size: [7, 1],
    description: 'Turkeys, harvest decor, fall leaves and place cards.',
    generators: ['SLOT-17', 'SLOT-22', 'SLOT-18', 'SLOT-20', 'SLOT-19', 'SLOT-21', 'SLOT-23'] },
  { id: 'newyear', name: 'New Year & Party', accent: '#ffd400', at: [9, 3], size: [4, 1],
    description: 'A countdown clock, confetti cannon, party hats and a whistle to blow.',
    generators: ['SLOT-24', 'SLOT-25', 'SLOT-26', 'SLOT-27'] },
  { id: 'birthday', name: 'Birthdays', accent: '#b388ff', at: [16, 3], size: [4, 2],
    description: 'Cakes, cupcakes, candles, pinatas, balloons, banners, a popper spinner and a crown.',
    generators: ['SLOT-36', 'SLOT-37', 'SLOT-42', 'SLOT-38', 'SLOT-39', 'SLOT-40', 'SLOT-41', 'SLOT-43'] },
  { id: 'stpatricks', name: "St. Patrick's Day", accent: '#3ddc84', at: [20, 3], size: [4, 1],
    description: 'A pot of gold, a leprechaun hat, a lucky horseshoe and a clover chain.',
    generators: ['SLOT-51', 'SLOT-52', 'SLOT-53', 'SLOT-54'] },
  { id: 'july4', name: 'Fourth of July', accent: '#5b8cff', at: [20, 5], size: [3, 1],
    description: 'A firework burst and a star-spangled star.',
    generators: ['SLOT-55', 'SLOT-56'] },
  // Fidgets & personal
  { id: 'fidgets', name: 'Fidgets & Clickers', accent: '#00e5ff', at: [12, 0], size: [6, 2],
    description: 'Print-in-place clickers, keycap pads, gears, sliders, spinners and rattles.',
    generators: ['SLOT-10', 'SLOT-12'] },
  { id: 'personal', name: 'Personalised', accent: '#ffae00', at: [13, 3], size: [3, 1],
    description: 'Name plates and keychains.',
    generators: ['SLOT-11'] },
  // Home, craft & play
  { id: 'pottery', name: 'Pottery', accent: '#00ff9d', at: [0, 5], size: [4, 2],
    description: 'Throw and sculpt clay vessels.',
    generators: ['SLOT-15'] },
  { id: 'decor', name: 'Home & Decor', accent: '#4aa3ff', at: [4, 5], size: [4, 2], planned: true,
    description: 'Vases, lamps, frames and wall art.' },
  { id: 'organization', name: 'Organisation', accent: '#38d6c4', at: [16, 6], size: [4, 2], planned: true,
    description: 'Hooks, trays, holders and storage.' },
  { id: 'toys', name: 'Toys & Games', accent: '#ff5252', at: [12, 5], size: [4, 2], planned: true,
    description: 'Puzzles, spinners and pieces to play with.' },
  { id: 'garden', name: 'Garden', accent: '#7bd34a', at: [0, 9], size: [4, 2], planned: true,
    description: 'Planters, markers and plant stands.' },
  { id: 'animals', name: 'Animals & Creatures', accent: '#ffb86b', at: [4, 9], size: [4, 2], planned: true,
    description: 'Pets, wildlife and fantasy beasts.' },
  { id: 'jewelry', name: 'Jewellery & Wearables', accent: '#f08cff', at: [8, 9], size: [4, 2], planned: true,
    description: 'Rings, pendants and charms.' },
  { id: 'tabletop', name: 'Tabletop & Gaming', accent: '#8f9bff', at: [12, 9], size: [4, 2], planned: true,
    description: 'Minis, terrain, dice and tokens.' }
];

const highestSlot = GENERATORS.reduce((max, g) => Math.max(max, g.slot), 0);
const SLOT_COUNT = Math.max(MIN_SLOTS, Math.ceil((highestSlot + 1) / GRID_COLUMNS) * GRID_COLUMNS);

const PROGRAMS = Array.from({ length: SLOT_COUNT }, (_, index) => {
  const slotNum = String(index + 1).padStart(2, '0');
  return {
    id: `SLOT-${slotNum}`,
    slot: index + 1,
    title: '',
    category: '',
    thumbnailUrl: '',
    programUrl: '',
    description: '',
    ...GENERATORS.find(g => g.slot === index + 1)
  };
});

// Resolve bundle membership: each program gets `bundles` (ids), each bundle gets `members` (programs, ordered).
BUNDLES.forEach(b => {
  const ids = (b.generators || []).slice();
  PROGRAMS.forEach(p => {
    const tag = [].concat(p.bundle || []);
    if (tag.includes(b.id) && !ids.includes(p.id)) ids.push(p.id);
  });
  b.members = ids.map(id => PROGRAMS.find(p => p.id === id)).filter(p => p && p.programUrl);
  b.members.forEach(p => { p.bundles = (p.bundles || []).concat(b.id); });
});

// Anything in no group goes to an automatic last region, so a new generator always appears.
(function () {
  const grouped = new Set(BUNDLES.flatMap(b => b.members.map(p => p.id)));
  const rest = PROGRAMS.filter(p => p.programUrl && !grouped.has(p.id));
  if (rest.length) {
    rest.forEach(p => { p.bundles = (p.bundles || []).concat('more'); });
    BUNDLES.push({ id: 'more', name: 'More', description: 'Generators not in a group yet.', accent: '#7ab3ff', size: [4, 1], generators: [], members: rest });
  }
})();
