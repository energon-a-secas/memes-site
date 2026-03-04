// ── Entry point ──────────────────────────────────────────────────────
// Imports all modules to wire up the application.
// No logic beyond initialisation lives here.

import { rebuildChips, filterGrid, renderRecentlyAdded } from './render.js';
import { loadConvexMemes, loadVotes } from './events.js';

// events.js self-registers all DOM listeners on import.

// Load Convex data first (skip per-call renders), then do a single render.
async function init() {
  await Promise.allSettled([
    loadConvexMemes({ render: false }),
    loadVotes({ render: false }),
  ]);
  rebuildChips();
  filterGrid();
  renderRecentlyAdded();
}

init();
