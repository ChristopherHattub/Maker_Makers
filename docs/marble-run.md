# Marble Run (slot 109)

`programs/marble-run.html`. A zigzag marble tower with a ball simulation. Checked by `check-mesh.mjs` (defaults and all presets: watertight, no print-check issues) and by a headless run of the simulation; **not printed yet**, so the marble clearance and the rolling are unproven.

## Geometry

- A back board and two side posts hold N sloped tracks that alternate direction. Each track stops short of one post, leaving a gap a little wider than the marble; the ball drops through it onto the next track. The last "track" is a collector ramp built into the base plate, so balls pile up at its low end.
- Track profile (side view across the tower): a flat 3 mm floor with a **45 degree underside** that grows thicker toward the back board, plus a front lip (default 45% of the marble). Nothing hangs in mid air, so the tower prints upright with no supports. The slope runs along the track, never across the underside.
- Track pitch is solved per level (`layout()`): each track sits just far enough below the one above to leave the marble 2.5 mm of headroom under the chamfered underside at the tightest point. Taller marbles, longer tracks and steeper slopes all make the tower taller (default 186 mm, so a 180 mm printer needs 3 tracks or a shorter width).
- Channel width is marble diameter plus twice the clearance slider (default 1 mm). Tune it for the filament and printer; it is the main unproven tolerance.
- Meshes: `frame`, `base`, `collector`, `level1` to `level10` (each coloured by default, paintable in the Color tool). Shells overlap by about 1 mm so slicers union them. The model sits on y = 0 and is centred on x and z.

## Simulation (Simulate tab)

A 2D model in the plane of the ball centres, display only (the balls live outside `modelGroup`, so they are never exported or sculpted; Sculpt is off). Segments for every floor, underside, gap edge and post feed a fixed-step solver (960 Hz): gravity, a rolling-ball pull of 5/7 of the slope, small rolling drag, ball bounce 0.3 and ball-to-ball collisions. Buttons drop one ball, five balls, toggle auto-feed or clear. Clicking a track drops a ball there. Up to 12 balls; a drop that would overlap a ball is skipped. Changing a layout slider resets the balls.

It ignores friction between ball and lip, the front/back direction and spin, so treat it as a check that the layout works, not a prediction of speed. Headless check (all presets and slider extremes delivered every paced ball): `cfg.simTest(params, balls, seconds)` on `window.MM_GENERATOR`.

## Style

The page uses `customStage` for a warm toy-room backdrop and checkerboard mat, deliberately unlike the navy stage of the other generators.
