# Encore EMEA homepage redesign

Homepage redesign concepts for https://www.encore-emea.com/ (Encore, global event production). We present multiple design options to the client as standalone mockups. Each option is a single self-contained HTML file in `mockups/`; there is no build step, no framework, no shared CSS files.

## Running

```sh
cd mockups && bun serve.ts
```

`serve.ts` is a small static server with HTTP range support (needed for video seeking). You can also open the HTML files directly, but video streaming behaves better through the server.

## Deploying

The client-facing build is hosted as a "deck" on the **hetzner** Dokploy server (`root@hetzner.jakedickinson.co.uk`), served by an nginx container that bind-mounts `/var/www/decks` read-only. Each deck is a subfolder reachable at `decks.jakedickinson.co.uk/<slug>/`. Ours is **`encore-emea`**: live at https://decks.jakedickinson.co.uk/encore-emea/

`bun build.ts` copies `mockups/` to `dist/` (a clean, self-contained bundle; drops the dev-only `serve.ts`). All asset paths are relative, so the bundle works unchanged under the `/encore-emea/` subpath, do not introduce root-absolute (`/...`) `src`/`href`/`poster` paths.

To build and push (overwrites the deck in place; `--delete` prunes removed files):

```sh
bun build.ts
rsync -az --delete dist/ root@hetzner.jakedickinson.co.uk:/var/www/decks/encore-emea/
```

Or `bun run deploy`. Note: hetzner is a separate box from `dokploy.jakedickinson.co.uk` (the other Dokploy server); the deck lives only on hetzner. macOS ships openrsync, so avoid `--info=*` flags (use `--stats`).

The deck is fronted by **Cloudflare** with a 4-hour edge cache (`cache-control: max-age=14400`). After a redeploy, already-cached URLs (HTML, videos) can serve stale at the edge for up to 4h, purge the Cloudflare cache, or verify origin freshness with a cache-buster (`?v=<epoch>`) which forces a MISS. First-time visitors to newly-added files always get fresh bytes.

## Structure

- `mockups/index.html` - gallery landing page: live options in the main grid, retired ones in a collapsed `<details class="archive">` accordion at the bottom
- `mockups/homepage-option-{a,d}.html` and `homepage-option-c-v2.html` - the live concepts (C v2 is C re-tuned for lead generation)
- `mockups/archive/` - retired concepts (`homepage-option-{b,c,c-lorem,e}.html`); their asset paths use `../assets/`, so keep that prefix when editing them, and rewrite `"assets/` to `"../assets/` when archiving another option
- `mockups/assets/` - logos (`encore-logo.svg`, `encore-logo.png`, `encore-logo-white.png`), favicon
- `mockups/assets/img/` - photography, `preview-*.png` gallery screenshots, `seq-hero/` scroll-scrub frame sequence for Option D
- `mockups/assets/video/` - web-ready loops with `-poster.jpg` files: `encore-home-reel`, `encore-lighting`, `show-film`, chapter clips `ch1..ch4`, and real-event loops `cvent-connect`, `evolution-london`, `hum-tv-awards`
- `mockups/assets/video/encore-videos/` - RAW 4K source films from Encore (170MB-1GB each). Never reference these directly in HTML; transcode excerpts into `assets/video/` with ffmpeg (1080p, h264 CRF ~24, faststart, no audio)

## The options

Options A, B and C deliberately share one design system ("concept round 01"), differing only in how far they push it. Option D deliberately breaks that system.

- **A "House lights down"** (safe): classic vertical page, full-bleed video hero, spotlight-sweep headline reveal, gel-coded alternating service splits, pull-quote testimonial.
- **B "The run sheet"** (the risk): page structured as a show running order; video plays inside SVG knockout headline text; services are cue rows with cursor-follow image previews; stats styled as desk readouts; event-types marquee; work filmstrip.
- **C "The show film"** (boldest): pinned hero where one film is scrubbed by scroll while four chapters travel horizontally; Instagram-style swipe stories on mobile; only option with an external dependency (Lenis smooth scroll via CDN).
- **D "Daylight"** (concept round 02, the chosen direction): dark-first modern studio direction with a persisted light/dark switcher, aimed at creative brands. Open Sans (Encore's brand font), sharp geometry (no border radius), warm-white buttons, gel colours used semantically per section with diamond markers, and a hard-stop "facet bar" gradient in exactly four places (very top of the nav strip, stats top, CTA top, footer top). GSAP + ScrollTrigger (CDN) powers the hero and three scroll-driven mask reveals over the real event films. The hero is the signed-off **Rewind** concept (the Build-up/Reel variants and the switcher pill were removed): the Hum TV Awards film plays fullscreen at load; scrolling freezes it into a canvas scrub that rewinds the build from show night back to the empty room (frames in `assets/img/seq-hero/`). Since sign-off D carries lorem placeholder copy in the file itself (no separate `-lorem` file), following the C-lorem rules: narrative copy, service names and client names go lorem; nav, stats, section headings, event types, form and footer copy stay real. On mobile the nav strip shows a compact "Start your event" CTA next to the hamburger. Chapter captions tint a diamond marker with the gel colours.
- **E "Facets"** (concept round 02): the Encore diamond as page architecture; dark-only, Open Sans for everything (headline and body, per client). GSAP + ScrollTrigger (jsDelivr CDN with SRI hashes). Entry is a four-panel "diamond iris" that parts from the centre to reveal the hero film; services are full-viewport rooms that stack like lighting cues (`position:sticky`), on house black with only a 6-7% gel tint (client rejected stronger colour washes), each with a gel-stroked giant numeral and media opening from a diamond clip-path; a live "cue" diamond in the nav takes the gel of the section in view. Hero has pointer-parallax gems and a slow gel wash cycling over the film. Event-type rows flood with their gel on hover; CTA is a bordered booking card (show film inside a diamond + structured lead form); footer opens with a chain of gel diamonds instead of the facet bar. Same in-place lorem rules as D. Fallbacks: reduced motion / ≤960px / no GSAP get a static build with IntersectionObserver reveals; rooms unstick on mobile.

## Shared design system (A, B, C only)

Every A/B/C file carries the same `:root` tokens:

- `--void:#0A0714` page base, `--navy:#1F1646`, `--surface:#14102B`
- Gel accents from the Encore mark: `--cyan:#11BFDD`, `--magenta:#C13FA8`, `--amber:#F9C429`, `--green:#90C74F`, `--violet:#7B5CFF`
- `--spectrum` rainbow gradient, used as 2px hairlines and nav hover underlines
- Fonts: Big Shoulders Display (700-900, all-caps headings), Archivo (body), JetBrains Mono (labels, cues, buttons)

Option D instead uses: near-black `#0C0C0E` / off-white `#F4F3F0` by default (intentionally not the purple void), warm paper `#FAF9F6` / ink `#131217` in light mode, warm-white buttons (inverted in light mode), gel colours as small diamond markers per section, a hard-stop `--facet` gradient bar (not A/B/C's smooth `--spectrum`), no mono font, no border radius.

## Content (identical across ALL options, including D)

Keep content the same everywhere so the client compares design, not copy:

- 4 services in fixed order with gel coding: 01 Event technology (cyan), 02 Production (magenta), 03 Creative (amber), 04 Design & fabrication / Hargrove (green)
- Stats: 2,200+ partner venues, 23 countries, 400k events a year, ~12,000 crew (A also uses 30M reached, 85+ years)
- 6 event types: Meetings & conferences, Hybrid & virtual, Product launches, Conventions & tradeshows, Galas & award shows, Weddings & celebrations
- Nav: What we do / Work or Event types / Venues / About, EMEA region, "Start your event" CTA; 4-column footer (What we do / Planners / Company)
- Voice: A/B/C use theatrical stage-crew jargon ("House lights down", cue numbers, "run sheet"); D's narrative copy is currently lorem placeholder (see above), with structural copy kept real

## Conventions

- One self-contained HTML file per option: inline CSS and JS, fonts from Google Fonts (or Fontshare), libraries only via CDN when essential (C: Lenis, D: GSAP)
- `lang="en-GB"`, semantic landmarks, alt text, `:focus-visible` rings
- Always ship `prefers-reduced-motion` fallbacks and a mobile degradation for every scroll/pin effect
- Shared JS patterns to reuse: IntersectionObserver `.reveal` fade-ups, count-up stats, lazy autoplay/pause of videos via IntersectionObserver, hamburger to full-screen overlay nav
- Videos: muted, looped, `playsinline`, poster attribute, lazy-loaded; big videos only play when in view
- When adding an option: create `homepage-option-X.html`, add a gallery card in `index.html` with a `preview-X.png` screenshot in `assets/img/`
