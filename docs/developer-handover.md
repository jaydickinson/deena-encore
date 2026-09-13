# Developer handover

## Scope and source of truth

This repository is a design prototype for Encore's website, prepared for implementation in a CMS. There are 17 site page designs, a sitemap, two design libraries and five header previews. Each partial also has an automatically generated isolated preview. All current pages are composed from `site/`; the generated HTML is a review artifact. Older concept pages remain standalone and are not the current implementation baseline.

Use `site/pages/homepage-option-1-updated.json` for the current homepage. The selected design language uses Open Sans, dark backgrounds, square edges, fine keylines and small coloured diamonds. The client reference is `updates/Web 1920 – 1.jpg`; brief notes and supplied media are in `updates/`. Do not infer approved factual copy from draft design text.

## Composition

A page JSON contains document metadata, a layout and an ordered `sections` array. Every section names a partial, relative to `site/partials/` without `.hbs`, and supplies its `data` object. Changing array order changes section order. Shared templates are Handlebars HTML, with escaped values by default. There is no application framework to carry into the CMS.

```json
{
  "component": "headers/image",
  "data": {
    "eyebrow": "Experience Design",
    "title": "Every experience starts with",
    "accent": "people.",
    "description": "Audience insight, creative thinking and event design.",
    "ctaLabel": "Start your event",
    "ctaHref": "start-event.html",
    "image": "assets/img/client-updates/_DSC1103.jpg",
    "imageAlt": "Guests exploring an illuminated exhibition floor",
    "focalPoint": "center center",
    "colour": "#11bfdd",
    "caption": "Think differently."
  }
}
```

The complete, working example is `site/pages/experience-design.json`. The page schema provides editor validation for the composition envelope. `scripts/render-site.ts` resolves and checks partials and required header fields; the dev server uses the same renderer as the static build. A broken partial fails visibly instead of leaving an empty section.

## Swap a header

Set the first section's `component` to one of these options:

| Partial | Treatment | Current examples |
| --- | --- | --- |
| `headers/parallax` | Full-height image or video with layered scroll/pointer parallax, outlined `word` and gel gems | **Top-level pages:** the three services, About, Case studies, Event types, News |
| `headers/split` | Text column beside an image with a keyline and diamond | **Detail pages:** case studies and news articles |
| `headers/split-video` | Split layout with a moving video and translucent glass frame | Start Event |
| `headers/image` | Full-width image, dark scrim, text and CTA overlay | Header library preview |
| `headers/video` | Decorative muted loop behind text, with poster and pause control | Header library preview |
| `headers/editorial` | Text-led opening with a geometric diamond motif | Header library preview |

Rule of thumb: top-level pages open with the parallax header, detail pages with a split header. Every page except the homepage passes a `breadcrumb` (`{ parents: [{href, label}], current }`); `headers/copy` renders it above the eyebrow in every variant, and the L'Oréal opening matches that position. Parents are "What we do", "Case studies" or "News".

The six variants use the same field model. To switch to video, also provide a local `video` MP4 path and a suitable `image` poster. To switch away, unused video fields can be removed. The renderer automatically includes header CSS and the video behaviour only when needed; no extra script edits are required.

The homepage's approved Vimeo treatment lives separately in `headers/homepage-vimeo.hbs` and uses its existing homepage styles/behaviour. It is a preserved homepage-specific variant, not an example of the new generic header field model.

### Header fields for the CMS

| Field | CMS control / meaning |
| --- | --- |
| `component` | Header layout selector; select from the five supported variants. |
| `eyebrow` | Optional short service/category label beside the diamond. |
| `title` | Required plain text H1, without HTML. |
| `accent` | Optional second line, tinted with the accent colour. |
| `description` | Optional plain text introduction. |
| `ctaLabel`, `ctaHref` | Optional link pair. Resolve a CMS page relation to a URL. |
| `image`, `imageAlt` | Image/media picker plus meaningful alternative text; required on image/split/video. |
| `video` | Web-ready MP4; required for video and split-video variants. |
| `focalPoint` | Image/video crop position, e.g. `center center` or `60% 40%`. |
| `colour` | Required accent; offer curated brand swatches in the CMS. |
| `caption` | Optional line beneath the header, including temporary image provenance where relevant. |
| `backLabel`, `backHref` | Optional link pair for returning to an index (service pages use it for "Next: …"). |
| `word`, `breadcrumb` | Parallax header only: large outlined word (Think / Create / Deliver) and `{ parents: [{href, label}], current }`. `video` is optional on this variant. |

The parallax header's JS only sets three CSS variables (`--sp` scroll, `--px`/`--py` pointer); CSS moves each layer. Reduced motion, touch and no-JS keep a static composition.

Image and text layouts work without JavaScript. Video does not request its source until visible and allowed to play. Reduced motion and data saving initially show the poster; the user can explicitly play. Pause state survives scrolling away and returning. Offscreen and background tabs suspend playback. Autoplay failure retains the poster; a failed file leaves a labelled disabled control. Do not remove the pause control when porting.

## Sections and CMS mapping

| Source | Proposed CMS equivalent | Content location |
| --- | --- | --- |
| `sections/service-story.hbs` | Narrative blocks (heading, paragraphs, emphasis lines) | Page JSON: eyebrow and blocks array |
| `sections/service-offerings.hbs` | "What we do" expertise list: sticky intro, numbered items lit as they cross the viewport (`service-expertise.js`) | Page JSON: eyebrow/title/optional description and items array |
| `sections/service-journey.hbs` | Think / Create / Deliver cross-links; current page marked | Page JSON intro + shared `services` list in `site/data/site.json` (also drives the nav dropdown) |
| `sections/service-process.hbs` | Process steps | Page JSON: introduction, CTA, steps array |
| `sections/related-work.hbs` | Image/text split + link | Page JSON |
| `sections/service-cta.hbs` | Enquiry CTA | Page JSON |
| `sections/project-story.hbs` | Project facts, overview, challenge and approach | Case study JSON: facts and items arrays |
| `sections/project-gallery.hbs` | Project gallery | Case study JSON: current image, alt and source note; expand to a media repeater when approved photography arrives |
| `sections/next-project.hbs` | Next project relation and project navigation | Case study JSON + shared list in `site/data/site.json` |
| `sections/testimonials.hbs` | Testimonial collection in two marquees | Real attributed quotes currently in the partial; map quote/name/role/accent to a repeatable CMS field |
| `sections/event-enquiry.hbs` | Enquiry form block | Form markup in the partial; current behaviour previews locally only |
| `sections/editorial-cta.hbs`, `sections/work-cta.hbs` | Shared CTA blocks | Copy currently in these shared partials |
| `pages/news-*/` | Article rich text/body | Bespoke draft content in a readable partial per article |
| `pages/news/story-grid.hbs`, `pages/case-studies/project-grid.hbs` | Article/project query blocks | Static review collection; replace with CMS relationships/queries |
| `pages/about/`, `pages/homepage-option-1-updated/` | Bespoke introduction, services, work and finale blocks | Readable HTML sections; these still contain their own prototype content |
| `shared/site-header.hbs`, `shared/site-footer.hbs` | Global menus and footer settings | Shared markup; resolve navigation links from CMS menus |

Not every paragraph is already a CMS field. Repeated service and project sections and all new headers have structured JSON data. Bespoke editorial/homepage content remains in separate, formatted HTML partials so it can be reviewed before defining final rich-text and block fields. The prototype renderer is scaffolding, not the required CMS architecture.

## CSS and JavaScript

`mockups/assets/css/site-pages.css` supplies the current page suite's tokens, base typography, buttons, navigation and footer. `css/partials/page-headers.css` owns all five generic header layouts. `css/pages/` contains the service, case study, editorial, enquiry, sitemap and library families; the preserved homepage has its own stylesheet. Keep component selectors scoped to avoid page rules altering the logo, navigation or other blocks.

Browser behaviours live in `mockups/assets/js/partials/`:

- `site-pages.js`: service dropdown and mobile menu. The focus-out handler deliberately checks `relatedTarget`; closing when Safari temporarily focuses the body prevents a link's click from navigating.
- `header-video.js`: local decorative header video, motion preferences, visibility and explicit playback control.
- `testimonials.js`: continuous opposite-direction loops, click/keyboard pause, reduced-motion fallback, inert/hidden clones and visibility suspension.
- `event-enquiry.js`: local preview/edit flow. There is no endpoint or storage.
- `header-library.js`: review-only variant and viewport controls.
- `homepage.js`, `homepage-vimeo.js`: preserved homepage interactions and supplied Vimeo film. These are the remaining older page-specific behaviours.

Do not introduce browser-side HTML includes; keep page content, links and headings present in the server-rendered response. Use escaped CMS fields and validated media/link URLs in the eventual CMS templates. The source JSON is trusted repository content, not a public input interface.

## Media and content status

Existing web-ready loops and posters live in `mockups/assets/video/`; supplied optimised photography is in `mockups/assets/img/client-updates/`. Full 4K sources are excluded from deployment. Reference web-ready assets with relative URLs so `/encore/` hosting works.

- Generic service/About/index header media is illustrative design material from the existing collection.
- Case study image provenance is retained in captions; Adobe Summit is a temporary reference for Adobe MAX, and some other projects also await their own images.
- Project facts, article copy, dates, final event categories and many supporting details await approval. TBC labels are intentional.
- Testimonials came from the supplied testimonial document; retain attributions and check approval for publication.
- The homepage still uses the supplied Vimeo ID `1212328784`. Third-party playback depends on browser/network access and may show its poster fallback.
- Forms are design previews. The CMS developer must implement delivery, validation, consent requirements and completion/error states once the form requirements are agreed.

## Preview, build and checks

Run the commands in the root README. `bun run dev` renders current source pages on refresh while serving existing assets and older concepts. `bun run render` refreshes the generated HTML snapshots. `bun run build` renders `dist/`; `bun run preview` serves that compiled output. Docker installs the locked build dependencies, renders the bundle and serves it with nginx.

`bun run test` checks all page compositions at desktop and mobile widths, local assets and anchor destinations, landmarks, the service dropdown, header playback and preference changes, pause persistence, enquiry preview/edit and the header library. It also checks that a header's content/poster exists without JavaScript. Use Chrome or an installed Playwright channel via `PLAYWRIGHT_CHANNEL`.

`bun run test:a11y` runs the repeatable accessibility checks. The [accessibility review](accessibility-review.md) records fixes, scope and the remaining screen-reader, media and CMS checks. A clean automated run is not a WCAG conformance claim.

Review the header library and at least one page of each type visually after style changes. Keep one H1/main per page, meaningful image alternatives, visible keyboard focus, no horizontal page overflow, and intact reduced-motion behaviour. The sitemap and header preview pages are review tools; decide whether to exclude them from the CMS's public navigation and search index.

## Component inventory and interaction specification

The [component inventory](component-inventory.md) is generated from the actual page compositions, including nested shared partials. It lists source files, data keys in use and page usage. Regenerate it with `bun run inventory`; the live component-library page reads the same source information directly.

The [motion guidelines](motion-guidelines.md) specify timings, hooks, hover/focus/touch behaviour, reduced-motion handling and implementation acceptance checks. The visual review page is `/component-library.html`.

Run `bun run handover` before transferring the repository. This updates the inventory and generated pages, then builds and runs the browser and accessibility checks. Send the source repository and these docs alongside the static `dist/` preview: the CMS developer needs the page JSON, templates, assets and behaviour files, not only compiled HTML.

### Isolated component previews and glass video

Every item in the component library now has an **Open component** link. Previews open in a new tab, with an isolated canvas containing the actual partial, its stylesheet family, relevant behaviours and example data taken from an existing page. The generated `component--*.html` files also work in the static build. The toolbar links back to the library and to the example page. `shared/head` is nonvisual, so its preview shows rendered metadata markup instead.

`headers/split-video` is the glass-frame video variation used on Start Event. It uses the same fields as `headers/split`, plus a required `video` MP4. The central footage stays sharp; four translucent border strips use backdrop blur, highlights and a corner diamond. Pointer hover moves a restrained highlight along the top edge. Reduced motion leaves the poster and still frame; explicit play/pause remains available. The video observer tracks the media panel itself, so it pauses when the panel leaves view.

### Shared page width

`assets/css/partials/layout.css` owns the container tokens: `--page-max` (1360px), `--page-gutter` (16–40px) and `--page-inset` (24px). Desktop headers and main section grids follow the navigation container, avoiding the previous extra 72px inset. Small screens retain 22px content padding. Article reading columns keep their separate text measure. Change these tokens rather than adjusting individual page margins.

## Image-led case studies

L’Oréal now composes separate opening, Think, Create, Deliver, gallery and closing sections in `site/pages/case-study-loreal.json`. Each can be reordered in the sections array. `sections/case-chapter-heading` supplies the repeatable THINK / CREATE / DELIVER messaging with a number, heading ID, service descriptor and brand accent. Keep the three chapter names consistent across future case studies; the supporting project story can vary.

`sections/case-video` is an optional, independently movable video block. Supply `embedUrl`, `videoUrl`, `poster`, `posterAlt`, image dimensions, `eyebrow`, `title` and `description`. The current L’Oréal block uses the supplied Vimeo highlights film after Deliver. Remove the block (or omit `embedUrl`) when no film is available. Include `assets/css/partials/case-study-components.css` and `assets/js/partials/case-video.js` on pages using it. Playback starts only on click, with standard Vimeo controls and an external fallback link. Local MP4 support is not implemented in this block.

The L’Oréal image strip uses locally served GSAP 3.13.0, Draggable and InertiaPlugin (unmodified vendor distributions, licence notices retained). Its proxy drives native horizontal scroll, retaining arrow buttons, keyboard navigation and scrollbars. Reduced motion disables momentum and animated button scrolling; direct dragging remains available. Without GSAP the strip retains native touch/trackpad scrolling and arrow controls.
