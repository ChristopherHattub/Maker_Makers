# Printability CI

`.github/workflows/printability.yml` runs the printability check for every generator on GitHub Actions. Each generator is its own matrix job (a green or red tile named after the generator), so a failure points at one page.

## What one job does

`node scripts/ci/check-generator.mjs <name>` runs `check-mesh.mjs --all --json` on `programs/<name>.html`, which builds the model in Node for the **defaults and every preset** and reports:

- **Mesh check** (fails the job): the page loads, `build()` returns triangles, and every closed surface is watertight and manifold with no NaN values.
- **Print check** (`programs/shared/print-check.js`, the same code as the live chip): floating parts, overhangs over ~50° and thin walls.

The print check fails a job **only for a new error**: `ci/printability-baseline.json` lists, per generator and variant, the print-check error kinds (`floating`, `overhang`) that are known and not fixed yet. Those show as warning annotations and in the job summary. An error kind that is not in the baseline fails the job. Many generators were not designed support-free, so a hard fail on day one would be noise; the baseline makes it a ratchet. After you fix a generator, run `node scripts/ci/check-generator.mjs <name> --update-baseline` and commit the smaller baseline. Warnings (thin walls) never fail.

Three.js: generators that call `api.THREE` (bookend-builder, image-clicker, key-clicker, remote-caddy, shelf-bracket, tealight-lantern, tray-maker, wall-hook-rack) need r128. `check-mesh.mjs` loads it from `$THREE_PATH` or `node_modules/three/build/three.min.js`; the workflow runs `npm install --no-save three@0.128.0` (nothing is added to `package.json`; the site stays dependency-free). Locally: `npm install --no-save three@0.128.0`.

## When a generator is checked

`scripts/ci/plan.mjs` picks the matrix:

| Change | Checked |
| --- | --- |
| `programs/<name>.html` added or modified | that generator (a new generator is always checked when it lands) |
| `programs/shared/**` (engine, print check), `check-mesh.mjs`, `scripts/ci/**`, `ci/**`, the workflow | **all** generators |
| anything else (docs, homepage, Workshop, data) | none |
| manual run (Actions tab, Run workflow) | `all` or a comma-separated list |
| first push of a branch, or no base commit | all |

Shared engine changes trigger everything on purpose: the check does not execute the engine (it loads only the page's config and `build()`), but `api` helpers and the print check live there, and a full run is cheap. Pull requests run the same plan against the PR base.

## Limits

It tells you the mesh is closed and the shared print check sees no floating or overhanging parts. It is not a real slice and nothing here has been physically printed. Interactive-only features (stamps, cuts, Color tab) are covered only if the page defines `testSetup`. The Text generator's wider style/font sweep (see [text-generator.md](text-generator.md)) is a manual script, not part of CI.
