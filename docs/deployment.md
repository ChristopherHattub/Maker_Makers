# Deployment (GitHub Pages)

The site is deployed by GitHub Pages straight from the `main` branch. There is no build step and no workflow.

## One-time setup

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings > Pages**.
3. Set **Source** to **Deploy from a branch**, then choose branch `main` and folder `/ (root)`.

The site is then served at `https://<user>.github.io/<repo>/`.

## How a deploy runs

Every push to `main` republishes the site automatically. `.nojekyll` in the repo root makes Pages serve files as they are, without Jekyll processing.

## What gets published

The whole repository root is published, including `data/` (the printer map loads `data/public-printers.json` at run time). Files such as `docs/`, `scripts/`, `package.json` and `README.md` are also reachable by URL; they are harmless but not part of the site.

## Paths must be relative

The site is served from a project subpath, not from the domain root. Use relative paths everywhere:

- `css/styles.css`, not `/css/styles.css`
- `programs/honeycomb-hook.html`, not `/programs/honeycomb-hook.html`
- `assets/thumbnails/...`, not `/assets/thumbnails/...`

Absolute paths work locally and break on Pages.

## Checking a deploy

- The repository's **Deployments** section (or the Pages settings page) shows the latest publish.
- After a deploy, load the live URL and check the generators hub, a generator tile, and the printer map.
