# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make setup       # npm install + deploy Convex functions (first-time setup)
make dev         # Run Convex dev watcher (deploys functions + watches for changes)
make serve       # Serve frontend on http://localhost:8777
make deploy      # Deploy Convex functions to production (no watcher)
make login       # Authenticate with Convex CLI
```

Both `make dev` (terminal 1) and `make serve` (terminal 2) must run simultaneously for local development. The frontend loads Convex via ESM CDN (`https://esm.sh/convex@1.21.0/browser`) — no build step needed on the frontend side.

## Architecture

**Dual meme source:** The collection merges 67 hardcoded memes from `js/data.js` (static files in `assets/images/`) with dynamically uploaded memes from Convex storage. `getAllMemes()` in `state.js` concatenates both. Hardcoded memes are never voteable by `_id` — vote keys use `meme.name` (a slug string) for both static and Convex memes.

**Startup sequence:** `app.js` renders immediately from hardcoded data, then fires two async Convex fetches (`loadConvexMemes`, `loadVotes`) that re-render when they resolve. This means the UI is usable without Convex being available.

**Convex client without build step:** `state.js` imports `ConvexHttpClient` from the ESM CDN and stores it as `export const convex`. All API calls use string-based function names via `export const api = { memes: { list: "memes:list", ... }, ... }` — no generated client types needed.

**Vote dedup:** Votes are tied to a `visitorId` (UUID stored in `localStorage` under `meme-vault-visitor`), not to user accounts. Logged-in users and anonymous visitors all vote by `visitorId`. The `votes` table has `by_visitor_meme` index for fast per-visitor lookups.

**Auth model:** Simple username/password with a non-cryptographic hash (`simpleHash` in `auth.ts`). Intentionally lightweight for a fun internal site. The first registered user automatically becomes admin. Role is stored in `localStorage` under `meme-vault-role` and re-verified from Convex on login. Admin users see a delete button on Convex-uploaded memes (not on hardcoded ones).

**Upload flow:** `events.js` calls `memes:getUploadUrl` to get a Convex storage upload URL, POSTs the file directly to it, then calls `memes:saveMeme` with the returned `storageId`. Uploaded memes have `isNew: true` and require `crossOrigin = 'anonymous'` on `<img>` elements (needed for canvas `drawImage` when copying to clipboard).

**Meme of the Day:** Deterministic daily pick from hardcoded memes only, using a date-seeded hash. Not affected by Convex data.

## Key State

`state` object (in `state.js`):
- `convexMemes` — raw results from `memes:list`, includes resolved storage URLs
- `voteCounts` — `{ [memeKey: string]: number }` net score (upvotes − downvotes)
- `myVotes` / `myDownvotes` — Sets of meme name slugs voted by this visitor
- `activeCategory`, `sortBy` — filter/sort state driving `filterGrid()`

## Convex Schema Notes

- `memes.uploadedBy` stores the username always; `displayAnonymous` controls whether the public UI shows the real name or "Anon"
- `votes.direction` is `+1` or `-1`; legacy rows without `direction` default to `+1` via `?? 1`
- `votes.memeKey` is the meme's `name` slug, not a Convex `_id`

## Adding Hardcoded Memes

Add an entry to the appropriate category array in `js/data.js` and place the image in `assets/images/<category>/`. The `id` must be sequentially unique across all entries. Categories are listed in `export const CATEGORIES` at the bottom of `data.js`.
