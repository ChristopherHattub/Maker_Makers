# Development

## Requirements

- Node.js 18 or newer (see `engines` in `package.json`).
- No `npm install` is needed. There are no dependencies.

## Running the site

```bash
npm run dev
```

Starts the dev server at http://localhost:5173 and opens it in your default browser (`open` on macOS, `start` on Windows, `xdg-open` elsewhere). Stop it with Ctrl+C.

To start without opening a browser, or on another port:

```bash
npm run serve -- --port 8080
```

The port can also be set with the `PORT` environment variable. The default is 5173.

## The dev server

`scripts/dev-server.mjs` is a zero-dependency static server with live reload. It serves the repository root.

**Serving.**
- Requests map directly to files under the repo root. `/` and any folder path serve that folder's `index.html`.
- Requests that resolve outside the repo root get `403`. Missing files get a plain `404`.
- Responses set `Cache-Control: no-store`, so refreshes always fetch the latest file.
- Content types come from a built-in table covering HTML, CSS, JS, JSON, images, fonts, and `.stl` / `.3mf`.

**Live reload.**
- The server watches the repo root recursively and ignores `.git`, `node_modules` and `.DS_Store`.
- Each HTML page served gets a small script injected before `</body>`. It opens an event stream to `/__livereload`.
- When only `.css` files change, the server tells the page to swap its stylesheet links, so styles update without losing scroll position.
- Any other change makes the page reload.
- Changes are coalesced for 80 ms, and each one is logged to the terminal as `[livereload] <file> changed -> css|reload`.

**Platform note.** Recursive `fs.watch` is fully supported on macOS and Windows. On Linux it needs a recent Node version. If live reload does not fire on Linux with Node 18, upgrade Node or reload the page by hand.

## Preview tooling

`.claude/launch.json` defines one preview configuration, `maker-makers`. It runs `node scripts/dev-server.mjs` on port 5173, so the same server works in the desktop app's preview pane.

## Checking your change

There are no automated tests or linters. Check by hand:

1. Start `npm run dev`.
2. Load the home screen. Check the generator map tiles and the header buttons.
3. Open a slot (including an empty one) and check the viewer, the iframe, and the download button.
4. Open the printer map and check the markers, the directory and the status line.
5. Submit a test idea, then check the queue and "Export Queue (.JSON)".
6. Resize the window to a phone width and check the layout.
7. Check the browser console for errors.

Network-dependent parts (Leaflet, map tiles, Nominatim, Overpass) need an internet connection. Expect the map to show its fallback when offline.

## Editor settings

`.editorconfig` sets UTF-8, LF line endings, two-space indentation, and a final newline. Markdown keeps trailing whitespace, since it can be meaningful.
