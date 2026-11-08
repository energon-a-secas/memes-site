# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make setup       # npm install + deploy Convex functions (first-time setup)
make dev         # Run Convex dev watcher (deploys functions + watches for changes)
make serve       # Serve frontend on http://localhost:8777
make deploy      # Deploy Convex functions to production (no watcher)
make login       # Authenticate with Convex CLI
make catalogue   # Rewrite js/data.js from references-api's catalogue
make test        # npm test
```

Both `make dev` (terminal 1) and `make serve` (terminal 2) must run simultaneously for local development. The frontend loads Convex via ESM CDN (`https://esm.sh/convex@1.21.0/browser`). No build step needed on the frontend side.

## Architecture

**Dual meme source:** The collection merges bundled memes from `js/data.js` (static files in `assets/images/`, listed in references-api's catalogue) with dynamically uploaded memes from Convex storage. `getAllMemes()` in `state.js` concatenates both. Hardcoded memes are never voteable by `_id`, vote keys use `meme.name` (a slug string) for both static and Convex memes.

**Startup sequence:** `app.js` renders immediately from hardcoded data, then independently loads community memes, organization metadata, votes and categories. `client.js` dynamically imports the optional SDK, so even a stalled SDK cannot block the bundled collection. Public reads time out after 12 seconds; partial failures expose a retry and keep the last successful result. Authentication initializes separately.

**Convex client without build step:** `client.js` lazily creates `ConvexHttpClient` from the ESM CDN; `state.js` re-exports its facade. The facade retains account tokens that arrive before the SDK and forwards writes through the same API. All API calls use string-based function names via `export const api = { memes: { list: "memes:list", ... }, ... }`. No generated client types needed.

**Vote dedup:** Votes are tied to a `visitorId` (UUID stored in `localStorage` under `meme-vault-visitor`), not to user accounts. Logged-in users and anonymous visitors all vote by `visitorId`. The `votes` table has `by_visitor_meme` index for fast per-visitor lookups.

**Auth model:** Clerk, through the Neorgon Auth Kit: `js/neorgon-auth.js`, `js/neorgon-auth-sites.js` and `css/neorgon-auth.css` are vendored from `packages/neorgon-ui/auth/` by `sync-auth.sh`, so never edit them here. One Neorgon account works on every Neorgon site. The kit owns the header slot, the sign-in dialog and the Convex token; `events.js` only listens with `NeoAuth.onChange` and gates the upload with `NeoAuth.requireSignIn`. Admin is decided server-side: `auth:isAdmin` checks the Clerk subject against the `ADMIN_SUBJECTS` Convex env var, and admins see a delete button on Convex-uploaded memes (not on hardcoded ones). `convex/migration.ts` (legacy password linking) is still deployed but has had no UI since 2026-09-10, when nobody had ever linked an account. Sign-in cannot be exercised on localhost: the production key refuses it, and the dialog says so.

**Upload flow:** `events.js` calls `memes:getUploadUrl` to get a Convex storage upload URL, POSTs the file directly to it, then calls `memes:saveMeme` with the returned `storageId`. Uploaded memes have `isNew: true` and require `crossOrigin = 'anonymous'` on `<img>` elements (needed for canvas `drawImage` when copying to clipboard).

**Meme of the Day:** Deterministic daily pick from hardcoded memes only, using a date-seeded hash. Not affected by Convex data.

## Key State

`state` object (in `state.js`):
- `convexMemes`: raw results from `memes:list`, includes resolved storage URLs
- `myUploads`: `_id`s that `memes:list` marked `mine`; cleared when the account changes
- `voteCounts`: `{ [memeKey: string]: number }` net score (upvotes − downvotes)
- `myVotes` / `myDownvotes`: Sets of meme name slugs voted by this visitor
- `activeCategory`, `sortBy`: filter/sort state driving `filterGrid()`

## Convex Schema Notes

- `memes.uploadedBy` stores the username always; `displayAnonymous` controls whether the public UI shows the real name or "Anon"
- `votes.direction` is `+1` or `-1`; legacy rows without `direction` default to `+1` via `?? 1`
- `votes.memeKey` is the meme's `name` slug, not a Convex `_id`
- `memes:list` answers every visitor, so `publicMeme()` names each field it sends (`_id`, `_creationTime`, `name`, `category`, `labels`, `ext`, `url`, `displayName`, `mine`) instead of spreading the row. `uploadedBy`, `ownerSubject` and `storageId` stay on the server: any of them would link anonymous uploads to their uploader and to each other. `tests/backend.test.mjs` fails if one reaches the reply.
- `mine` is true only on the caller's own uploads, worked out from their token. `canOrganize()` reads it through `state.myUploads`, and `initMemesAuth()` fetches the list again whenever the account changes (the Auth Kit sets the token before it notifies), because a list fetched signed out marks nothing.

## Adding bundled memes

`js/data.js` is generated; never edit it. The bundled memes are the `origin: "vault"`
entries of the community catalogue, `projects/references-api/api/v2/catalogue.json`,
the one list of every reference and meme (see that repo's CLAUDE.md).

1. Put the image in `assets/images/<category>/`.
2. Add a catalogue entry: `id` is the meme's name here (votes are keyed by it, so
   never rename one), `kind: "meme"`, `category`, one primary `media` item whose
   `url` is `https://memes.neorgon.com/` plus the encoded asset path,
   `origin: "vault"`, `tags: []`, `added`. Run `make catalogue` in references-api.
3. Run `make catalogue` here (`scripts/sync-catalogue.mjs`), then `npm test`:
   `tests/catalogue.test.mjs` fails on an image the catalogue does not list, a
   listed file that is missing, and a `data.js` that lags the catalogue.

`id` follows catalogue order and `CATEGORIES` is every vault category, sorted.
`convex/memes.ts` and `convex/categories.ts` import `MEMES` to check bundled names,
so a new bundled meme can only be organized once `make deploy` has run.

## Browsing and shared shell

`url-sync.js` owns `q`, `cat`, repeated `label` values and `sort`. Custom category
and label filters survive before remote metadata arrives. Search replaces the
current history entry; category/label/sort changes push entries; Back/Forward
restores both controls and results. Theme parameters, attribution and fragments
stay intact. Share view copies this URL.

`js/neorgon-navigation.js` is vendored from `packages/neorgon-ui/navigation/`;
change canonical and run `bash packages/neorgon-ui/sync-navigation.sh`. Background
rendering and resource callbacks never write navigation history.

The viewer is a native dialog. A category/label picker opens above it and handles
its own Escape; closing the picker keeps the viewer draft. The Footer Kit owns
back-to-top, with no second site-specific floating control.

Run `npm test` for taxonomy, backend and URL rules, and `npm run test:ui` for
fixture-backed uploads, editing, failed saves and dialog focus. The workspace
`node scripts/check-collection-pilots.cjs` also checks delayed SDK/auth, shareable
filters, partial failures and the shared header/footer contract.
