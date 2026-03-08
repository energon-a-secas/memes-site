// ── Entry point ──────────────────────────────────────────────────────
// Imports all modules to wire up the application.
// No logic beyond initialisation lives here.

import { rebuildChips, filterGrid, renderRecentlyAdded, renderMemeOfTheDay } from './render.js';
import { loadConvexMemes, loadVotes } from './events.js';

// events.js self-registers all DOM listeners on import.

// Render immediately with hardcoded memes, then enrich with Convex data.
rebuildChips();
filterGrid();
renderMemeOfTheDay();

// Load Convex data in the background — re-renders when ready.
loadConvexMemes();
loadVotes();
