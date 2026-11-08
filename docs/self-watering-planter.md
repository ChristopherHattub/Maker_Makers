# Self-Watering Planter (slot 118)

`programs/self-watering-planter.html`. A different thing from the Flower Pot (slot 33, a decorative planter with tap-to-plant flowers). Checked only by `check-mesh.mjs`; not printed yet.

## Three parts, printed in place, no supports

- **Water pot**: the reservoir. Its underside is a 45 degree cone that sits in the saucer, its inside is a funnel, and a 45 degree seat at the rim holds the insert. An overflow hole (a 45 degree diamond, so it prints clean) sits at the "full water level" height and drains onto the saucer.
- **Planting insert**: a funnel that hangs on the rim seat, narrower than the pot neck so it lifts out. Its tip has a wick hole (thread cotton rope through it; the rope dips into the water). An optional **fill window** cuts the insert's flare away over an arc so water can be poured straight into the reservoir.
- **Drainage saucer**: a pedestal with a cone seat for the pot and a moat around it.

All gaps are the **Clearance** slider (0.3 to 0.6 mm, default 0.4), measured vertically, so every contact is a 45 degree cone and nothing needs support.
**Snap-off tacks**: six thin posts under the pot tip and four under the insert tip bridge the clearance so the first layer over it is held. One twist of the pot breaks them. Switch them off in the Print group.

## Shapes

Every part is a surface of revolution scaled by a plan shape (round, square, hexagon, octagon, triangle, flower), widths measured across the flats. Outline (tapered, straight, bowl, tulip, urn, barrel, hourglass) is limited so no wall leans out more than 45 degrees going up or narrows more than 45 degrees going up. Eight wall styles only add to the wall (smooth, ribbed, scalloped, twisted, rings, waves, diamonds, pleated), and are faded in above the base cone.

## Print check note

The check cuts the model into layers about 0.5 to 1 mm tall, so a 0.4 mm clearance can land on a layer and read as a flat overhang. `build()` picks the saucer pit height (2.6 to 4.2 mm) and the pot floor thickness (up to 0.9 mm extra) so both clearances fall between layers (`pickTune`). That is a few tenths of a millimetre either way; nothing else changes.

## Unproven

Clearance, the tacks, how well the rope wicks, and the overflow hole have not been printed.
