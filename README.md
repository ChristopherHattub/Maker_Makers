# Maker Makers

A static website for hosting parametric STL / 3MF generators and customizers, plus a free, keyless map of public 3D printers and makerspaces.

No build step and no dependencies: it is plain HTML, CSS and JavaScript, so it runs anywhere a static file host does, including GitHub Pages.

## Project layout

```
.
├── index.html            # Page markup
├── css/
│   └── styles.css        # All site styles
├── js/
│   ├── programs.js       # Slot registry (generators; the grid grows with it)
│   └── app.js            # Grid, carousel, viewer, idea queue, printer map
├── data/
│   └── public-printers.json  # Verified printer listings: name, coordinates, source, verified date
├── assets/
│   └── thumbnails/       # Slot thumbnail images
├── programs/             # Standalone HTML generator programs
├── scripts/
│   └── dev-server.mjs    # Zero-dependency live-reload dev server
├── .github/workflows/
│   └── pages.yml         # GitHub Pages deploy workflow
└── .nojekyll             # Tells Pages to serve files as-is
```

Full documentation lives in [docs/](docs/README.md).

## Running locally with live reload

You need Node.js 18 or newer. No `npm install` is required.

```bash
npm run dev
```

This starts a server at http://localhost:5173 and opens it in your browser. Every time you save a file, open tabs reload automatically (CSS changes are swapped in without a full reload). Stop it with Ctrl+C.

To start it without opening a browser, or on another port:

```bash
npm run serve -- --port 8080
```

## Adding a generator

1. Put the generator's standalone HTML file in `programs/`, for example `programs/honeycomb-hook.html`.
2. Put its thumbnail in `assets/thumbnails/`.
3. In `js/programs.js`, fill in that slot's `title`, `category`, `thumbnailUrl` and `programUrl` using relative paths such as `programs/honeycomb-hook.html`. Slots 1 to 3 are featured by default; set `featured: false` to hide a slot from the carousel, or `featured: true` to feature a later slot.

Always use relative paths (no leading `/`) so the site works both locally and under a GitHub Pages project URL like `https://<user>.github.io/<repo>/`.

## Deploying to GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` then deploys the site through `.github/workflows/pages.yml`. You can also run the workflow by hand from the **Actions** tab.

## License

No license has been chosen yet; see [LICENSE](LICENSE).
