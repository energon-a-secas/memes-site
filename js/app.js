// ── Entry point ──────────────────────────────────────────────────────

import { rebuildChips, filterGrid, renderRecentlyAdded, renderMemeOfTheDay } from './render.js';
import { loadConvexMemes, loadVotes, initMemesAuth } from './events.js';

await initMemesAuth();

rebuildChips();
filterGrid();
renderMemeOfTheDay();

loadConvexMemes();
loadVotes();
