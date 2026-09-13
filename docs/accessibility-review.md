# Accessibility review — 12 September 2026

## Status and scope

This is a first accessibility pass on the current static design prototype, using WCAG 2.2 Level AA as the target. It is not a conformance assessment. Automated tools need human evaluation alongside them; see [W3C's testing guidance](https://www.w3.org/WAI/test-evaluate/) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

The scope is the 25 compositions in `site/pages`: 17 site designs, sitemap, two design libraries and five header previews. Older standalone homepage options are excluded. The 43 isolated component canvases have structural/browser smoke coverage; they are not individually axe-scanned in this pass.

## Verified result

The final run completed **55 axe scans with zero reported violations**. All keyboard/form/motion assertions, all 25 page-width checks at 320px, and the representative text-spacing checks passed. The separate smoke suite also passed for 25 page compositions and 43 isolated components.

Axe returned **29 incomplete rule groups** across the scans (the same issue can recur on multiple pages, widths and states). These remain in the local results for review; they are not included in the zero-violation count as passes.

## Changes made

| Finding | Implemented change |
| --- | --- |
| Small magenta and violet labels failed 4.5:1 contrast on the dark background | Adjusted the shared accents and current page data to `#d454b9` and `#9276ff`. Their contrast against `#12101e` is approximately 5.16:1 and 5.59:1. Recheck any new background/foreground combination. |
| Text and controls over changing footage depended on the frame beneath | Strengthened the header text scrim, homepage navigation and finale scrim, and glass-video control background. The footage and glass effect remain visible. |
| Homepage lacked a skip link | All main layouts now provide a skip link and a focusable main target. The shared layout stylesheet owns its presentation. |
| Mobile menu focus could move behind the homepage overlay | Opening moves focus into the menu, background content becomes inert, Tab/Shift+Tab stay with navigation, and Escape closes and returns focus. Desktop breakpoint changes reset the menu. |
| Shared mobile disclosure stayed open when keyboard focus left it | Known outside focus destinations now close it. Escape no longer moves desktop focus onto a hidden mobile button. Safari's existing pointer/link focus handling is preserved. |
| Header library and embedded preview had indistinguishable landmarks | Preview banner, navigation and main have distinct names. Preview-size buttons sit in a named group. |
| Homepage finale loop had no pause control or reduced-motion fallback | It now reuses `header-video.js`: poster-first, explicit play/pause, reduced-motion and offscreen/tab suspension. Decorative video is hidden from assistive technology. |
| Homepage enquiry errors were visual-only and success implied actual delivery | Native required/email validation focuses invalid fields. Instructions identify required inputs. Success receives focus and clearly says nothing was sent; editing clears it. The submit button stays disabled without JavaScript. The Start Event form also associates its instructions programmatically. |
| Changing reduced motion after Vimeo started did not pause it | Added a preference-change pause hook. Actual third-party playback still needs the media review below. |

## Repeatable checks

Run `bun install`, then `bun run test:a11y`. It builds the site, starts a temporary local server and runs Chrome with axe-core 4.13.0 through Playwright. Use `PLAYWRIGHT_CHANNEL` for another installed supported browser channel. No enquiries are submitted: tests use local prototype forms with synthetic values.

The suite checks:

- 50 default-state axe scans: each composition at 1440px and 390px, with WCAG A/AA rule tags through 2.2 plus axe best practices.
- Five additional scans: shared and homepage mobile menus open, both desktop service dropdowns open, and a valid homepage brief preview.
- Keyboard skip-link focus, menu opening, submenu ArrowDown, Escape/focus return, overlay focus containment and shared disclosure focus exit.
- Required and malformed-email validation, preview focus and editing the homepage form.
- Homepage finale keyboard pause/resume and changing reduced-motion preference; testimonial row Enter/Space pause and reduced-motion fallback.
- Page-width reflow at 320 CSS pixels across all 25 compositions.
- Increased line, letter, word and paragraph spacing on News, Start Event and the homepage at 390px. The automated assertion checks page overflow, not every possible internal clipping case.

`bun run test` separately covers local links/assets, landmarks, page/component rendering, header controls, Start Event preview/edit, motion and no-JavaScript header fallback. `bun run handover` includes both suites and regenerates the inventory and review snapshots.

Detailed axe violations and incomplete checks are written to `.cache/accessibility-results.json` (local, gitignored). A violation or failed interaction assertion fails the command. Axe's `incomplete` findings are retained for human review and do not fail it. To focus the default page scans, use, for example, `A11Y_PAGES=news.html,start-event.html bun run test:a11y`; the interaction scenarios still run.

## Human review and remaining work

Visual checks covered the strengthened image-header text treatment, homepage finale/form and mobile overlay. The passing browser assertions are programmatic interaction checks; they do not substitute for using assistive technology.

Before approving the final site:

1. **Screen readers:** manually navigate representative pages with VoiceOver/Safari and NVDA/Firefox or Chrome. Check reading order, landmarks/headings, link names, menu announcements, testimonial reading and form error/summary announcements. This has not been performed here.
2. **Final media:** inspect text contrast over the full duration of each approved clip and against each approved crop, especially homepage project-card labels. Check flashing footage. Decorative loops may remain silent with posters and pause controls; any meaningful speech/information needs the appropriate captions, transcript and description. The external Vimeo player is outside this local automated scan and needs a separate review.
3. **Browser zoom and devices:** manually inspect 200% text zoom and 400% browser zoom, short landscape screens, text-spacing overrides and focus visibility under the fixed navigation. The 320px reflow assertion is useful evidence, but is not a complete zoom/clipping review. Check touch targets and Safari/iOS as well as Chrome.
4. **CMS and content:** approve image alternatives and meaningful link text against the actual media/content. Replace remaining placeholder destinations. Preserve the partials' labels, focus behaviour, contrast tokens and pause controls. The real enquiry workflow needs accessible server-side errors, a submission summary, success/failure handling and a fresh accessibility test.

All 29 incomplete groups concern colour contrast, typically over imagery, transparency or decorative overlays. The external Vimeo player is separately outside this scan's coverage. They must not be read as either confirmed failures or a clean bill of health. Repeat the review after CMS integration and final content changes.
