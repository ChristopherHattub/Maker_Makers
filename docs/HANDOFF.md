# Agent handoff

Status as of 2026-11-02. Read [../CLAUDE.md](../CLAUDE.md) first; this page covers workflow and what is in flight. Verify every status line against `git log` before relying on it, because threads move fast.

## Workflow rules (from Chris)

- **Checkouts** (in `/Users/Chris/Projects2.0/Websites`): `MakerMakers` is `main`; `MakerMakers-testing` is a worktree on branch `testing`, shared by every thread. Do not create other worktrees or re-download old iCloud copies.
- **All work-in-progress commits go to `testing`.** Stage files by path, never `git add -A`, never bare `git stash`, and do not disturb another thread's uncommitted work.
- **A feature reaches `main` only when Chris approves it in the thread** (cherry-pick that feature's commits). Main and testing have diverged by cherry-picks, so use `git cherry main testing` rather than comparing hashes.
- **`testing` has never been pushed** (no upstream). First push: `git push -u origin testing`. Pushing to `main` is publishing (GitHub Pages serves `main`), so only on Chris's say-so.
- **Chris reviews on the live site**, not localhost. Offer to push rather than asking him to run a dev server.
- **Use Sonnet** (`claude-sonnet-5-5`) for threads and subagents.
- **Resolve a thread once its work has shipped.**
- **Privacy is a hard rule**: no data collection of any kind (see CLAUDE.md).
- Keep `docs/` in step with code in the same commit.

## Open threads

| Thread | State |
| --- | --- |
| Sedan Maker (slot 105) | On `testing`, unpushed. Latest round: arches, hidden axles, windshield glass, fixed flat spot, headlights moulded into the body. Print check reads "needs supports" because of the ~10 mm arch bridge (recorded in the baseline). Chris is test-printing. Also fixed a Sculpt engine crash (move/stretch after a piece edit, `581a533`); that bug is still on `main`. |
| Paper Towel Holder (slot 104) | On `testing`, unpushed (`a40aeba`, hologram `e520617`, under-cabinet shapes + split rod with draggable cut + magnet pockets `7778aba`). Engine gained an optional Print-tab hook. |
| Home and decor (bookends, tea light lantern, `405e895`) | Blocked, awaiting Chris. |
| Holiday tree decorating editor (`d39f408`) | Blocked, awaiting Chris. |
| Pin Maker (slot 103, `1c67c82`) | Blocked, awaiting Chris. |
| Text Generator (`de29d38`) | Review-ready. |
| Animals and creatures | Kept open by Chris. Known: Snake "needs supports", Cat loaf has a floating bit, slider lag. |
| Fidget ring | Improvements on `testing`, not on `main`. |

## Loose ends nobody owns yet

- **Printability CI** failed on the dice tower push (run 41273464163). Cause: new overhang errors on the "Round tower" and "Round keep" variants, not in the baseline. Fix the model or record the baseline with `node scripts/ci/check-generator.mjs dice-tower --update-baseline`. Several other recent main runs also failed; check `gh run list`.
- **Pumpkin Plotter** test error is unverified (details never recorded).
- **Hologram tiles and panel renders** need re-rendering for the changed animals and the holiday tree ([hologram-tiles.md](hologram-tiles.md)).
- **Self-hosting CDNs** (Google Fonts, three.js, Leaflet) was offered to Chris; awaiting his answer.
- **Printer map**: MA/RI/CT library verification pending ([printer-map.md](printer-map.md)).

## Recommendations backlog

The prioritized list lives in the thread where it was written; top items: self-host fonts and libraries (privacy), lazy-load the 38 MB of tile sprites, fix the CI baseline noise, add a skip-link and reduced-motion handling, and split `generator-core.js` (129 KB).
