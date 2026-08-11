# American Foundations & Crawlspaces

Marketing site for American Foundations & Crawlspaces — foundation repair,
crawlspace and concrete services in Pensacola and the western Florida Panhandle.

Static HTML, CSS and vanilla JavaScript. **No build step, no dependencies, no
npm install.** Open `index.html` in a browser, or drop the whole folder on any
host (Netlify, Cloudflare Pages, S3, cPanel, GitHub Pages — all fine as-is).

To preview locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## ⚠️ Before you launch

The site is complete and ready to deploy, but a few values are **placeholders**
that must be replaced with real business information first. Every one of them is
also marked with an HTML comment at each occurrence.

| What | Placeholder currently in the files | Where |
|---|---|---|
| **Phone number** | `(850) 555-0123` and `tel:+18505550123` | Every page: top bar, hero buttons, CTA bands, footer, mobile call bar, JSON-LD |
| **Email address** | `info@americanfoundationsandcrawlspaces.com` | Footer on every page, contact page, JSON-LD |
| **Office hours** | Mon–Fri 8:00am–5:00pm, Sat/Sun closed | `contact.html` |
| **Form handler** | `<form>` has no `action` | `contact.html` |
| **Domain** | `www.americanfoundationsandcrawlspaces.com` | `<link rel="canonical">`, `og:url`, `sitemap.xml`, `robots.txt`, JSON-LD |

`(850) 555-0123` is deliberately in the 555-01XX range reserved for fictional
use, so it cannot ring a real person by accident. Replace it everywhere:

```bash
# from the repo root — check first, then run
grep -rn "5550123\|555-0123" --include="*.html" .

grep -rl "5550123\|555-0123" --include="*.html" . \
  | xargs sed -i 's/(850) 555-0123/(850) XXX-XXXX/g; s/+18505550123/+1850XXXXXXX/g; s/+1-850-555-0123/+1-850-XXX-XXXX/g'
```

### Connecting the contact form

`contact.html` has a fully built, validated form with no `action` attribute. As
shipped, `assets/js/main.js` validates the fields and then tells the visitor to
call instead — so no enquiry is ever silently lost. To go live, point it at a
handler:

```html
<form class="form" data-estimate-form novalidate
      action="https://formspree.io/f/YOURID" method="POST">
```

Anything that accepts a normal POST works: Formspree, Netlify Forms
(`data-netlify="true"`), Basin, your CRM's endpoint, or a PHP script. Once
`action` is set, the JS stops intercepting and lets the browser submit normally.

### Content still to supply

These were intentionally left out rather than invented, because they are claims
only the business can make truthfully:

- **License numbers** (FL CGC/CBC, plus any others) — add to the footer
- **Insurance and bonding statements**
- **Warranty terms** — the copy references a written warranty in several places;
  confirm the actual terms and transferability
- **Years in business / homes served** — no numbers are claimed anywhere
- **Customer reviews** — no testimonials are included. Do not add invented ones;
  pull real Google reviews or leave the section out
- **Job photos** — see below

### Adding job photos

`index.html` has three photo slots in the "Recent work" section, styled as
blueprint frames. Drop images into `assets/img/` and replace the placeholder:

```html
<!-- before -->
<figure class="shot marks"><span>Photo slot &mdash; before / after</span></figure>

<!-- after -->
<figure class="shot marks">
  <img src="assets/img/pier-install-pace.jpg" alt="Helical pier bracket installed at a settled footing in Pace, FL">
</figure>
```

The `.shot` container is a fixed 4:3 box and images are `object-fit: cover`, so
any reasonable size works. Write real alt text — it matters for both
accessibility and search.

---

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — services, warning signs, structure types, process, service area, FAQs |
| `foundation-repair.html` | Primary money page: settlement, cracks, bowing walls, repair methods, cost drivers |
| `helical-piers.html` | Pier systems, torque verification, documentation |
| `crawlspace-encapsulation.html` | Vapor barrier, sealed vents, humidity control |
| `crawlspace-drainage.html` | Interior drains, sump systems, grading |
| `crawlspace-stabilization.html` | Adjustable steel floor supports, framing repair |
| `concrete-lifting.html` | Polyurethane injection for driveways, patios, pool decks |
| `service-areas.html` | Escambia, Santa Rosa and Okaloosa county coverage |
| `contact.html` | Free inspection request form |

## Structure

```
├── index.html + 8 other pages
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/
    │   ├── styles.css        # the whole design system, ~1,100 lines, commented by section
    │   └── fonts.css         # @font-face for the self-hosted fonts
    ├── fonts/                # Anton + IBM Plex Sans/Mono, latin subset, ~196 KB total
    ├── img/
    │   ├── logo-mark.svg     # see "Logo" below
    │   └── favicon.svg
    └── js/
        └── main.js           # nav, scroll reveals, accordion, form validation
```

## Design

Brand colors, from the logo:

| | Hex | CSS variable |
|---|---|---|
| Navy | `#1e3052` | `--navy` |
| Red | `#953037` | `--red` |
| Medium gray | `#8b8a8e` | `--gray` |
| White | `#ffffff` | `--white` |

Everything is driven by custom properties at the top of `assets/css/styles.css`
— colors, type scale, spacing, motion. Change a token there and it propagates
site-wide.

The visual language is a **structural section drawing**: grade lines with survey
ticks, hatched soil strata, registration marks on figure corners, and mono
annotation labels. Each service page carries a hand-drawn inline SVG cross
section (helical pier, encapsulated crawlspace, drainage system, support post,
slab lift) rather than stock photography. They are plain SVG in the HTML — edit
them directly, and they scale and print cleanly.

Type: **Anton** for display, **IBM Plex Sans** for body, **IBM Plex Mono** for
labels and technical annotations. All self-hosted under `assets/fonts/` — no
Google Fonts request, so the site has no third-party dependency and nothing to
disclose in a cookie policy. Both families are licensed under the SIL Open Font
License 1.1; the license texts ship alongside the font files in
`assets/fonts/OFL-Anton.txt` and `assets/fonts/OFL-IBM-Plex.txt`, as the license
requires. Only the latin subset is included, which keeps all seven weights to
about 196 KB combined.

### Logo

`assets/img/logo-mark.svg` is a **reconstruction** of the badge from the brand
logo — the circular navy/red rings, the house with the star field and stripes on
the roof, the stem wall and piers below grade. It was rebuilt as vector because
the original artwork was not available in the repo. The wordmark next to it is
live HTML text set in Anton, not part of the SVG, so it stays crisp at any size.

**If you have the original vector artwork, use it instead.** Either overwrite
`assets/img/logo-mark.svg`, or add your file and update the `src` in the header
and footer of each page:

```bash
grep -rn "logo-mark.svg" --include="*.html" .
```

The header lockup expects a roughly square badge. If your file is the full
horizontal lockup including the wordmark, also remove the adjacent
`<span class="brand__text">…</span>` block so the name is not set twice.

## Accessibility & SEO

Built in, not bolted on:

- Skip link, landmark regions, `aria-current` on the active nav item
- `aria-expanded` on the mobile menu button; Escape closes the drawer
- Native `<details>`/`<summary>` for FAQs, so they work without JavaScript
- Every SVG figure has `<title>` and `<desc>`, and decorative icons are `aria-hidden`
- Visible focus rings; full `prefers-reduced-motion` support
- Form labels, `aria-invalid` on failed fields, `aria-live` status messages
- Per-page `<title>`, meta description, canonical URL and Open Graph tags
- JSON-LD: `HomeAndConstructionBusiness` on the home page, `Service` on each
  service page, `FAQPage` wherever there are FAQs
- `robots.txt` and `sitemap.xml`

Every page works with JavaScript disabled — JS only adds the mobile drawer,
scroll reveals, single-open accordion behavior and client-side form validation.

## Browser support

Modern evergreen browsers. Uses CSS custom properties, `clamp()`, grid, flexbox,
`aspect-ratio` and `IntersectionObserver` — all widely supported. There are no
polyfills and no transpilation.
