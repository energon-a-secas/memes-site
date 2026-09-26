// ── Entry point ──────────────────────────────────────────────────────

import { rebuildChips, filterGrid, renderMemeOfTheDay } from './render.js';
import { loadRemoteData, initMemesAuth } from './events.js';
import { restoreBrowseState, navigation } from './url-sync.js';

restoreBrowseState();
navigation.replace();
rebuildChips();
filterGrid();
renderMemeOfTheDay();

void loadRemoteData();

void initMemesAuth().catch(() => {});
