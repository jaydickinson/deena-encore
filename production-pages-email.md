# Production lead pages: assessment + client email

Working doc for the Encore request to apply the new design direction to
https://www.encore-emea.com/what-we-do/production-services/

---

## What I actually know, and how

Nobody at Encore has briefed me on the technical setup. What I have came incidentally from an
unrelated demo, plus looking at the public site. So everything below is an **assumption to be
confirmed in the email**, not established fact:

- WordPress, ACF + Gutenberg blocks
- Theme CSS looks heavy
- Forms appear to be Ninja Forms

Known from the brief itself:

- Scope: new production lead pages only. No other part of the site changes, no other sections follow
- Budget not to be raised in this email

Because this is the **first official email**, it has to do two jobs at once: introduce how I'd
approach the build, and get the setup confirmed. Tone should be "here's my read, tell me where I'm
wrong" rather than "thanks for the detail".

## My read

**Editability is solved** *if* the ACF + Gutenberg assumption holds. Build the design as custom
Gutenberg blocks with our own ACF fields. Their team edits in the interface they already know; we
just supply the blocks. If the stack turns out to be different, this part gets rethought.

**The real risk is the theme CSS, not the CMS.** Fix: a dedicated page template that doesn't load
the main theme stylesheet (or loads it scoped), so we're not writing a thousand `!important`
overrides against someone else's cascade. **Confirming we're allowed to do this is the single most
important unknown.** If they insist on the standard template inheriting theme styles, fidelity drops
a long way and the microsite becomes the better route.

**Header/footer needs an explicit decision.** They've said nothing else changes, but our design
restyles the nav. So either the new pages inherit the existing header/footer as-is (visible seam top
and bottom, survivable) or they get a page-specific variant. Put it to them as a choice rather than
discovering it at review.

**Subdomain microsite (`production.encore-emea.com`) is a positioning question, not a technical
escape hatch.** It makes sense if they want Production as its own front door. Costs: splits search
authority, second WordPress to host/update/secure, needs their IT for DNS, and analytics/consent/
forms all get set up again.

**Wider rebuild is dead** given "no other sections will follow".

**The forms plugin** is fine either way. Ninja Forms' default styling is heavy, so budget time to
restyle the form, and ask where the leads currently go.

### Getting a working copy (option 1 only)

To build into the existing site I need to run it locally, and **the WordPress XML export is not
enough** for that: content only, no theme, no plugins, no uploads, no settings. What's needed is:

- A host **staging clone** if their host does one-click staging. Quickest route, and it tests against
  the real server environment. Ask this first.
- Otherwise a **full backup**: database dump plus the whole `wp-content` directory, or a single
  package from All-in-One WP Migration / Duplicator / UpdraftPlus.

Local via LocalWP (imports those packages directly, handles the URL search-replace) or DDEV. Match
their PHP version. Watch out for premium plugin licences: ACF Pro and Ninja Forms add-ons are
per-site and may not fully activate on a dev instance.

A full backup contains user accounts and form submissions, so it's personal data. Transfer it
sensibly and delete it at the end of the project.

Note this is itself a cost difference between the routes: option 1 needs a site copy, a local
environment, licences and version matching before a line of code gets written. The microsite starts
from an empty folder.

### Recommendation

Option 1 (build into the existing site), *provided* we get a dedicated page template that isn't
loading the full theme stylesheet. Fall back to Option 2 (microsite) if the site is locked down, or
if they genuinely want Production positioned separately.

Practical caveat: the microsite is materially the easier build from my side. If the access, licences
or staging environment turn out to be slow or awkward to get hold of, that tips the balance towards
option 2 on its own.

---

## Email draft

> **Subject:** Production lead pages: how I'd approach the build, and what I need to confirm
>
> Hi [Name],
>
> Now that the design direction is settled, I wanted to set out how I'd take it from mockups to live pages, and flag the handful of things I need to confirm with you before I can give you a firm scope.
>
> I should be upfront that I haven't been briefed on the technical setup yet, so some of what follows is inference from the public site and from what I picked up in passing. If any of it is wrong, the email is worth reading as "here's my thinking, correct me where I've assumed badly" rather than a settled plan.
>
> **What I'm assuming, and would like confirmed**
>
> My understanding is that the site is WordPress, that the pages are built with Gutenberg blocks with Advanced Custom Fields behind them, and that enquiry forms run through Ninja Forms. If that's right, it's genuinely good news, and most of the rest of this email follows from it. If the setup is different, tell me and I'll revise accordingly.
>
> **Editability**
>
> On that assumption, the editability problem largely solves itself. I'd build the new design as custom Gutenberg blocks with our own ACF fields behind them, which means your team keeps editing these pages in WordPress exactly as they do now: headlines, copy, images, stats, all editable in the normal interface. No developer request every time a word changes.
>
> **The one genuine technical risk**
>
> It's the theme's existing CSS. From the outside it looks heavy, and it will fight the new design at every turn if these pages load it. The clean way round this is to give the new pages their own dedicated page template that loads only the new styling rather than inheriting the whole theme stylesheet. That's a contained change, it only affects these pages, and nothing else on the site is touched. **The main thing I need to know is whether I'm permitted to do that**, because if these pages have to sit inside the standard template and inherit the theme's styling, the finished result will drift a fair way from the mockups and the second option below becomes the better answer.
>
> **The other decision: the header and footer**
>
> The brief is that nothing else on the site changes, which I completely understand. Worth being clear on the consequence: the new pages would sit inside the existing header and footer, and those are styled to the current site rather than the new design. It's perfectly workable, but there'll be a visible change in style where the page begins and ends. The alternatives are a page-specific header and footer used only on these pages, or accepting the join. Happy either way, I just don't want it to be a surprise at review.
>
> **Two routes**
>
> **Option 1: Build into the existing site as new page templates**
>
> New custom blocks and ACF fields, a dedicated template for the production lead pages, everything else on the site untouched.
>
> - *Good:* one site, one login, your team edits as normal, existing search rankings and URLs benefit, nothing else changes, no extra hosting or maintenance.
> - *Not so good:* the design has to work within the constraints of the existing header, footer and site structure, so expect it to be close to the mockups rather than identical. There's a dependency on the current theme and plugins: future updates could affect the new pages, so they'll want checking after major updates. And I'd need enough access to add a template and custom blocks, which depends on who controls the site.
>
> **Option 2: A production microsite on its own subdomain**
>
> Something like `production.encore-emea.com`, built in WordPress with the same ACF and Gutenberg approach so your team still edits it normally, but with its own clean theme and no inherited styling to fight.
>
> - *Good:* the design lands exactly as designed, including the navigation and footer. It's completely isolated, so there's zero risk to the main site. It gives Production its own front door, which is worth considering if you want to present it as a distinct proposition rather than a section of the main site. Still fully editable by your team.
> - *Not so good:* it's a second WordPress install to host, update and keep secure, so there's an ongoing overhead. Search authority is split across two domains rather than concentrated on one, and we'd want to plan for that. Your IT team would need to set up the subdomain. Analytics, cookie consent and forms all need setting up again on the new install, and the navigation between the two sites needs thinking about so it doesn't feel like visitors have left your site.
>
> **My recommendation**
>
> Given these are lead-generation pages and nothing else on the site is changing, **Option 1 is the sensible route**, provided I'm allowed a dedicated page template that isn't loading the full theme stylesheet. It keeps everything in one place, keeps your team in control of the content, and keeps the SEO value on the main domain.
>
> I'd point you at Option 2 if either of two things is true: the site is locked down and I can't add templates or custom blocks, or you actually want Production presented as its own destination with its own identity. That second one is a positioning question for you rather than a technical one, and it's a reasonable thing to want.
>
> **What I need to get moving**
>
> Worth saying upfront: if we go with Option 1, I can't work on the live site directly. I'd need a working copy running on my own machine so I can build and test safely, and that copy has to be a genuine clone rather than a content export. So the first few questions matter more than they look.
>
> *Environment and access*
> 1. Does your hosting offer one-click staging? If so, a staging clone plus a WordPress admin login is the quickest possible start, and it's the safest place for me to build.
> 2. If there's no staging available, I'd need a full backup so I can run a copy locally: a database dump plus the `wp-content` folder, or a single package from All-in-One WP Migration, Duplicator or UpdraftPlus, whichever your host or developer prefers. (The standard WordPress export under Tools → Export isn't enough on its own, it contains the content but not the theme, plugins, images or settings.)
> 3. Who hosts the site, and what's the environment: PHP version, and how do changes get from staging to live?
> 4. Is there an agency or internal developer who owns the site, and should I be coordinating with them?
>
> *Permissions and setup*
> 5. Confirmation that I can add a custom page template and custom blocks, and load the new styling only on these pages rather than inheriting the full theme stylesheet.
> 6. Is the theme custom or off-the-shelf, and is there a child theme?
> 7. Full plugin list, and current WordPress version, so I can confirm the assumptions at the top of this email.
> 8. Do your licences for the premium plugins (ACF Pro, and any form plugin add-ons) allow a development or staging instance? Some deactivate features without an active licence, so it's better to know now than halfway through.
>
> *Content, tracking and compliance*
> 9. Forms: where do the enquiries currently go, and does anything need to reach a CRM?
> 10. Analytics, tracking and cookie consent requirements for the new pages.
> 11. URLs for the new pages, and whether any existing pages are being replaced, so we handle redirects properly and don't lose search rankings.
> 12. Master video and photography, and confirmation of usage rights.
> 13. Accessibility standard you need to meet, and which browsers and devices to support.
> 14. Your target date for these being live.
>
> On the backup, if that's the route: it'll contain user accounts and previous form submissions, so it's personal data. Happy to take it over whatever secure transfer you prefer rather than email, and I'll delete it once the project's finished.
>
> Realistically I can answer most of the remaining technical unknowns within a day of getting a working copy, and give you a firm scope off the back of that. Worth flagging that Option 2 skips almost all of this setup, so if getting hold of a staging environment or the plugin licences looks like it'll be slow, that's a point in the microsite's favour on timing alone.
>
> Happy to jump on a call with whoever looks after the site technically. That would probably clear half of the above in twenty minutes.
>
> Best,
> Jake

---

## Still to fill in

- Recipient name
- Target live date (ours or theirs)
