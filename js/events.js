// ── Event handlers ───────────────────────────────────────────────────
import { MEMES } from './data.js';
import { state, convex, api, visitorId, getAllMemes, getLoggedInUser, setAuthSession } from './state.js';
import { showToast, formatName, copyMemeUrl, copyMemeImage, downloadMeme } from './utils.js';
import { rebuildChips, filterGrid, renderRecentlyAdded } from './render.js';

// ── Search input ─────────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', filterGrid);

// ── Sort control ─────────────────────────────────────────────────────
const sortSelect = document.getElementById('sortSelect');
sortSelect.addEventListener('change', () => {
  state.sortBy = sortSelect.value;
  filterGrid();
});

// ── Convex: load remote memes ────────────────────────────────────────
export async function loadConvexMemes({ render = true } = {}) {
  try {
    const results = await convex.query(api.memes.list);
    state.convexMemes = results;
    if (render) { rebuildChips(); filterGrid(); renderRecentlyAdded(); }
    const total = MEMES.length + state.convexMemes.length;
    document.getElementById('subtitle').textContent = `${total} internal jokes`;
    searchInput.placeholder = `Search ${total} memes\u2026`;
  } catch (e) {
    console.warn('Convex not available:', e.message);
  }
}

// ── Convex: load votes ───────────────────────────────────────────────
export async function loadVotes({ render = true } = {}) {
  try {
    const { counts, upvoted, downvoted } = await convex.query(api.votes.getVotes, { visitorId });
    state.voteCounts = counts;
    state.myVotes = new Set(upvoted);
    state.myDownvotes = new Set(downvoted);
    if (render) { filterGrid(); renderRecentlyAdded(); }
  } catch (e) {
    console.warn('Votes not available:', e.message);
  }
}

/** Handle a vote toggle (direction: +1 upvote, -1 downvote). */
export async function handleVoteClick(memeKey, direction = 1) {
  try {
    const { action, direction: dir } = await convex.mutation(api.votes.toggleVote, { memeKey, visitorId, direction });

    // Optimistic local update
    if (action === 'added') {
      state.voteCounts[memeKey] = (state.voteCounts[memeKey] || 0) + dir;
      if (dir > 0) { state.myVotes.add(memeKey); state.myDownvotes.delete(memeKey); }
      else { state.myDownvotes.add(memeKey); state.myVotes.delete(memeKey); }
      showToast(dir > 0 ? 'Upvoted!' : 'Downvoted');
    } else if (action === 'switched') {
      // Switched direction: net change is 2*dir
      state.voteCounts[memeKey] = (state.voteCounts[memeKey] || 0) + 2 * dir;
      if (dir > 0) { state.myVotes.add(memeKey); state.myDownvotes.delete(memeKey); }
      else { state.myDownvotes.add(memeKey); state.myVotes.delete(memeKey); }
      showToast(dir > 0 ? 'Switched to upvote' : 'Switched to downvote');
    } else {
      state.voteCounts[memeKey] = (state.voteCounts[memeKey] || 0) - dir;
      state.myVotes.delete(memeKey);
      state.myDownvotes.delete(memeKey);
      showToast('Vote removed');
    }

    // Burst animation on the button that was just activated (up or down)
    if (action === 'added' || action === 'switched') {
      const sel = dir > 0 ? '.vote-btn:not(.downvote)' : '.vote-btn.downvote';
      document.querySelectorAll(sel).forEach(btn => {
        const card = btn.closest('.meme-card');
        if (card && card.querySelector('.meme-name')?.textContent === formatName(memeKey)) {
          btn.classList.remove('burst');
          void btn.offsetWidth;
          btn.classList.add('burst');
        }
      });
    }

    filterGrid();
    renderRecentlyAdded();
  } catch (e) {
    showToast('Vote failed. Check Convex config');
  }
}

// ── Admin: delete meme ──────────────────────────────────────────────
export async function handleDeleteMeme(memeId, memeName) {
  if (!confirm(`Delete "${memeName}"?`)) return;
  if (!getLoggedInUser()) { showToast('Sign in required'); return; }
  try {
    const result = await convex.mutation(api.memes.deleteMeme, { memeId });
    if (result.ok) {
      showToast('Meme deleted');
      await loadConvexMemes();
    } else {
      showToast(result.error);
    }
  } catch (e) {
    showToast('Delete failed: ' + e.message);
  }
}

// ── Upload panel toggle ──────────────────────────────────────────────
const uploadToggle = document.getElementById('uploadToggle');
const uploadPanel  = document.getElementById('uploadPanel');
uploadToggle.addEventListener('click', () => {
  uploadPanel.classList.toggle('open');
});

// ── Auth (Clerk + Convex JWT) ────────────────────────────────────────
const authToggle     = document.getElementById('authToggle');
const authPanel      = document.getElementById('authPanel');
const authGate       = document.getElementById('authGate');
const authUserEl     = document.getElementById('authUser');
const authUsernameEl = document.getElementById('authUsername');
const uploadZone     = document.getElementById('uploadZone');
const uploadLoginPrompt = document.getElementById('uploadLoginPrompt');

async function refreshAdminFlag() {
  if (!getLoggedInUser()) {
    setAuthSession(null, false);
    return;
  }
  try {
    const isAd = await convex.query(api.auth.isAdmin, {});
    setAuthSession(state.authLabel, !!isAd);
  } catch {
    setAuthSession(state.authLabel, false);
  }
}

async function refreshLegacyLinkSection() {
  const section = document.getElementById('legacyLinkSection');
  const msg = document.getElementById('legacyLinkMessage');
  if (!section) return;
  if (!getLoggedInUser()) {
    section.hidden = true;
    return;
  }
  try {
    const link = await convex.query(api.migration.myAccountLink, {});
    section.hidden = !!link;
    if (msg) {
      msg.hidden = true;
      msg.textContent = '';
      msg.classList.remove('legacy-link-message--err');
    }
  } catch {
    section.hidden = true;
  }
}

async function onLegacyLinkClick() {
  const userEl = document.getElementById('legacyLinkUser');
  const passEl = document.getElementById('legacyLinkPassword');
  const msg = document.getElementById('legacyLinkMessage');
  const section = document.getElementById('legacyLinkSection');
  const username = userEl?.value?.trim() || '';
  const password = passEl?.value || '';
  if (!username || !password) {
    if (msg) {
      msg.textContent = 'Enter legacy username and password.';
      msg.classList.add('legacy-link-message--err');
      msg.hidden = false;
    }
    return;
  }
  try {
    const res = await convex.mutation(api.migration.linkLegacyAccount, { username, password });
    if (res.ok) {
      if (msg) {
        msg.textContent = `Linked @${res.legacyUsername}.`;
        msg.classList.remove('legacy-link-message--err');
        msg.hidden = false;
      }
      if (userEl) userEl.value = '';
      if (passEl) passEl.value = '';
      if (section) section.hidden = true;
      showToast('Legacy account linked');
    } else if (msg) {
      msg.textContent = res.error || 'Link failed';
      msg.classList.add('legacy-link-message--err');
      msg.hidden = false;
    }
  } catch {
    if (msg) {
      msg.textContent = 'Link failed. Try again.';
      msg.classList.add('legacy-link-message--err');
      msg.hidden = false;
    }
  }
}

/** Call from app.js before first render that depends on auth. */
export async function initMemesAuth() {
  const pk = document.querySelector('meta[name="clerk-publishable-key"]')?.content?.trim();
  if (!pk) {
    console.warn('Meme Vault: add clerk-publishable-key meta for uploads.');
    return;
  }
  try {
    const { initNeorgonClerkConvex, neorgonDisplayLabel } = await import('./vendor/neorgon-auth.js');
    await initNeorgonClerkConvex({
      convex,
      publishableKey: pk,
      signInHost: '#neorgon-signin-mount',
      userButtonHost: '#neorgon-user-mount',
      signInProps: {
        appearance: { layout: { unsafe_disableDevelopmentModeWarnings: true } },
      },
      onSession: ({ clerk, hasSession }) => {
        if (hasSession) {
          setAuthSession(neorgonDisplayLabel(clerk), false);
          void refreshAdminFlag();
          void refreshLegacyLinkSection();
        } else {
          setAuthSession(null, false);
        }
        renderAuthState();
        filterGrid();
        renderRecentlyAdded();
      },
    });
  } catch (e) {
    console.warn('Meme Vault: Clerk init failed', e);
  }
}

function renderAuthState() {
  const loggedIn = !!getLoggedInUser();
  if (!authGate || !authUserEl) return;
  authGate.hidden = loggedIn;
  authUserEl.hidden = !loggedIn;
  authToggle.classList.toggle('logged-in', loggedIn);
  if (loggedIn && authUsernameEl) authUsernameEl.textContent = state.authLabel || '';
  if (uploadZone) uploadZone.style.display = loggedIn ? 'block' : 'none';
  if (uploadLoginPrompt) uploadLoginPrompt.style.display = loggedIn ? 'none' : 'block';
}

authToggle.addEventListener('click', () => {
  authPanel.classList.toggle('open');
  if (authPanel.classList.contains('open')) {
    authPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (getLoggedInUser()) void refreshLegacyLinkSection();
  }
});

document.getElementById('legacyLinkBtn')?.addEventListener('click', () => { void onLegacyLinkClick(); });

// ── Drag-and-drop / file picker ──────────────────────────────────────
const dropZone       = document.getElementById('dropZone');
const fileInput      = document.getElementById('fileInput');
const uploadPreview  = document.getElementById('uploadPreview');
const previewImg     = document.getElementById('previewImg');
const memeNameInput  = document.getElementById('memeNameInput');
const memeCatSelect  = document.getElementById('memeCatSelect');
const uploadSubmit   = document.getElementById('uploadSubmit');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFileSelect(fileInput.files[0]);
});

function handleFileSelect(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Only image files allowed');
    return;
  }
  state.selectedFile = file;
  previewImg.src = URL.createObjectURL(file);
  const baseName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  memeNameInput.value = baseName;
  uploadPreview.style.display = 'block';
  dropZone.textContent = file.name;
}

// ── Upload submit ────────────────────────────────────────────────────
uploadSubmit.addEventListener('click', async () => {
  if (!state.selectedFile) { showToast('No file selected'); return; }
  const name = memeNameInput.value.trim();
  if (!name) { showToast('Add a name first'); return; }

  if (!getLoggedInUser()) { showToast('Please sign in first'); return; }

  uploadSubmit.disabled = true;
  uploadSubmit.textContent = 'Uploading\u2026';

  try {
    const uploadUrl = await convex.mutation(api.memes.getUploadUrl);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': state.selectedFile.type },
      body: state.selectedFile,
    });
    const { storageId } = await res.json();

    const ext = state.selectedFile.name.split('.').pop().toLowerCase();
    const isAnon = document.getElementById('anonCheck').checked;
    await convex.mutation(api.memes.saveMeme, {
      name,
      category: memeCatSelect.value,
      ext,
      storageId,
      displayAnonymous: isAnon,
    });

    showToast('Meme uploaded!');

    state.selectedFile = null;
    uploadPreview.style.display = 'none';
    dropZone.textContent = 'Drop an image here, or click to browse';
    memeNameInput.value = '';
    fileInput.value = '';

    await loadConvexMemes();
  } catch (e) {
    showToast('Upload failed: ' + e.message);
  }

  uploadSubmit.disabled = false;
  uploadSubmit.textContent = 'Upload Meme';
});

// ── Lightbox with prev/next ───────────────────────────────────────────
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxName   = document.getElementById('lightboxName');
const lightboxCounter = document.getElementById('lightboxCounter');
const lbClose        = document.getElementById('lightboxClose');
const lbPrev         = document.getElementById('lbPrev');
const lbNext         = document.getElementById('lbNext');
const lbCopyUrl      = document.getElementById('lbCopyUrl');
const lbCopyImg      = document.getElementById('lbCopyImg');
const lbDownload     = document.getElementById('lbDownload');

let currentMeme = null;
let currentIndex = -1;
let currentList = [];

function setLightboxMeme(meme, index) {
  currentMeme = meme;
  currentIndex = index;
  lightboxImg.classList.add('switching');
  setTimeout(() => {
    lightboxImg.src = meme.path;
    if (meme.isNew) lightboxImg.crossOrigin = 'anonymous';
    lightboxName.textContent = formatName(meme.name);
    lightboxCounter.textContent = `${index + 1} / ${currentList.length}`;
    lightboxImg.classList.remove('switching');
  }, 150);
}

let lightboxReturnFocus = null;

export function openLightbox(meme) {
  currentList = getAllMemes();
  const idx = currentList.findIndex(m => m.name === meme.name && m.path === meme.path);
  currentIndex = idx >= 0 ? idx : 0;
  currentMeme = meme;
  lightboxImg.src = meme.path;
  if (meme.isNew) lightboxImg.crossOrigin = 'anonymous';
  lightboxName.textContent = formatName(meme.name);
  lightboxCounter.textContent = `${currentIndex + 1} / ${currentList.length}`;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightboxReturnFocus = document.activeElement;
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentMeme = null;
  currentIndex = -1;
  if (lightboxReturnFocus && typeof lightboxReturnFocus.focus === 'function') {
    lightboxReturnFocus.focus();
  }
  lightboxReturnFocus = null;
}

function navigateLightbox(dir) {
  if (currentList.length === 0) return;
  const next = (currentIndex + dir + currentList.length) % currentList.length;
  setLightboxMeme(currentList[next], next);
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

lbCopyUrl.addEventListener('click', () => {
  if (currentMeme) copyMemeUrl(currentMeme.path);
});

lbCopyImg.addEventListener('click', () => {
  if (currentMeme) copyMemeImage(currentMeme.path, currentMeme.ext, currentMeme.isNew);
});

lbDownload.addEventListener('click', () => {
  if (currentMeme) downloadMeme(currentMeme.path, `${currentMeme.name}.${currentMeme.ext}`);
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') { closeLightbox(); return; }
  if (e.key === 'ArrowLeft')  { navigateLightbox(-1); return; }
  if (e.key === 'ArrowRight') { navigateLightbox(1); return; }
  if (e.key === 'Tab') {
    // Trap focus among the lightbox's interactive controls.
    const focusable = lightbox.querySelectorAll('button:not([disabled])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else if (!lightbox.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    }
  }
});

// ── Random meme ──────────────────────────────────────────────────────
document.getElementById('randomBtn').addEventListener('click', () => {
  const all = getAllMemes();
  if (all.length === 0) return;
  const rand = all[Math.floor(Math.random() * all.length)];
  openLightbox(rand);
});

// ── Scroll to top ────────────────────────────────────────────────────
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
