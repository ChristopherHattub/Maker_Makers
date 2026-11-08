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
    description: 'A patched-shirt scarecrow on a post with straw arms, a face and a hat: pick the hat and face style, then size the shirt, post, arms and head. Arms reach up and out so it prints without supports. Paint every part in the Color tool and export .STL.'
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
    description: 'A finger ring whose outer band spins freely around the inner band. The two bands print apart: squeeze the slit inner band shut, push it in and it clicks into place (no supports, nothing printed in place). Put raised text on the spinning band in 11 fonts, or one of five relief patterns (honeycomb, sea waves, woven ribbons, rosettes, flow maze) with their own sliders. The Print tab plays a looping demo of the snap and the spin. Paint parts in the Color tool and export .STL.'
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
    description: 'A loose ball trapped inside a diamond-lattice lantern cage that prints with no supports. Set sides, tiers, cage size, bar thickness, ball size and rattle room. The ball stands on a short snap-off pin. The classic icosahedron, dodecahedron and other polyhedron cages are still there but need slicer supports. Paint parts in the Color tool and export .STL.'
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
  },
  {
    slot: 57,
    title: 'Geo Vase',
    bundle: 'decor',
    category: 'HOME // VASES',
    thumbnailUrl: 'assets/thumbnails/geo-vase.svg',
    programUrl: 'programs/geo-vase.html',
    description: 'A hollow vase with a smooth, fluted, twisted or low-poly faceted body. Set height, base, belly and neck width, belly height, lip flare, flute count and depth, twist, facets, wall and floor thickness and an optional foot ring. Keep the base wide and the twist gentle and it prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 58,
    title: 'Tea Light Lantern',
    bundle: 'decor',
    category: 'HOME // LIGHTING',
    thumbnailUrl: 'assets/thumbnails/tealight-lantern.svg',
    programUrl: 'programs/tealight-lantern.html',
    description: 'A lantern made for battery powered LED tea lights only, never a real flame. Pick 3 to 12 sides, height, the tea light width you measured, and a pierced pattern of stars, diamonds, circles, slots, leaves or hearts. Open, rim ring or lid top. The panel shows fire safety guidelines. Prints with no supports unless you add the lid. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 59,
    title: 'Coaster Set',
    bundle: 'decor',
    category: 'HOME // TABLEWARE',
    thumbnailUrl: 'assets/thumbnails/coaster-set.svg',
    programUrl: 'programs/coaster-set.html',
    description: 'A fully customisable coaster set with a matching holder. Pick round, square, hexagon, octagon, triangle, scallop or flower outlines, corner softness, thickness, rim, and a raised pattern of rings, dots, honeycomb or spokes. Choose 1 to 8 coasters and a stacking holder with a finger notch. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 60,
    title: 'Photo Frame Maker',
    bundle: 'decor',
    category: 'HOME // PICTURE FRAMES',
    thumbnailUrl: 'assets/thumbnails/photo-frame.svg',
    programUrl: 'programs/photo-frame.html',
    description: 'A picture frame sized to your photo, with a pocket in the back for the photo and glass. Choose square, rounded, oval or cut corners, five edge styles (flat, bevel, bead, stepped, cove), border width and depth, and a hang loop or a separate easel leg. Prints face up with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 61,
    title: 'Wall Hook Rack',
    bundle: 'organization',
    category: 'HOME // HOOKS and SHELVES',
    thumbnailUrl: 'assets/thumbnails/wall-hook-rack.svg',
    programUrl: 'programs/wall-hook-rack.html',
    description: 'A wall rack with 1 to 8 pegs in four styles (straight, tip bend, ball knob, wide cap), counterbored screw holes, and optional shelf with plain or gusseted support. Set length, height, peg length and width, tilt and shelf depth. Prints on its back with no supports unless the tip bend is strong. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 62,
    title: 'Floating Shelf Bracket',
    bundle: 'decor',
    category: 'HOME // SHELF BRACKETS',
    thumbnailUrl: 'assets/thumbnails/shelf-bracket.svg',
    programUrl: 'programs/shelf-bracket.html',
    description: 'A screw-on bracket to carry a shelf board, with a back plate and one or two standing webs in wedge, swoosh, open frame or lattice styles. Set depth, wall height, rest thickness, plate size and screw holes, as a single bracket or a pair. Prints on its back with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 63,
    title: 'Bookend Builder',
    bundle: 'decor',
    category: 'HOME // BOOKENDS',
    thumbnailUrl: 'assets/thumbnails/bookend-builder.svg',
    programUrl: 'programs/bookend-builder.html',
    description: 'A bookend with a cut-out silhouette: a book stack, mountains, a city skyline, rolling waves or an arch window. Set width, height, panel and foot size, gussets, detail and variation, as a single bookend or a mirrored pair. Prints upright on its foot with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 64,
    title: 'Cable and Remote Caddy',
    bundle: 'organization',
    category: 'HOME // DESK and COUCH',
    thumbnailUrl: 'assets/thumbnails/remote-caddy.svg',
    programUrl: 'programs/remote-caddy.html',
    description: 'A caddy with 1 to 6 upright pockets for remotes or controllers, a low front wall, floor holes for cables, a wider foot for stability and an optional side comb that holds 2 to 8 cables. Set the pocket size to fit your remote. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 117,
    title: 'Cable Organizer',
    bundle: 'organization',
    category: 'HOME // CABLE MANAGEMENT',
    thumbnailUrl: 'assets/thumbnails/cable-organizer.svg',
    programUrl: 'programs/cable-organizer.html',
    description: 'Three cable holders sized from a slot count and a cable thickness: a clamp that grips the desk edge with a snap-in cable comb, a shallow under-desk tray with snap-in notches in both long walls and screw holes in the floor, or a flat strip of C-shaped cable clips to screw under the desk. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 65,
    title: 'Tray Maker',
    bundle: 'organization',
    category: 'HOME // TRAYS',
    thumbnailUrl: 'assets/thumbnails/tray-maker.svg',
    programUrl: 'programs/tray-maker.html',
    description: 'A tray in a rectangle with a grid of compartments, or a round tray with 1 to 8 pie sections and a centre post. Set size, wall and divider height, corner roundness and optional ear handles with finger holes. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 66,
    title: 'Dice Tower',
    bundle: 'tabletop',
    category: 'TABLETOP // DICE',
    thumbnailUrl: 'assets/thumbnails/dice-tower.svg',
    programUrl: 'programs/dice-tower.html',
    description: 'A tall tower with 2 to 6 angled baffle ramps and a landing tray, in a classic, castle, pagoda, tavern or sci-fi theme. Set the die size, tower height, ramp steepness, wall thickness and tray length and rim. Ramps default to 45 degrees so it prints upright with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 67,
    title: 'Dice Vault',
    bundle: 'tabletop',
    category: 'TABLETOP // DICE',
    thumbnailUrl: 'assets/thumbnails/dice-vault.svg',
    programUrl: 'programs/dice-vault.html',
    description: 'A lidded dice box with an open bay or a grid of round, hex or square pockets, plus a friction lid with an optional honeycomb pattern. Set the die size, pocket layout, depth, wall and corner roundness. The lid prints beside the box with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 68,
    title: 'Custom Dice Maker',
    bundle: 'tabletop',
    category: 'TABLETOP // DICE',
    thumbnailUrl: 'assets/thumbnails/custom-dice.svg',
    programUrl: 'programs/custom-dice.html',
    description: 'A d4, d6, d8, d10, d12 or d20 with raised numbers or domed pips. Set the size, how rounded the edges are, number size, height and stroke thickness. The bottom face stays clear so it prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 69,
    title: 'Miniature Base',
    bundle: 'tabletop',
    category: 'TABLETOP // MINIATURES',
    thumbnailUrl: 'assets/thumbnails/miniature-base.svg',
    programUrl: 'programs/miniature-base.html',
    description: 'A round, square or oval wargame base with a smooth, cobblestone, rubble or hex paver surface, a raised rim and an optional magnet pocket underneath. Set the size, thickness, bevel, stone size and height. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 70,
    title: 'Hex Terrain Tile',
    bundle: 'tabletop',
    category: 'TABLETOP // TERRAIN',
    thumbnailUrl: 'assets/thumbnails/hex-terrain-tile.svg',
    programUrl: 'programs/hex-terrain-tile.html',
    description: 'A hexagon terrain tile with grass tufts, flagstones, water ripples or lava rock, a rim, and optional magnet pockets at the six corners or the centre. Set the edge length, thickness, detail size and height. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 71,
    title: 'Card Deck Box',
    bundle: 'tabletop',
    category: 'TABLETOP // CARDS',
    thumbnailUrl: 'assets/thumbnails/card-deck-box.svg',
    programUrl: 'programs/card-deck-box.html',
    description: 'A deck box with a friction lid, sized to your cards. Set the card size, deck thickness, sleeve padding and clearance, choose upright or flat, and add a divider for two decks or a window in the lid. The lid prints beside the box with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 72,
    title: 'Game Piece Pawn',
    bundle: 'tabletop',
    category: 'TABLETOP // PIECES',
    thumbnailUrl: 'assets/thumbnails/game-pawn.svg',
    programUrl: 'programs/game-pawn.html',
    description: 'A board game pawn in a classic, peg person, cone, bell or gem shape. Set the height, body width, head size and facets, and add a weight pocket under the base. The head has a 45 degree underside so it prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 73,
    title: 'Spinner Dial',
    bundle: 'tabletop',
    category: 'TABLETOP // BOARD GAME PARTS',
    thumbnailUrl: 'assets/thumbnails/spinner-dial.svg',
    programUrl: 'programs/spinner-dial.html',
    description: 'A spinner wheel with 2 to 12 alternating wedges, raised numbers, a hub post and a separate pointer that snaps on. Choose an arrow, dart or needle pointer and set the diameter, relief and pin clearance. Everything prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 74,
    title: 'Chess Piece Set',
    bundle: 'tabletop',
    category: 'TABLETOP // CHESS',
    thumbnailUrl: 'assets/thumbnails/chess-set.svg',
    programUrl: 'programs/chess-set.html',
    description: 'Pawn, rook, knight, bishop, queen and king in a classic, modern, minimal, gothic, crystal or chunky theme, all six in a row or one at a time, with a sculpted knight. Set the head size, collar rings, king top, king height, base size and facets, and add a weight pocket. Heads and crowns use 45 degree undersides so the pieces print upright with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 75,
    title: 'Character Standee',
    bundle: 'tabletop',
    category: 'TABLETOP // STANDEES',
    thumbnailUrl: 'assets/thumbnails/character-standee.svg',
    programUrl: 'programs/character-standee.html',
    description: 'A flat stand-up figure on a slotted base, in a card, arch, shield, hexagon or round token shape, with a raised knight, wizard, rogue or monster, or a blank frame for your own art. Set the size, thickness, border and tab. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 122,
    title: 'Gravity Walker',
    bundle: 'toys',
    category: 'TOYS // ACTION',
    thumbnailUrl: 'assets/thumbnails/gravity-walker.svg',
    programUrl: 'programs/gravity-walker.html',
    description: 'A toy that shuffles down a gentle ramp with no motor or batteries. The body has one fixed foot and two rear legs on print-in-place hinge pins that swing between stops, so it rocks from foot to foot; the ramp, with side rails at the slope you pick, prints in the same file. Choose a duck, robot or cat head, the leg length and the clearance. The legs and ramp print with no supports, but the round soles are shallow arcs, which a slicer lays down like any cylinder lying flat. The walk is checked in a simulation only and nothing has been printed: expect to tune the ramp slope (about 7 to 10 degrees). Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 91,
    title: 'Flexi Dragon',
    bundle: 'flexi',
    category: 'FLEXI // DRAGONS',
    thumbnailUrl: 'assets/thumbnails/flexi-dragon.svg',
    programUrl: 'programs/flexi-dragon.html',
    description: 'A print-in-place articulated dragon: a head with horns, a chain of ball-jointed beads for neck, body and tail, back spikes, bat wings, paws and a tail spade. Set segment count and thickness, wiggle, horns, spikes, wing span and joint clearance. Joints are printed in place, nothing to assemble. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 92,
    title: 'Flexi Gecko',
    bundle: 'flexi',
    category: 'FLEXI // REPTILES',
    thumbnailUrl: 'assets/thumbnails/flexi-gecko.svg',
    programUrl: 'programs/flexi-gecko.html',
    description: 'A print-in-place gecko with big eyes, a jointed body and tail, and four jointed legs ending in toes. Set body and tail segments, thickness, wiggle, leg length and sweep, toes and joint clearance. Everything lies flat so it prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 93,
    title: 'Flexi Crocodile',
    bundle: 'flexi',
    category: 'FLEXI // REPTILES',
    thumbnailUrl: 'assets/thumbnails/flexi-crocodile.svg',
    programUrl: 'programs/flexi-crocodile.html',
    description: 'A print-in-place crocodile with a long snout, back plates, a jointed body and tail and four stubby jointed legs. Set snout length, body and tail segments, thickness, back plates, legs and joint clearance. Everything lies flat so it prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 94,
    title: 'Flexi Octopus',
    bundle: 'flexi',
    category: 'FLEXI // SEA CREATURES',
    thumbnailUrl: 'assets/thumbnails/flexi-octopus.svg',
    programUrl: 'programs/flexi-octopus.html',
    description: 'A print-in-place octopus: a domed head with eyes and up to eight ball-jointed arms that curl across the bed. Set head size, number of arms, segments per arm, arm thickness, curl and joint clearance. Everything lies flat so it prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 95,
    title: 'Flexi Scorpion',
    bundle: 'flexi',
    category: 'FLEXI // BUGS',
    thumbnailUrl: 'assets/thumbnails/flexi-scorpion.svg',
    programUrl: 'programs/flexi-scorpion.html',
    description: 'A print-in-place scorpion with jointed claw arms and pincers, eight walking legs and a long jointed tail with a stinger. Set tail length, body size, claw size and reach, leg fan, tail lift and joint clearance. Prints flat with no supports unless you lift the tail. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 96,
    title: 'Flexi Centipede',
    bundle: 'flexi',
    category: 'FLEXI // BUGS',
    thumbnailUrl: 'assets/thumbnails/flexi-centipede.svg',
    programUrl: 'programs/flexi-centipede.html',
    description: 'A print-in-place centipede: a long chain of ball-jointed beads with a pair of legs on every bead, feelers and tail prongs. Set 8 to 22 segments, thickness, wiggle, leg length and sweep, feelers and joint clearance. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 97,
    title: 'Flexi Turtle',
    bundle: 'flexi',
    category: 'FLEXI // SEA CREATURES',
    thumbnailUrl: 'assets/thumbnails/flexi-turtle.svg',
    programUrl: 'programs/flexi-turtle.html',
    description: 'A print-in-place turtle with a domed shell and plates, a jointed neck and head, four jointed flippers and a jointed tail. Set shell size and height, neck length, flipper length and sweep, paddle size and joint clearance. Everything rests on the bed so it prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 98,
    title: 'Flexi Shark',
    bundle: 'flexi',
    category: 'FLEXI // SEA CREATURES',
    thumbnailUrl: 'assets/thumbnails/flexi-shark.svg',
    programUrl: 'programs/flexi-shark.html',
    description: 'A print-in-place shark: a pointed snout, a chain of ball-jointed beads, an upright dorsal fin, flat side fins and a tail fin. Set segment count, body thickness, snout, swim wiggle, fin sizes and joint clearance. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 99,
    title: 'Flexi Seahorse',
    bundle: 'flexi',
    category: 'FLEXI // SEA CREATURES',
    thumbnailUrl: 'assets/thumbnails/flexi-seahorse.svg',
    programUrl: 'programs/flexi-seahorse.html',
    description: 'A print-in-place seahorse lying on its side: a snout and crown, an arched neck, a round belly and a curling tail of ball-jointed beads, with back ridges and a fin. Set segments, belly size, neck arch, tail curl, snout and joint clearance. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 100,
    title: 'Flexi Caterpillar',
    bundle: 'flexi',
    category: 'FLEXI // BUGS',
    thumbnailUrl: 'assets/thumbnails/flexi-caterpillar.svg',
    programUrl: 'programs/flexi-caterpillar.html',
    description: 'A print-in-place caterpillar: big round ball-jointed beads with little feet, a head with eyes and two antennae. Set segment count, bead size and fullness, taper, wiggle, feet, antennae and joint clearance. The easiest flexi to print, with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 101,
    title: 'Text Generator',
    bundle: 'personal',
    category: 'PERSONALISED // TEXT',
    thumbnailUrl: 'assets/thumbnails/text-generator.svg',
    programUrl: 'programs/text-generator.html',
    description: 'Type any text in 10 open-licence fonts and print it as a raised or engraved plaque (7 plate shapes, border, hanging hole), loose letters, a stepped shadowbox, or hollow LED channel letters. Tune size, spacing and boldness. Everything prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 102,
    title: 'Fancy Ring',
    bundle: 'jewelry',
    category: 'JEWELLERY // RINGS',
    thumbnailUrl: 'assets/thumbnails/fancy-ring.svg',
    programUrl: 'programs/fancy-ring.html',
    description: 'Design an engagement ring display prop in a jewellery-style studio: six real cuts with a carat slider, prong, bezel, halo and three stone settings, plain, tapered or split shank bands, US ring sizes, metal looks and an engraving inside the band. Prints as two glue-together halves plus the stone, with no supports on the default settings. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 103,
    title: 'Pin Maker',
    bundle: 'jewelry',
    category: 'WEARABLE // BADGES',
    thumbnailUrl: 'assets/thumbnails/pin-maker.svg',
    programUrl: 'programs/pin-maker.html',
    description: 'Turn a picture into a wearable badge pin. Choose a logo, drawing or photo (or a heart, star, shield, circle, tile or hexagon) and it is traced into the pin outline in your browser, with nothing uploaded. Set the size, plate thickness, border and raised rim, add a hanging hole, and use the Stamps tab for text and shapes that sit on the face. Flat back for gluing on a pin-back. Prints flat with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 104,
    title: 'Paper Towel Holder',
    bundle: 'organization',
    category: 'HOME // KITCHEN',
    thumbnailUrl: 'assets/thumbnails/paper-towel-holder.svg',
    programUrl: 'programs/paper-towel-holder.html',
    description: 'A paper towel holder as a countertop stand, wall mount or under-cabinet arm. Pick six base shapes (round, rounded square, hexagon, oval, flower, octagon) with square, chamfered or rounded edges, the rod width and length, smooth, ribbed, fluted or twisted rod styles, a hollow rod, tip shape, wall tilt and counterbored screw holes, then add hearts, stars, flowers, leaves or paws as raised stamps. Prints with no supports; a full 280 mm roll needs a tall printer or a shorter rod. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 105,
    title: 'Sedan Maker',
    bundle: 'toys',
    category: 'TOYS // VEHICLES',
    thumbnailUrl: 'assets/thumbnails/sedan-maker.svg',
    programUrl: 'programs/sedan-maker.html',
    description: 'A toy sedan with four wheels that are printed in place: each wheel sits in a round wheel well and spins on a hidden axle pin with clearance, straight off the bed. Set length, width, hood, trunk and cabin shape, windshield slope, wheel size, tread and hub caps, and the print clearance, then use the Car parts tab to click mirrors, spoilers, scoops, antennas, roof racks, lights and handles onto the car. Needs only a short bridge over each wheel, with no supports; the wheel tolerance is untested on a real printer. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 119,
    title: 'Headphone & Controller Stand',
    bundle: 'organization',
    category: 'GAMING // STANDS & MOUNTS',
    thumbnailUrl: 'assets/thumbnails/headphone-controller-stand.svg',
    programUrl: 'programs/headphone-controller-stand.html',
    description: 'A desk headphone stand, a wall headphone hook, a desk controller rack or a wall controller shelf, with the same eight designs as the Console Faceplate (honeycomb, circuit traces, mountains and more) so a stand can match a faceplate. Set the headband width, stand height and cradle, one or two hooks, one to five controller slots with slot width and divider height, a front lip, screw holes and the pattern. Desk stands print upright on a flat base and wall mounts print on their back plate, every overhang is chamfered to 45 degrees, so there are no supports. Unprinted: test the fit with your own headphones and controllers. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 114,
    title: 'Fidget Spinner',
    bundle: 'fidgets',
    category: 'FIDGETS // SPINNERS',
    thumbnailUrl: 'assets/thumbnails/fidget-spinner.svg',
    programUrl: 'programs/fidget-spinner.html',
    description: 'A personalised hand spinner in six styles (classic lobes, flower, star, gear, blade and disc) with 2 to 10 arms. The centre disc prints already captive in its ring and spins by hand, straight off the bed with no supports, or switch to a 608 skate bearing with two printed thumb pads. Add weight pockets for steel balls or bearings, or through holes, at the arm ends, choose a thumb dish, flat or dome hub, and type a name or initials that are raised on the arms. The print clearance is untested on a real printer. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 109,
    title: 'Marble Run',
    bundle: 'toys',
    category: 'TOYS // KINETIC',
    thumbnailUrl: 'assets/thumbnails/marble-run.svg',
    programUrl: 'programs/marble-run.html',
    description: 'A zigzag marble tower: balls roll down sloped tracks, drop through a gap onto the next track and collect in a ramp at the base. Set the marble size (steel or glass), the number of tracks, the width, the slope and the front lip, then open the Simulate tab to drop balls and watch the run work, or click a track to drop one there. Every track has a 45 degree underside, so the tower prints upright with no supports; the rolling is only simulated and untested on a real printer. Paint each track in the Color tool and export .STL.'
  },
  {
    slot: 106,
    title: 'Console Faceplate',
    bundle: 'toys',
    category: 'GAMING // CONSOLE COVERS',
    thumbnailUrl: 'assets/thumbnails/console-faceplate.svg',
    programUrl: 'programs/console-faceplate.html',
    description: 'A decorative faceplate or cover panel at a fixed size for a Switch dock, Switch 2 dock, PS5 side panel or Xbox Series X front, with eight original designs for each: honeycomb, stripes, circuit traces, broken rings, pixel fade, mountains and sun, starburst, or a plain bezel. Set the plate thickness, rim, pattern size and height, and optionally cut vent slots. It prints flat with no supports. The console sizes are estimates, not measured, so test-print one before a long print; the PS5 panel and the Xbox front are larger than a small printer bed. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 121,
    title: 'Zoetrope',
    bundle: 'toys',
    category: 'TOYS // OPTICAL',
    thumbnailUrl: 'assets/thumbnails/zoetrope.svg',
    programUrl: 'programs/zoetrope.html',
    description: 'A spinning slotted drum that makes pictures move. The drum prints already sitting on its pin (a cone-headed pin, a small gap, no supports); flick it and look through the slots at the strip inside. Pick a running figure, flapping bird, bouncing ball or blooming flower, 6 to 16 frames, drum size, picture height and slot width, and print the picture strip flat in one to four pieces, or leave it off and draw your own. Prints with no supports; the gap under the drum is untested on a real printer. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 116,
    title: 'Wall Panel Maker',
    bundle: 'decor',
    category: 'WALL // DECOR',
    thumbnailUrl: 'assets/thumbnails/wall-panel.svg',
    programUrl: 'programs/wall-panel.html',
    description: 'A flat typography panel to hang on the wall, with real moving parts for to-do lists and progress tracking. Set the panel size, corners, border and hanging holes, then drag elements onto it from the Elements tab: text in seven fonts, sliding checkboxes, sliders, progress bars with scale marks, turning dials, dividers and icons. Move them freely on the panel, or start from a to-do list, habit tracker, goals board or dial dashboard. The moving parts print in place, flat on the bed, with no supports; the clearances are untested on a real printer. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 115,
    title: 'Stamp Maker',
    bundle: 'personal',
    category: 'PERSONALISED // STAMPS',
    thumbnailUrl: 'assets/thumbnails/stamp-maker.svg',
    programUrl: 'programs/stamp-maker.html',
    description: 'Design a rubber-stamp style hand stamp: type your text in 10 open-licence fonts, add one of 18 icons (heart, paw, star, flower, cat and more), and pick a layout (icon above or beside the text, text only, icon only, or a round seal with text around the icon). Choose the plate shape and border; the design is mirrored for you. It prints design-up with a tapered one-piece grip underneath, so there are no supports and nothing to assemble: flip it over to stamp. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 111,
    title: 'Battery Dispenser',
    bundle: 'organization',
    category: 'HOME // ORGANISERS',
    thumbnailUrl: 'assets/thumbnails/battery-dispenser.svg',
    programUrl: 'programs/battery-dispenser.html',
    description: 'A battery-shaped storage block with two slots on top, one for AA and one for AAA. Each slot feeds a gravity stack lying on its side; the bottom battery rolls down a ramp and rests against a small lip, half out of the front. Lift it over the lip and pull, and the stack drops the next one into place. Set the stack height, fit clearance, lip height, wall, divider, sleeve band and terminal nub. The front windows are arches, so it prints as one part with no supports and no moving pieces; battery clearances are untested on a real printer. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 107,
    title: 'Holiday Tree Topper',
    bundle: 'christmas',
    category: 'CHRISTMAS // TREE DECOR',
    thumbnailUrl: 'assets/thumbnails/holiday-tree-topper.svg',
    programUrl: 'programs/holiday-tree-topper.html',
    description: 'A faceted crystal star (four or five points), heart or gem on a fluted bell that sits on a socket for the tree tip. Set the size, pointiness and puff, the tree tip width and the socket depth, and choose a smooth or fluted bell and a socket collar. The bell is printed in place on a captured post, so the topper spins on its socket with a 0.4 mm clearance you can change, or print it fixed. Every downward surface is 40 degrees or steeper from vertical; the bell\'s first layers bridge a 0.4 mm gap over a ledge. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 110,
    title: 'Energy Saber',
    bundle: 'toys',
    category: 'TOYS // COSPLAY',
    thumbnailUrl: 'assets/thumbnails/energy-saber.svg',
    programUrl: 'programs/energy-saber.html',
    description: 'A collapsible toy saber that extends like a telescope. A hollow hilt (pillar, spindle, tiered or orbit style, with grip rings) holds two to five nested blade tubes that print in place, collapsed, with a slide clearance all round and a 45 degree catch that stops each tube pulling out. Set tube count and length, blade width and tip, grip width and the print fit; a preview slider shows it extended, and a Hilt parts tab lets you tap bands, flanges, ribs, fins, studs and gems onto the hilt. No supports; the clearances are untested on a real printer. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 113,
    title: 'Gingerbread House',
    bundle: 'christmas',
    category: 'CHRISTMAS // HOUSES',
    thumbnailUrl: 'assets/thumbnails/gingerbread-house.svg',
    programUrl: 'programs/gingerbread-house.html',
    description: 'A gingerbread house that prints as one piece with nothing to assemble. Set the length, depth, wall height and roof pitch, pick a raised door or open doorway, pointed, diamond or teardrop windows (with a centre bar), tile rows on the roof, a chimney, gumdrops and a snow base with a scalloped edge. It is hollow and open underneath, so it stands over an LED tea light. The eaves sit on 45 degree corbels and every window top is pointed, so it prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 112,
    title: 'Pet Bowl Housing',
    bundle: 'organization',
    category: 'HOME // PET CARE',
    thumbnailUrl: 'assets/thumbnails/pet-bowl-housing.svg',
    programUrl: 'programs/pet-bowl-housing.html',
    description: 'A housing that holds your own pet bowl, single or double. Enter the bowl rim, body, bottom and height and it makes a snug pocket with a rim seat. Pick the outline (round, rounded square, hexagon, octagon, oval, flower, heart), four side profiles, smooth, fluted, twisted, ringed or quilted walls, an outer lip, and a flat, anti-tip flange or raised pedestal base. Put the pet\'s name front and centre on a sloped name ramp in front or a board behind, in five fonts and six plate shapes. Double sets can have different sizes and join with a link bar, a spill tray or a raised platform. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 76,
    title: 'Dino Builder',
    bundle: 'animals',
    category: 'ANIMALS // DINOSAURS',
    thumbnailUrl: 'assets/thumbnails/dino-builder.svg',
    programUrl: 'programs/dino-builder.html',
    description: 'Build a T-rex, Stegosaurus or Triceratops: pick the species, head, tail, plates and horns. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 77,
    title: 'Dragon Maker',
    bundle: 'animals',
    category: 'ANIMALS // FANTASY',
    thumbnailUrl: 'assets/thumbnails/dragon-maker.svg',
    programUrl: 'programs/dragon-maker.html',
    description: 'A heraldic dragon in four poses (sitting, prowling, rearing with a roar, asleep): a wedge head with horns and fangs, raised bat wings with finger bones, belly plates, back blades and a spade tail wrapped round its feet. Set size, head, horns, wing size and spread, blades and tail. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 78,
    title: 'Cat Sculptor',
    bundle: 'animals',
    category: 'ANIMALS // PETS',
    thumbnailUrl: 'assets/thumbnails/cat-sculptor.svg',
    programUrl: 'programs/cat-sculptor.html',
    description: 'Sitting, loaf or curled-up cat: tune body, head, ears, eyes and tail. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 79,
    title: 'Dog Builder',
    bundle: 'animals',
    category: 'ANIMALS // PETS',
    thumbnailUrl: 'assets/thumbnails/dog-builder.svg',
    programUrl: 'programs/dog-builder.html',
    description: 'A sitting dog with presets for pug, corgi, husky and puppy: tune snout, ears and tail. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 80,
    title: 'Articulated Snake',
    bundle: 'animals',
    category: 'ANIMALS // FLEXI',
    thumbnailUrl: 'assets/thumbnails/flexi-snake.svg',
    programUrl: 'programs/flexi-snake.html',
    description: 'A print-in-place jointed snake with a wedge head and forked tongue: set length, thickness, wiggle and joint clearance. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 81,
    title: 'Flexi Fish',
    bundle: 'animals',
    category: 'ANIMALS // FLEXI',
    thumbnailUrl: 'assets/thumbnails/flexi-fish.svg',
    programUrl: 'programs/flexi-fish.html',
    description: 'A print-in-place jointed fish with a fan tail and fins: set length, body, fins, wiggle and joint clearance. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 82,
    title: 'Turtle & Tortoise',
    bundle: 'animals',
    category: 'ANIMALS // WILDLIFE',
    thumbnailUrl: 'assets/thumbnails/turtle-tortoise.svg',
    programUrl: 'programs/turtle-tortoise.html',
    description: 'A turtle or high-domed tortoise, with a solid shell or an open trinket dish in the shell. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 83,
    title: 'Owl Stacker',
    bundle: 'animals',
    category: 'ANIMALS // BIRDS',
    thumbnailUrl: 'assets/thumbnails/owl-stacker.svg',
    programUrl: 'programs/owl-stacker.html',
    description: 'One owl or a totem of up to three owls stacked head on head: tune eyes, tufts, wings and belly feathers. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 84,
    title: 'Penguin Pals',
    bundle: 'animals',
    category: 'ANIMALS // BIRDS',
    thumbnailUrl: 'assets/thumbnails/penguin-pals.svg',
    programUrl: 'programs/penguin-pals.html',
    description: 'A penguin with an optional chick, scarf or party hat. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 85,
    title: 'Octopus & Squid',
    bundle: 'animals',
    category: 'ANIMALS // SEA LIFE',
    thumbnailUrl: 'assets/thumbnails/octopus-squid.svg',
    programUrl: 'programs/octopus-squid.html',
    description: 'A dome octopus or tall squid with arms curling flat on the bed: set arm count, curl and length. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 86,
    title: 'Mushroom Critters',
    bundle: 'animals',
    category: 'ANIMALS // WOODLAND',
    thumbnailUrl: 'assets/thumbnails/mushroom-critters.svg',
    programUrl: 'programs/mushroom-critters.html',
    description: 'A mushroom gnome with a spotted cap, a frog or a snail. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 87,
    title: 'Shark Fin Trophy',
    bundle: 'animals',
    category: 'ANIMALS // SEA LIFE',
    thumbnailUrl: 'assets/thumbnails/shark-trophy.svg',
    programUrl: 'programs/shark-trophy.html',
    description: 'One or two swept shark fins cutting through a wave top on a stepped plinth: tune fin, waves and base. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 88,
    title: 'Elephant Builder',
    bundle: 'animals',
    category: 'ANIMALS // WILDLIFE',
    thumbnailUrl: 'assets/thumbnails/elephant-builder.svg',
    programUrl: 'programs/elephant-builder.html',
    description: 'A chunky elephant with the trunk resting or raised: tune body, legs, head, ears and tusks. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 89,
    title: 'Alien & Monster Maker',
    bundle: 'animals',
    category: 'ANIMALS // CREATURES',
    thumbnailUrl: 'assets/thumbnails/monster-maker.svg',
    programUrl: 'programs/monster-maker.html',
    description: 'Seven creature archetypes, each its own model with its own sliders: a gumdrop buddy, a classic grey with almond eyes, a pilot in a flying saucer, a one-eyed brute on its knuckles, a melting slime with eye stalks, a bug alien and a horned yeti. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 90,
    title: 'Horse Builder',
    bundle: 'animals',
    category: 'ANIMALS // WILDLIFE',
    thumbnailUrl: 'assets/thumbnails/horse-builder.svg',
    programUrl: 'programs/horse-builder.html',
    description: 'A horse, pony or unicorn, standing, kneeling or rearing: tune neck, head, legs, mane, tail and face markings. Prints with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 108,
    title: 'Nutcracker',
    bundle: 'christmas',
    category: 'CHRISTMAS // FIGURES',
    thumbnailUrl: 'assets/thumbnails/nutcracker.svg',
    programUrl: 'programs/nutcracker.html',
    description: 'A toy-soldier nutcracker standing on a plinth, with a working jaw that prints in place: the chin swings on two pins inside a bowl with a tolerance gap you set, no supports and no gluing. Pick a shako, crown or spike helmet, size the head, mouth, face and hat, and set the moustache and nose. Paint parts in the Color tool and export .STL.'
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
  { id: 'decor', name: 'Home & Decor', accent: '#4aa3ff', at: [4, 5], size: [4, 2],
    description: 'Vases, lamps, frames and wall art.' },
  { id: 'organization', name: 'Organisation', accent: '#38d6c4', at: [16, 6], size: [4, 2],
    description: 'Hooks, trays, holders and storage.' },
  { id: 'toys', name: 'Toys & Games', accent: '#ff5252', at: [12, 5], size: [4, 2],
    description: 'Puzzles, spinners and pieces to play with.' },
  { id: 'garden', name: 'Garden', accent: '#7bd34a', at: [0, 9], size: [4, 2], planned: true,
    description: 'Planters, markers and plant stands.' },
  { id: 'flexi', name: 'Flexi Creatures', accent: '#5eead4',
    description: 'Print-in-place articulated animals: a dragon, gecko, crocodile, octopus, scorpion, centipede, turtle, shark, seahorse and caterpillar.',
    generators: ['SLOT-91', 'SLOT-92', 'SLOT-93', 'SLOT-94', 'SLOT-95', 'SLOT-96', 'SLOT-97', 'SLOT-98', 'SLOT-99', 'SLOT-100'] },
  { id: 'animals', name: 'Animals & Creatures', accent: '#ffb86b', at: [4, 9], size: [4, 2],
    description: 'Pets, wildlife, sea life and fantasy beasts.' },
  { id: 'jewelry', name: 'Jewellery & Wearables', accent: '#f08cff', at: [8, 9], size: [4, 2],
    description: 'Rings, pendants and charms.' },
  { id: 'tabletop', name: 'Tabletop & Gaming', accent: '#8f9bff', at: [12, 9], size: [4, 2],
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
