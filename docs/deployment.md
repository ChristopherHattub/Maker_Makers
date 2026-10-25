# Deployment (GitHub Pages)

The site is deployed by GitHub Actions through [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

## One-time setup

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.

The site is then served at `https://<user>.github.io/<repo>/`.

## How a deploy runs

The workflow runs on every push to `main`, and can be started by hand from the **Actions** tab (`workflow_dispatch`).

1. **Checkout** the repository.
2. **Assemble** a `_site/` folder by copying only the public files:

   ```bash
   cp -R index.html .nojekyll css js assets programs _site/
   ```

3. **Configure** Pages and **upload** `_site` as the Pages artifact.
4. **Deploy** the artifact with `actions/deploy-pages`.

Runs share a `pages` concurrency group with `cancel-in-progress: true`, so a newer push cancels an older deploy that is still running.

## What gets published

Only the folders listed in the `cp` line. Everything else in the repo, such as `docs/`, `scripts/`, `.github/`, `package.json`, `README.md` and `LICENSE`, is not published.

`.nojekyll` is copied so GitHub Pages serves files as they are, without Jekyll processing.

**Important:** if you add a new top-level folder that the page needs at runtime, add it to the `cp -R` line in `pages.yml`. Otherwise it will work locally and return 404 on the live site. `cp` fails if a listed folder is missing, so keep `programs/` and `assets/` in the repo (they are kept with `.gitkeep` files).

`data/` is included in the copy step because the printer map loads `data/public-printers.json` at run time. If you add another folder the page reads, add it to that line too.

## Paths must be relative

The site is served from a project subpath, not from the domain root. Use relative paths everywhere:

- `css/styles.css`, not `/css/styles.css`
- `programs/honeycomb-hook.html`, not `/programs/honeycomb-hook.html`
- `assets/thumbnails/...`, not `/assets/thumbnails/...`

Absolute paths work locally and break on Pages.

## Checking a deploy

- The **Actions** tab shows the run and any failed step.
- The environment URL printed by the deploy step is the live site.
- After a deploy, load the live URL and check the carousel, a generator slot, and the printer map.
