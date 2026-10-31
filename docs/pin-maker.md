# Pin Maker (slot 103)

A badge or lapel pin, `programs/pin-maker.html`. Pick a picture (or one of six built-in shapes) and it becomes a flat plate with a chamfered edge and an optional raised rim. The Stamps tab adds text and shapes on the face. It prints flat, face up, with no supports.

## Privacy

The picture never leaves the browser. A file chosen in the page is drawn to a canvas (longest side 200 px) with `URL.createObjectURL`, read with `getImageData`, traced in `tracePin` and dropped when the page closes. Nothing is uploaded, stored or sent anywhere; the page makes no network call of its own.

## From picture to outline

1. **Mask** (`makeMask`). One of four modes: everything but the background (the background colour is taken from the four corners), dark parts, light parts, or the alpha channel (transparent PNG and SVG). *Tracing strength* is the tolerance or cut-off. When a picture is loaded the page picks a mode by itself: alpha when more than 2 percent is transparent, else "not the background" when the four corners match, else dark parts.
2. **Clean** (`cleanMask`). Specks under 1 percent of the biggest piece are dropped; *Loose pieces* can keep only the biggest. Holes are filled, or kept when *Holes in the picture* is set (holes under 0.4 percent of the shape are still filled).
3. **Signed distance field** (`signedField`, an exact Felzenszwalb distance transform). The *Border around the picture* and the rim are then plain contour levels of this one field, so no polygon offsetting is needed. The hanging lug is a circle merged into the field and the hole a circle cut out of it, so both come out as part of the traced outline. The field is smoothed with a box blur (*Smooth the outline*).
4. **Contours** (`contours`, marching squares with sub-pixel interpolation, joined into closed loops), simplified with Douglas-Peucker to about 0.07 px per pixel-per-mm.
5. **Plate** (`regions`, `extrude`): loops are sorted by nesting depth (even is material, odd is a hole) and extruded with `THREE.ExtrudeGeometry` with a 0.4 mm 45 degree chamfer. The rim is the band between the outline and the same outline pulled in by the rim width, standing from 0.5 mm inside the plate up to the rim height.

The mask is shrunk when a small pin would need more than 7 pixels per mm. A picture so thin that smoothing erases it is traced again without smoothing; if nothing is left at all the heart is shown instead.

## Mount

- **Flat back**: the back is flat on the bed, ready to glue a standard adhesive or sew-on brooch pin-back. A printed pin-back would need a recess or bridge on the bed side, which cannot print without supports on a face-up plate, so none is modelled.
- **Hanging hole**: a round lug on the top edge of the outline with a 2 to 8 mm hole, for a jump ring, keyring or lanyard.

## Stamps

The Stamps tab is the same tool as the Dice Tower's (text in the embedded Archivo Black outline font from the Text Generator, plus star, heart, shield, sword, crown). A click on the top face places a stamp. It stands *Stands out from the pin by* mm above the face and sinks 0.5 mm into it so it is fused to the plate, and it shrinks until it sits entirely on the face. A stamp is saved as a position on the plate (x, y in mm), so it stays where it was put when sliders change.

## Checks

`check-mesh.mjs programs/pin-maker.html --all` builds the defaults and every preset with three stamps (`testSetup`); all closed surfaces are watertight and the print check reads "no supports needed". `ci/printability-baseline.json` needs no entry. Nothing here has been physically printed.
