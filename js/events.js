// ── Event handlers ───────────────────────────────────────────────────
import { MEMES } from './data.js';
import { state, convex, api, visitorId, getAllMemes, getLoggedInUser, setLoggedInUser, getUserRole, setUserRole } from './state.js';
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

    // Burst animation on upvote
    if (action === 'added' && dir > 0) {
      document.querySelectorAll('.vote-btn:not(.downvote)').forEach(btn => {
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
  const username = getLoggedInUser();
  if (!username) { showToast('Login required'); return; }
  try {
    const result = await convex.mutation(api.memes.deleteMeme, { memeId, adminUsername: username });
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

// ── Auth panel (standardized) ────────────────────────────────────────
const authToggle     = document.getElementById('authToggle');
const authPanel      = document.getElementById('authPanel');
const authGate       = document.getElementById('authGate');
const authUserEl     = document.getElementById('authUser');
const authUsernameEl = document.getElementById('authUsername');
const authRoleEl     = document.getElementById('authRole');
const uploadZone     = document.getElementById('uploadZone');
const uploadLoginPrompt = document.getElementById('uploadLoginPrompt');

// Toggle auth panel
authToggle.addEventListener('click', () => {
  authPanel.classList.toggle('open');
  if (authPanel.classList.contains('open')) {
    authPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// Tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    document.getElementById('authLoginForm').hidden = !isLogin;
    document.getElementById('authRegisterForm').hidden = isLogin;
  });
});

/** Update UI after login/logout. */
function renderAuthState(username, role) {
  const loggedIn = !!username;
  authGate.hidden = loggedIn;
  authUserEl.hidden = !loggedIn;
  authToggle.classList.toggle('logged-in', loggedIn);
  if (loggedIn) {
    authUsernameEl.textContent = username;
    authRoleEl.hidden = role !== 'admin';
  }
  // Upload panel: show/hide zone vs login prompt
  if (uploadZone) uploadZone.style.display = loggedIn ? 'block' : 'none';
  if (uploadLoginPrompt) uploadLoginPrompt.style.display = loggedIn ? 'none' : 'block';
}

// Restore session
const savedUser = getLoggedInUser();
if (savedUser) renderAuthState(savedUser, getUserRole());

/** Handle login or register. */
async function handleAuth(action) {
  const isLogin = action === 'login';
  const userEl = document.getElementById(isLogin ? 'authLoginUser' : 'authRegUser');
  const passEl = document.getElementById(isLogin ? 'authLoginPass' : 'authRegPass');
  const username = userEl.value.trim();
  const password = passEl.value;
  if (!username || !password) { showToast('Enter username and password'); return; }

  try {
    const fn = isLogin ? api.auth.login : api.auth.register;
    const result = await convex.mutation(fn, { username, password });
    if (result.ok) {
      const role = result.role || 'user';
      setLoggedInUser(result.username);
      setUserRole(role);
      renderAuthState(result.username, role);
      showToast(isLogin ? `Welcome back, ${result.username}` : `Welcome, ${result.username}!`);
      userEl.value = '';
      passEl.value = '';
    } else {
      showToast(result.error);
    }
  } catch {
    showToast(`${isLogin ? 'Login' : 'Registration'} failed. Check Convex config`);
  }
}

// Auth buttons
document.getElementById('authLoginBtn').addEventListener('click', () => handleAuth('login'));
document.getElementById('authRegBtn').addEventListener('click', () => handleAuth('register'));

// Enter key on auth forms
['authLoginUser', 'authLoginPass'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAuth('login');
  });
});
['authRegUser', 'authRegPass'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAuth('register');
  });
});

// Logout
document.getElementById('authLogout').addEventListener('click', () => {
  setLoggedInUser(null);
  setUserRole(null);
  renderAuthState(null);
  showToast('Logged out');
});

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

  const username = getLoggedInUser();
  if (!username) { showToast('Please log in first'); return; }

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
      uploadedBy: username,
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
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  currentMeme = null;
  currentIndex = -1;
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
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft')  navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
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
