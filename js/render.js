// ── DOM rendering ────────────────────────────────────────────────────
import { CATEGORIES } from './data.js';
import { state, getAllMemes } from './state.js';
import { formatName, copyMemeImage, downloadMeme } from './utils.js';
import { openLightbox, handleVoteClick } from './events.js';

// ── SVG icon templates ───────────────────────────────────────────────
const COPY_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
const DL_SVG   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const VIEW_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const HEART_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
const HEART_FILLED_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
const THUMBDOWN_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>`;
const THUMBDOWN_FILLED_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>`;

// ── Cached DOM references ────────────────────────────────────────────
const grid        = document.getElementById('memeGrid');
const chipsEl     = document.getElementById('chips');
const resultInfo  = document.getElementById('resultInfo');
const searchInput = document.getElementById('searchInput');
const recentSection = document.getElementById('recentSection');
const recentRow     = document.getElementById('recentRow');

// ── Chip factory ─────────────────────────────────────────────────────
function makeChip(value, label, count) {
  const c = document.createElement('button');
  c.className = 'chip' + (value === state.activeCategory ? ' active' : '');
  c.dataset.value = value;
  c.innerHTML = `${label}<span class="chip-count">${count}</span>`;
  c.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    state.activeCategory = value;
    filterGrid();
  });
  return c;
}

/** Rebuild category chips from current data (hardcoded + Convex). */
export function rebuildChips() {
  chipsEl.innerHTML = '';
  const all = getAllMemes();
  const counts = {};
  all.forEach(m => { counts[m.category] = (counts[m.category] || 0) + 1; });
  const cats = [...new Set([...CATEGORIES, ...state.convexMemes.map(m => m.category)])];
  chipsEl.appendChild(makeChip('all', 'All', all.length));
  cats.forEach(cat => {
    if (counts[cat]) chipsEl.appendChild(makeChip(cat, cat, counts[cat]));
  });
}

// ── Card factory ─────────────────────────────────────────────────────
export function makeCard(m) {
  const card = document.createElement('div');
  card.className = 'meme-card';

  const img = document.createElement('img');
  img.className = 'meme-img';
  img.src = m.path;
  img.alt = formatName(m.name);
  img.loading = 'lazy';
  if (m.isNew) img.crossOrigin = 'anonymous';
  img.addEventListener('load', () => img.classList.add('loaded'), { once: true });

  const meta = document.createElement('div');
  meta.className = 'meme-meta';
  const newBadge = m.isNew ? '<span class="badge-new">new</span>' : '';
  meta.innerHTML = `
    <div class="meme-name" title="${formatName(m.name)}">${formatName(m.name)}</div>
    <div class="meme-badges">
      <span class="badge-ext">${m.ext}</span>
      ${newBadge}
    </div>`;

  // Vote row: upvote | score | downvote
  const voteRow = document.createElement('div');
  voteRow.className = 'vote-row';
  const score = state.voteCounts[m.name] || 0;
  const hasUp = state.myVotes.has(m.name);
  const hasDown = state.myDownvotes.has(m.name);

  const upBtn = document.createElement('button');
  upBtn.className = 'vote-btn' + (hasUp ? ' voted' : '');
  upBtn.innerHTML = hasUp ? HEART_FILLED_SVG : HEART_SVG;
  upBtn.addEventListener('click', (e) => { e.stopPropagation(); handleVoteClick(m.name, 1); });

  const scoreEl = document.createElement('span');
  scoreEl.className = 'vote-score' + (score > 0 ? ' positive' : score < 0 ? ' negative' : '');
  scoreEl.textContent = score !== 0 ? String(score) : '';

  const downBtn = document.createElement('button');
  downBtn.className = 'vote-btn downvote' + (hasDown ? ' voted' : '');
  downBtn.innerHTML = hasDown ? THUMBDOWN_FILLED_SVG : THUMBDOWN_SVG;
  downBtn.addEventListener('click', (e) => { e.stopPropagation(); handleVoteClick(m.name, -1); });

  voteRow.appendChild(upBtn);
  voteRow.appendChild(scoreEl);
  voteRow.appendChild(downBtn);

  const overlay = document.createElement('div');
  overlay.className = 'meme-overlay';

  const viewBtn = document.createElement('button');
  viewBtn.className = 'overlay-btn';
  viewBtn.title = 'View';
  viewBtn.innerHTML = VIEW_SVG;
  viewBtn.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(m); });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'overlay-btn';
  copyBtn.title = 'Copy Image';
  copyBtn.innerHTML = COPY_SVG;
  copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyMemeImage(m.path, m.ext, m.isNew); });

  const dlBtn = document.createElement('button');
  dlBtn.className = 'overlay-btn';
  dlBtn.title = 'Download';
  dlBtn.innerHTML = DL_SVG;
  dlBtn.addEventListener('click', (e) => { e.stopPropagation(); downloadMeme(m.path, `${m.name}.${m.ext}`); });

  overlay.appendChild(viewBtn);
  overlay.appendChild(copyBtn);
  overlay.appendChild(dlBtn);

  // Wrap image + overlay together so overlay only covers the image
  const imgWrap = document.createElement('div');
  imgWrap.className = 'meme-img-wrap';
  imgWrap.appendChild(img);
  imgWrap.appendChild(overlay);

  card.addEventListener('click', () => openLightbox(m));
  card.appendChild(imgWrap);
  card.appendChild(meta);
  // Uploader credit (Convex memes only)
  if (m.displayName) {
    const uploaderEl = document.createElement('div');
    uploaderEl.className = 'uploader-badge';
    uploaderEl.textContent = `by ${m.displayName}`;
    card.appendChild(uploaderEl);
  }
  card.appendChild(voteRow);
  return card;
}

// ── Grid rendering ───────────────────────────────────────────────────
function renderGrid(memes) {
  grid.innerHTML = '';
  if (memes.length === 0) {
    const el = document.createElement('div');
    el.className = 'empty-state';
    el.textContent = 'No memes match your search';
    grid.appendChild(el);
  } else {
    const frag = document.createDocumentFragment();
    const isFirstRender = !grid.classList.contains('loaded');
    memes.forEach((m, i) => {
      const card = makeCard(m);
      if (isFirstRender) {
        card.style.animationDelay = `${Math.min(i, 20) * 30}ms`;
      }
      frag.appendChild(card);
    });
    grid.appendChild(frag);
    // Mark grid as loaded after first entrance animation finishes
    if (isFirstRender) {
      setTimeout(() => grid.classList.add('loaded'), 700);
    }
  }
  resultInfo.textContent = `${memes.length} meme${memes.length !== 1 ? 's' : ''}`;
}

/** Filter memes by active category and search query, apply sort, then re-render. */
export function filterGrid() {
  const q = searchInput.value.toLowerCase().trim();
  const all = getAllMemes();
  let filtered = all.filter(m => {
    const catMatch = state.activeCategory === 'all' || m.category === state.activeCategory;
    const nameMatch = !q || m.name.toLowerCase().includes(q) || formatName(m.name).toLowerCase().includes(q);
    return catMatch && nameMatch;
  });

  if (state.sortBy === 'votes') {
    filtered.sort((a, b) => (state.voteCounts[b.name] || 0) - (state.voteCounts[a.name] || 0));
  }

  renderGrid(filtered);
}

/** Render the "Recently Added" row with the last 5 Convex uploads. */
export function renderRecentlyAdded() {
  if (state.convexMemes.length === 0) {
    recentSection.style.display = 'none';
    return;
  }
  recentSection.style.display = 'block';
  recentRow.innerHTML = '';
  const recent = state.convexMemes.slice(0, 5);
  const frag = document.createDocumentFragment();
  recent.forEach((m, i) => {
    const meme = {
      name: m.name,
      category: m.category,
      path: m.url,
      ext: m.ext,
      id: getAllMemes().length - state.convexMemes.length + i + 1,
      isNew: true,
    };
    frag.appendChild(makeCard(meme));
  });
  recentRow.appendChild(frag);
}
