---
version: alpha
name: RefLinkGen — Vercel-Inspired
description: |+
  A developer-platform referral engine whose surface is a stark black-and-ink duet
  on near-white canvas, with a single signature accent — Vercel blue (#0070f3) —
  reserved for links, primary CTAs, and the wordmark. Typography uses the Geist
  family (Geist Sans for display/body, Geist Mono for code) at weights 400–600,
  marking a deliberate departure from the thin-weight editorial feel toward a bolder,
  more confident developer voice. Section rhythm is generous (96px), cards are
  white-on-white with hairline borders and zero shadows, and the hero features a
  multi-color mesh gradient (cyan / blue / magenta / amber) as the only decorative
  element — no illustrations, no mascots, no chrome. The brand reads as modern,
  lightweight infrastructure for developers who ship.

colors:
  primary: "#171717"
  on-primary: "#ffffff"
  ink: "#171717"
  ink-secondary: "#4d4d4d"
  ink-mute: "#888888"
  ink-mute-2: "#a1a1a1"
  ink-faint: "#c7c7c7"
  canvas: "#ffffff"
  canvas-soft: "#fafafa"
  canvas-soft-2: "#f5f5f5"
  surface-card: "#ffffff"
  hairline: "#ebebeb"
  hairline-strong: "#a1a1a1"
  link: "#0070f3"
  link-hover: "#0761d1"
  link-bg-soft: "#d3e5ff"
  success: "#0070f3"
  error: "#ee0000"
  error-soft: "#f7d4d6"
  warning: "#f5a623"
  warning-soft: "#ffefcf"
  violet: "#7928ca"
  violet-soft: "#d8ccf1"
  cyan: "#50e3c2"
  cyan-soft: "#aaffec"
  highlight-pink: "#ff0080"
  highlight-magenta: "#eb367f"
  gradient-develop-start: "#007cf0"
  gradient-develop-end: "#00dfd8"
  gradient-preview-start: "#7928ca"
  gradient-preview-end: "#ff0080"
  gradient-ship-start: "#ff4d4d"
  gradient-ship-end: "#f9cb28"
  selection-bg: "#171717"
  selection-fg: "#f2f2f2"

typography:
  display-xl:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -2.8px
  display-lg:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -1.44px
  display-md:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -1.12px
  display-sm:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.66px
  heading-lg:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -0.4px
  heading-md:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: -0.18px
  body-lg:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-md-strong:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
  body-sm:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.28px
  caption:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
  caption-mono:
    fontFamily: Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.8
  code-inline:
    fontFamily: Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.3
    backgroundColor: "{colors.canvas-soft-2}"
    padding: "2px 6px"
    rounded: 4px
  button-md:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.3
  button-lg:
    fontFamily: Geist, Inter, system-ui, -apple-system, sans-serif
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.3

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  pill: 100px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 40px
  3xl: 48px
  4xl: 64px
  5xl: 80px
  6xl: 96px
  section: 128px
  section-compact: 80px

shadows:
  none: "none"
  card-hover: "0px 12px 24px rgba(0,0,0,0.08)"
  code-block: "0px 12px 24px rgba(0,0,0,0.12)"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.sm}"
    padding: "12px 28px"
  button-ghost:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
    borderColor: "{colors.hairline}"
  button-ghost-hover:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
    borderColor: "{colors.ink-mute}"
  button-on-dark:
    backgroundColor: "{colors.on-primary}"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
  nav-bar:
    backgroundColor: "rgba(255,255,255,0.90)"
    textColor: "{colors.ink}"
    backdropFilter: "blur(12px)"
    height: 64px
    borderBottom: "1px solid {colors.hairline}"
  nav-link:
    textColor: "{colors.ink-mute}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.sm}"
  nav-link-active:
    textColor: "{colors.ink}"
    typography: "{typography.body-md-strong}"
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline}"
  card-hover:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline}"
    shadow: "{shadows.card-hover}"
  code-block:
    backgroundColor: "{colors.canvas-soft-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.hairline}"
  badge:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink-mute}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
    border: "1px solid {colors.hairline}"
  hero-gradient:
    background: "linear-gradient(135deg, {colors.gradient-develop-start}, {colors.gradient-develop-end}, {colors.gradient-preview-start}, {colors.gradient-preview-end})"
    height: "600px"
    rounded: "{rounded.lg}"
---

## Overview

**RefLinkGen — Vercel-Inspired** positions Referral Link Generator as a
developer-platform tool in the Vercel/Next.js ecosystem. The design is bold,
confident, and infrastructure-forward: a near-black ink on white canvas with
Geist typography at weight 500–600, no thin weights, no decorative chrome.
The only visual flourish is a hero mesh gradient spanning cyan→blue→magenta→amber
— Vercel's signature decorative element — used as the hero background for the
embed code section.

This direction targets technical founders who ship on Vercel, use Next.js, and
want their referral tool to feel like infrastructure rather than a SaaS dashboard.

## Colors

- **Primary (#171717):** Near-black. Used for primary CTAs, nav text, headings.
  The brand has NO colored primary — black IS the primary.
- **Link (#0070f3):** Vercel blue. The only chromatic accent. Reserved for text
  links and the hero gradient. Never used as a button background.
- **Canvas (#ffffff):** Clean white. The page is white, always.
- **Canvas-soft (#fafafa):** Off-white for subtle section alternation.
- **Hairline (#ebebeb):** Very light borders. Cards barely have edges.

### Usage rules

- Black (#171717) is the primary CTA. Not purple, not blue, not green.
- Blue (#0070f3) appears ONLY as text links and in the hero gradient.
- The hero gradient is the ONLY decorative element on the page.
- Success/warning/error use a softer palette than the Stripe option.

## Typography

Geist (Vercel's custom sans) at weights 400–600 across all surfaces. No 300-weight
anywhere — the voice is confident, not editorial. Geist Mono for every code surface.

### Hierarchy

| Token | Size | Weight | Where |
|-------|------|--------|-------|
| display-xl | 56px | 600 | Hero headline |
| display-lg | 36px | 600 | Section headings |
| display-md | 28px | 600 | Pricing/card headings |
| body-lg | 18px | 400 | Feature descriptions |
| body-md | 16px | 400 | Body copy |
| code | 14px/1.8lh | 400 | Embed snippets |

## Layout & Spacing

- **Container:** 1080px max, centered.
- **Section rhythm:** 128px between major sections (hero, features, comparison, CTA).
  Compact variant at 80px for legal pages.
- **Cards:** 12px radius, white, hairline border, NO shadow resting state.
  Hover adds a subtle 0px 12px 24px shadow.
- **No card shadow at rest** — Vercel doesn't do resting shadows.
- **Hero:** Full-width, top section with the gradient mesh as the hero background.
  Code block sits inside the gradient area.
- **Nav:** Sticky 64px, white-90% blur backdrop, hairline bottom.

## Elevation & Depth

- **No resting elevation.** Cards sit flat with hairline borders.
- **Card hover:** The only elevation event on the page.
- **Code block:** Flat, no shadow. The code IS the content.
- **Gradient mesh:** The hero gradient provides all the depth the page needs.
  It sits behind the hero text and code block.

## Shapes

- **Button corners:** 6px (rounded.sm). Not pills. Vercel uses tight corners.
- **Card corners:** 12px (rounded.lg). Generous but not round.
- **Code blocks:** 8px.
- **Badges:** Full pill (9999px).
- **Nav links:** Full pill when hovered.
- **"Get started" button:** 6px square corner.

## Components

### button-primary
Black fill, white text, 6px corners, 8px 20px padding. The only emphasis action.
Weight 500, 14px. "Get started" and main CTA use this exclusively.

### button-ghost
White fill, black text, 1px hairline border, 6px corners. "Pricing" and "View
on GitHub" use this. Hover darkens the border.

### card
White fill, 12px radius, 1px hairline border. No shadow. Padding 32px.
On hover: 0px 12px 24px rgba(0,0,0,0.08) shadow.

### code-block
Light gray background (#f5f5f5), black text, 8px radius. The embed snippet
lives here. For dark contrast (hero), use the gradient as the code block
backdrop instead.

### hero-gradient
The signature Vercel visual: a full-width multi-color mesh gradient
(develop-start → develop-end → preview-start → preview-end). Use the
`linear-gradient` defined in tokens. The gradient covers the hero background;
headline, description, and CTA sit on top. The embed code block sits inside
a card with translucent white-10% background on top of the gradient.

## Do's and Don'ts

- **Do** use display-xl (56px, 600 weight) for the hero. Bold, not thin.
- **Do** use the gradient mesh in the hero — it's the brand signature.
- **Do** use Geist Mono for ALL code. Inline code too.
- **Do** keep cards flat. No shadows until hover.
- **Do** use 6px button corners. Not pills.
- **Don't** use a purple or colored primary button. Black is the primary.
- **Don't** use illustrations, mascots, or icons beyond the feature grid.
- **Don't** add shadows to the navigation. Hairline border is enough.
- **Don't** use weight 300 anywhere. The brand voice is confident, not editorial.
- **Don't** use thin letter-spacing on body text. Only display sizes get negative tracking.
