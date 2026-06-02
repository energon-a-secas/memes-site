---
name: Meme Vault
description: Neorgon dark tool shell with a rose/pink vote accent, a strict Content-Security-Policy, a nav+auth (Pattern C) header, and a masonry-ish meme grid with vote-burst micro-animations. All base suite tokens, plus a domain accent, a mono UI font, and Convex + Clerk backends.
colors:
  bg: "#040714"
  surface-1: "rgba(255,255,255,0.03)"
  surface-2: "rgba(255,255,255,0.06)"
  border-subtle: "rgba(255,255,255,0.07)"
  border: "rgba(255,255,255,0.1)"
  border-strong: "rgba(255,255,255,0.22)"
  text-primary: "#f9f9f9"
  text-secondary: "#cacaca"
  text-muted: "rgba(255,255,255,0.55)"
  accent: "#0063e5"
  accent-bright: "#0080ff"
  accent-dim: "rgba(0,99,229,0.12)"
  vote-positive: "#f472b6"
  vote-negative: "#f87171"
typography:
  display:
    fontFamily: "'Avenir Next', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.02em"
  body:
    fontFamily: "'Avenir Next', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  mono:
    fontFamily: "'SF Mono', 'Fira Code', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "10px"
  lg: "15px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s6: "24px"
  s8: "32px"
components:
  meme-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
  vote-btn:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "rgba(255,255,255,0.92)"
    rounded: "{rounded.sm}"
---

# Design System: Meme Vault

## Overview

**This is the Neorgon suite shell with four deliberate deviations.** Read the root [DESIGN.md](../DESIGN.md) first; everything there holds unless noted. The deviations: a **rose/pink vote accent**, a **strict CSP** in the document head, a **nav+auth (Pattern C) header**, and a **meme grid with vote-burst micro-animations**. Backed by Convex (memes/votes/users) with Clerk auth.

Base tokens match the suite exactly (`#040714` void, glass surfaces, `#0063e5` action blue, Avenir Next, 68px gradient header).

## Deviations from the suite baseline

### 1. Vote accent (rose/pink)

Votes introduce one domain accent pair beyond suite blue: `.vote-score.positive #f472b6` (pink) and `.vote-score.negative #f87171` (red). Downvote hover/voted states use the red. Blue `#0063e5` still owns primary buttons and links; the rose/pink is scoped to the voting affordance only. Sanctioned use of the One-Accent allowance.

### 2. Strict Content-Security-Policy

Unlike the template (no CSP), the document head carries a hardened `<meta http-equiv="Content-Security-Policy">` plus `<meta http-equiv="X-Frame-Options" content="DENY">` and `frame-ancestors 'none'`. Allowlisted origins: Convex (`*.convex.cloud`), Clerk (`*.clerk.accounts.dev`, `api.clerk.com`, `img.clerk.com`, `clerk-telemetry.com`), Cloudflare Turnstile (`challenges.cloudflare.com`), the R2 asset bucket, and `esm.sh` for the lazy Convex client. Any new external origin (script, image, connect) must be added here or it is blocked. This is required because the site loads third-party auth and a serverless DB.

### 3. Header Pattern C (nav + auth)

Header carries a `<nav>` with `.nav-link--random` (random meme) and `.nav-link--upload` (toggles `.upload-panel`), then `.auth-toggle`, then `.header-home`. Layout: `margin-left:auto` on `<nav>`, `.header-home` gets `margin-left:5px`. Auth uses the Clerk modal pattern (shared with character-sheet), not the inline sheet.

### 4. Meme grid + vote burst

The core surface is `.meme-grid`: `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`, cards with `aspect-ratio: 4/3` images, a staggered `.loaded` entrance, and `.vote-btn.burst` firing a `voteBurst` keyframe (`0.45s var(--ease-snap)`) on vote. An `.uploader-badge` attributes named uploads. `--font-mono` ('SF Mono'/'Fira Code') is defined for incidental monospace UI only, not headings (the One-Stack Rule still governs display/body type).

## Backend note

Convex serverless (`convex/`: `users`, `memes`, `votes`, `schema.ts`) with the HTTP client lazy-loaded from `esm.sh` only when needed. Clerk handles auth identity. Uploads store to Convex storage with category + optional anonymous flag.

## Do's and Don'ts

### Do

- **Do** keep base suite chrome untouched; layer the vote accent and grid on top.
- **Do** add any new external origin to the CSP allowlist (and to `neorgon-site/CLAUDE.md`'s analytics note pattern if analytics are added).
- **Do** keep browse/search/download working without auth.

### Don't

- **Don't** weaken the CSP to `unsafe-eval` or wildcard `*`; allowlist specific origins.
- **Don't** promote the rose vote color to primary buttons; blue stays the action color.
- **Don't** use the mono font for headings or body copy; it is incidental-UI only.
- Everything in the root DESIGN.md "Don't" list still applies.
