# Agent handoff

Status as of 2026-11-02 (after Chris approved shipping everything to `main`: all of `testing` was merged into `main` and pushed, so both branches point at the same commit; the thread table below describes work that is now live on the site unless it says otherwise). Read [../CLAUDE.md](../CLAUDE.md) first; this page covers workflow and what is in flight. Verify every status line against `git log` before relying on it, because threads move fast.

## Workflow rules (from Chris)

- **Checkouts** (in `/Users/Chris/Projects2.0/Websites`): `MakerMakers` is `main`; `MakerMakers-testing` is a worktree on branch `testing`, shared by every thread. Do not create other worktrees or re-download old iCloud copies.
- **All work-in-progress commits go to `testing`.** Stage files by path, never `git add -A`, never bare `git stash`, and do not disturb another thread's uncommitted work.
- **A feature reaches `main` only when Chris approves it in the thread** (cherry-pick that feature's commits). Main and testing have diverged by cherry-picks, so use `git cherry main testing` rather than comparing hashes.
- **`testing` has no upstream** (never pushed as its own branch). Pushing to `main` is publishing (GitHub Pages serves `main`), so only on Chris's say-so. If `main` has moved, merge `main` into `testing` first (conflicts so far were always resolved in favour of `testing`'s newer code), then fast-forward `main`.
- **Chris reviews on the live site**, not localhost. Offer to push rather than asking him to run a dev server.
- **Use Sonnet** (`claude-sonnet-5-5`) for threads and subagents.
- **Resolve a thread once its work has shipped.**
- **Privacy is a hard rule**: no data collection of any kind (see CLAUDE.md).
- Keep `docs/` in step with code in the same commit.

## Open threads

| Thread | State |
| --- | --- |
| Sedan Maker (slot 105) | Shipped to `main` 2026-11-02. Latest round: arches, hidden axles, windshield glass, fixed flat spot, headlights moulded into the body. Print check reads "needs supports" because of the ~10 mm arch bridge (recorded in the baseline). Chris is test-printing. Also fixed a Sculpt engine crash (move/stretch after a piece edit, `581a533`); now fixed on `main` too. |
| Paper Towel Holder (slot 104) | Shipped to `main` (`a40aeba`, hologram `e520617`, under-cabinet shapes + split rod with draggable cut + magnet pockets `7778aba`). Engine gained an optional Print-tab hook. |
| Home and decor (bookends, tea light lantern, `405e895`) | Blocked, awaiting Chris. |
| Holiday tree decorating editor (`d39f408`) | Blocked, awaiting Chris. |
| Pin Maker (slot 103, `1c67c82`) | Blocked, awaiting Chris. |
| Text Generator (`de29d38`) | Review-ready. |
| Animals and creatures | Kept open by Chris. Known: Snake "needs supports", Cat loaf has a floating bit, slider lag. |
| Fidget ring | Shipped to `main` with everything else. |

## Loose ends nobody owns yet

- **Printability CI** (Chris: red tiles are over-prescribed for now, so ignore them until he asks) failed on the dice tower push (run 41273464163). Cause: new overhang errors on the "Round tower" and "Round keep" variants, not in the baseline. Fix the model or record the baseline with `node scripts/ci/check-generator.mjs dice-tower --update-baseline`. Several other recent main runs also failed; check `gh run list`.
- **Pumpkin Plotter** test error is unverified (details never recorded).
- **Hologram tiles and panel renders** need re-rendering for the changed animals and the holiday tree ([hologram-tiles.md](hologram-tiles.md)).
- **Self-hosting is done** (2026-11-02): three.js, OrbitControls, Leaflet, the two Google Fonts and the Workshop CSG bundle live in `vendor/`; the only outside requests left are Esri map tiles and the typed place search. See [architecture.md](architecture.md#vendored-libraries).
- **Printer map**: MA/RI/CT library verification pending ([printer-map.md](printer-map.md)).

## Recommendations backlog

Done 2026-11-12: page weight. Atlases recompressed (35 MB to 18 MB, build-holo.py now writes q70), Workshop cards use posters instead of atlases (was every atlas, now ~0.2 MB), and the font outlines moved out of five generator pages into `programs/shared/fonts-*.js` (text-generator 510 KB to 50 KB, spinner-ring 320 KB to 55 KB). Homepage first load fetches about 0.8 MB of sprites.

Done 2026-11-02: self-hosting (privacy), accessibility pass (skip link, keyboard brand button, dialog focus and Escape, focus rings, meta description and share tags), and a small engine split (`export-utils.js`, `mesh-utils.js`). Still open:

- The rest of `generator-core.js` (about 2,500 lines) is one closure; the Sculpt tab (about 750 lines) is the best next split but shares much state, so it needs a context object rather than a cut-and-paste.
- Fix the animal printability gaps (Snake, Cat loaf), and consider a "tested prints" marker for generators Chris has actually printed.
- Screen-reader and keyboard review of the generator pages' tabs and sliders; phone check of Sculpt and Stamps tabs.
- Tell Chris when the dice tower and other CI baselines need attention.
