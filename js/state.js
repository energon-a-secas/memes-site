// ── Shared mutable state + Convex client ─────────────────────────────
import { ConvexHttpClient } from "https://esm.sh/convex@1.21.0/browser";
import { MEMES, CATEGORIES } from './data.js';

// ── Convex client ────────────────────────────────────────────────────
const CONVEX_URL = "https://basic-ant-744.convex.cloud";
export const convex = new ConvexHttpClient(CONVEX_URL);

// Function references (strings at runtime — no build step needed)
export const api = {
  memes: { list: "memes:list", getUploadUrl: "memes:getUploadUrl", saveMeme: "memes:saveMeme", deleteMeme: "memes:deleteMeme" },
  auth:  { register: "auth:register", login: "auth:login", getRole: "auth:getRole", setRole: "auth:setRole" },
  votes: { getVotes: "votes:getVotes", toggleVote: "votes:toggleVote" },
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

// ── Auth state (persisted in localStorage) ───────────────────────────
export function getLoggedInUser() {
  return localStorage.getItem('meme-vault-user') || null;
}
export function setLoggedInUser(username) {
  if (username) localStorage.setItem('meme-vault-user', username);
  else localStorage.removeItem('meme-vault-user');
}
export function getUserRole() {
  return localStorage.getItem('meme-vault-role') || 'user';
}
export function setUserRole(role) {
  if (role && role !== 'user') localStorage.setItem('meme-vault-role', role);
  else localStorage.removeItem('meme-vault-role');
}

// ── Mutable application state ────────────────────────────────────────
export const state = {
  activeCategory: 'all',
  sortBy: 'recent',           // 'recent' | 'default' | 'votes'
  convexMemes: [],
  selectedFile: null,
  voteCounts: {},              // { memeKey: number }  (upvotes - downvotes)
  myVotes: new Set(),          // set of memeKey strings I upvoted
  myDownvotes: new Set(),      // set of memeKey strings I downvoted
};

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
