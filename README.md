# Encore website design prototype

The current site is assembled from section partials for a later CMS implementation. Start with **[the developer handover](docs/developer-handover.md)**. The earlier standalone homepage concepts remain in `mockups/` and `mockups/archive/` for reference.

```sh
bun install --frozen-lockfile
bun run dev
```

Open the printed local URL followed by `/sitemap.html` for the site hierarchy, or `/header-library.html` to compare header options. The dev server reads `site/` on every page refresh.

## Where to work

- `site/pages/*.json` — page metadata, ordered sections, and structured block content.
- `site/partials/headers/` — interchangeable image, split, video and editorial headers.
- `site/partials/sections/` — reusable content sections.
- `site/partials/pages/` — bespoke sections and draft article bodies.
- `site/partials/shared/` — document head, navigation, footer and keyline.
- `site/layouts/` — page composition shells.
- `site/data/` — shared content lists.
- `mockups/assets/css/` — shared styles, page families and component styles.
- `mockups/assets/js/partials/` — isolated browser behaviours.

Do not edit generated current-page HTML in `mockups/` or `dist/`. Each generated file identifies its source at the top. Edit the page JSON or its referenced partial instead.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Serve current sources and assets; refresh to see edits. |
| `bun run render` | Refresh the HTML snapshots in `mockups/`. |
| `bun run build` | Compile current pages and copy assets/earlier concepts to `dist/`. |
| `bun run preview` | Serve the compiled bundle exactly as static hosting will. |
| `bun run test` | Build, then run browser checks against a temporary preview server. Requires Google Chrome, or a Playwright browser channel set in `PLAYWRIGHT_CHANNEL`. |
| `bun run test:a11y` | Build, scan all current pages with axe and check keyboard, motion, form and narrow-screen behaviour. See the [accessibility review](docs/accessibility-review.md) for coverage and remaining manual checks. |
| `bun run format` | Format current partials, content, styles and behaviours. |

The output is plain HTML/CSS/JS, with relative URLs compatible with the existing `/encore/` hosting prefix. Handlebars is a build dependency; no template engine or partial fetches run in the browser. No CMS has been selected or implemented yet.

## Preparing a handover

Run `bun run handover` to update the [generated component inventory](docs/component-inventory.md), refresh page snapshots and run the compiled-site and accessibility checks. See [motion guidelines](docs/motion-guidelines.md) for the interaction contract. Open `/component-library.html` for live interaction examples and the component index; the index is derived directly from the page configurations.
