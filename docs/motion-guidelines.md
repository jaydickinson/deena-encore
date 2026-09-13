# Motion and interaction handover

The motion layer lives in `mockups/assets/css/partials/microinteractions.css` and `mockups/assets/js/partials/microinteractions.js`. It is shared across current page compositions and can be ported independently of Handlebars. The browser receives all content before the enhancement runs.

Review `/component-library.html` for working examples, a replay control and the generated component index. `/header-library.html` remains the comparison tool for header layouts.

## Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--motion-fast` | 180ms | Button/field feedback and dropdown opening |
| `--motion-base` | 260ms | Arrows, underlines and diamond response |
| `--motion-reveal` | 480ms | Section entrance and gentle card-image scaling |
| `--motion-ease` | `cubic-bezier(.22, 1, .36, 1)` | Quick response with a soft finish |
| `--motion-distance` | 14px | Maximum vertical entrance travel |

Related cards/steps stagger by 60ms, capped at 180ms. The JavaScript reads duration, distance and easing from the CSS tokens. Keep these values in one place when porting.

## Behaviour contract

| Element / hook | Pointer behaviour | Keyboard and touch | Reduced motion |
| --- | --- | --- | --- |
| `.btn` | Arrow moves 3px; a light shadow; 1px press feedback | Visible focus ring and arrow response; normal native activation | Static colour/focus feedback |
| `[data-card]` | Title underline, small image brightness change and diamond quarter-turn | Title underline, diamond response and visible focus ring; whole card remains a link | Underline/focus remain; transforms stop |
| Project `.work-image` or `[data-card-media]` | Image scales to 1.025 inside an existing clipped wrapper | Normal card link activation | No scaling |
| Main navigation | Fine underline on hover and current page | Same underline on focus; native link behaviour | Underline changes immediately |
| Service dropdown | 180ms, 5px opening transition | Existing ArrowDown/Escape and link controls retained | Immediate open/close |
| `.field` | Border/background transition | Label colour and clear outline follow focus | Static focus state |
| `[data-reveal]` | One entrance when entering the viewport | Focusing a descendant immediately cancels its entrance so the target is fully visible | No entrance animation |

Hover-specific effects apply only to a fine pointer that supports hover. Touch does not rely on a hover step before activating a link. Card text and image dimensions do not change; image scaling stays within clipped media wrappers. Closing navigation remains immediate, avoiding stale overlays that intercept clicks.

## Add an entrance to a block

```html
<div class="service-intro" data-reveal>...</div>
<article class="offer" data-reveal data-reveal-step="0">...</article>
<article class="offer" data-reveal data-reveal-step="1">...</article>
```

Use these hooks on a heading group or small card, rather than an entire long page section. Avoid nesting entrance targets and do not attach them to sticky/fixed ancestors, form controls or continuously moving testimonial tracks. The hero copy already has its own single entrance; the background media is separate.

`microinteractions.js` uses IntersectionObserver and the Web Animations API. There is no CSS rule that hides content before JavaScript starts, no persistent zero-opacity state, and no scroll listener or animation framework. An unsupported API simply leaves content visible. Targets enter once; the component-library replay button is an explicit review-only exception.

A changed reduced-motion preference cancels active entrances. So does a hidden tab. A focused descendant cancels its ancestor's entrance and marks it complete. Cancelled animations restore the ordinary layout, and observers release targets after first entry. Initialization is guarded against duplicate execution.

## Existing motion to preserve

Header background video and testimonial marquees have their own modules and controls. They keep their established click-to-pause behaviour and motion preferences. The new entrance hooks deliberately avoid the marquee tracks. The homepage's earlier custom interactions remain in `homepage.js` and `homepage-vimeo.js`; check those when migrating the homepage instead of applying two reveal systems to the same block.

## Acceptance checks

- All text, links and images remain present with JavaScript disabled.
- Under reduced motion, replaying an entrance produces no movement; hover/focus does not scale imagery.
- Keyboard focus during a stagger immediately exposes the destination.
- Navigation still clicks through in Safari; retain the `relatedTarget` focus handling.
- Nothing shifts neighbouring content or adds horizontal page overflow.
- New components use the common tokens and hooks, rather than another animation framework or different timings.

`bun run test` checks these key motion behaviours alongside the existing page/navigation/video/form checks. Use `bun run handover` to regenerate the component inventory, refresh HTML snapshots and run the full compiled-site test suite before handing over.
