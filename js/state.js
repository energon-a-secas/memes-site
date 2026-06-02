// ── Shared mutable state + Convex client ─────────────────────────────
import { ConvexHttpClient } from "https://esm.sh/convex@1.21.0/browser";
import { MEMES, CATEGORIES } from './data.js';

// ── Convex client ────────────────────────────────────────────────────
const CONVEX_URL = "https://polite-jellyfish-291.convex.cloud";
export const convex = new ConvexHttpClient(CONVEX_URL);

// Function references (strings at runtime — no build step needed)
export const api = {
  memes: { list: "memes:list", getUploadUrl: "memes:getUploadUrl", saveMeme: "memes:saveMeme", deleteMeme: "memes:deleteMeme" },
  auth: { isAdmin: "auth:isAdmin" },
  votes: { getVotes: "votes:getVotes", toggleVote: "votes:toggleVote" },
  migration: {
    myAccountLink: "migration:myAccountLink",
    linkLegacyAccount: "migration:linkLegacyAccount",
    getUserSetting: "migration:getUserSetting",
    setUserSetting: "migration:setUserSetting",
    listUserSettings: "migration:listUserSettings",
  },
};

// ── Visitor ID (persistent, used for vote dedup) ─────────────────────
function getVisitorId() {
  let id = localStorage.getItem('meme-vault-visitor');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('meme-vault-visitor', id);
  }
  return id;
}
export const visitorId = getVisitorId();

// ── Mutable application state ────────────────────────────────────────
export const state = {
  activeCategory: 'all',
  sortBy: 'recent',           // 'recent' | 'default' | 'votes'
  convexMemes: [],
  selectedFile: null,
  voteCounts: {},              // { memeKey: number }  (upvotes - downvotes)
  myVotes: new Set(),          // set of memeKey strings I upvoted
  myDownvotes: new Set(),      // set of memeKey strings I downvoted
  authLabel: null,
  isConvexAdmin: false,
};

export function setAuthSession(label, isAdmin) {
  state.authLabel = label || null;
  state.isConvexAdmin = !!isAdmin;
}

export function getLoggedInUser() {
  return state.authLabel;
}

/** @deprecated */
export function setLoggedInUser() {}
export function getUserRole() {
  return state.isConvexAdmin ? 'admin' : 'user';
}
export function setUserRole() {}

// ── Derived data ─────────────────────────────────────────────────────

/** Merge hardcoded MEMES with dynamically loaded Convex memes. */
export function getAllMemes() {
  const mapped = state.convexMemes.map((m, i) => ({
    _id: m._id,
    name: m.name,
    category: m.category,
    path: m.url,
    ext: m.ext,
    id: MEMES.length + i + 1,
    isNew: true,
    displayName: m.displayName || 'Anon',
    _creationTime: m._creationTime,
  }));
  return [...MEMES, ...mapped];
}
