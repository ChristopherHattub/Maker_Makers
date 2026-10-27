# Contributing

Thanks for helping with Maker Makers. The project is small on purpose: plain files, no build, no dependencies. Please keep it that way unless a change clearly needs more.

## Ground rules

- **No build step and no dependencies.** Don't add npm packages, bundlers, or frameworks for a small feature. Use the dev server and browser APIs that already exist.
- **Relative paths only.** Every URL to a local file must be relative, so the site works on GitHub Pages project URLs. See [deployment.md](deployment.md).
- **Keep the data in data files.** Generators belong in `js/programs.js`, and printers in `data/public-printers.json`. Don't hardcode them into rendering code.
- **Escape anything from outside.** Text that comes from search results, OpenStreetMap, or user input must not be inserted as raw HTML. Plain values from the repo's own data files are trusted (see [architecture.md](architecture.md#known-issues)).
- **Degrade gracefully.** Storage, geolocation and external services can all fail. Wrap them, and show a sensible fallback.

## Making a change

1. Create a branch from `main`.
2. Make the change and follow the conventions in this document.
3. Run `npm run dev` and check the affected screens by hand (see [development.md](development.md)).
4. Update the docs in `docs/` if the change affects anything described there.
5. Open a pull request against `main`.

## Conventions

- Match the file you are editing. JavaScript uses single quotes, semicolons, and 2-space indentation. CSS uses CSS variables from `:root` for colors.
- Keep `.editorconfig` settings: UTF-8, LF, two spaces, final newline.
- Mark sections with short banner comments, as `app.js` and `styles.css` already do, rather than long prose.
- Use plain, self-explanatory names. The code already has `openProgram`, `renderPrinterLocations`, and similar.

## Checklists

**Adding a generator**

- [ ] Standalone HTML in `programs/`, using a relative path
- [ ] Thumbnail in `assets/thumbnails/`
- [ ] Slot updated in `js/programs.js` (`title`, `category`, `thumbnailUrl`, `programUrl`, `description`, `bundle`)
- [ ] Viewer and download checked on that slot

**Adding a verified printer listing**

- [ ] Access rules, cost and equipment confirmed on the official page
- [ ] Entry added to `data/public-printers.json` with `verifiedDate` set
- [ ] Coordinates checked on a map
- [ ] Map popup and directory card checked for length

**Changing the deploy**

- [ ] Live site checked after the push (Pages republishes from `main` root)

## Licensing

The project has no license yet (see [LICENSE](../LICENSE)). Don't add third-party code or assets without checking that they can be used here.
