---
layout: custom
title: MEME ARCADE
description: INSERT COIN TO CONTINUE
---

<!-- Arcade Cabinet Frame -->
<div class="arcade-frame">

<!-- CRT Screen Container -->
<div class="crt-screen">

  <!-- Scanlines Effect -->
  <div class="scanlines"></div>

  <!-- Screen Glow -->
  <div class="screen-glow"></div>

  <!-- Arcade Header -->
  <header class="arcade-header">
    <div class="score-display">
      <span class="label">MEMES</span>
      <span class="value" id="meme-count">000</span>
    </div>
    <h1 class="arcade-title">
      <span class="glitch" data-text="MEME ARCADE">MEME ARCADE</span>
    </h1>
    <div class="credits-display">
      <span class="label">LEVEL</span>
      <span class="value" id="current-level">01</span>
    </div>
  </header>

  <!-- Featured Memes Carousel - "HIGH SCORES" -->
  <section class="featured-section">
    <h2 class="section-title">
      <span class="blink">★</span> FEATURED MEMES <span class="blink">★</span>
    </h2>

    <div class="carousel-container">
      <button id="carousel-prev" class="arcade-btn arcade-btn-left" aria-label="Previous">
        <span>◄</span>
      </button>

      <div class="carousel-viewport">
        <div id="carousel-track" class="carousel-track">
          <!-- Carousel items loaded dynamically -->
        </div>
      </div>

      <button id="carousel-next" class="arcade-btn arcade-btn-right" aria-label="Next">
        <span>►</span>
      </button>
    </div>
  </section>

  <!-- Search Console -->
  <section class="search-section">
    <div class="search-container">
      <div class="search-label">SEARCH DATABASE:</div>
      <div class="search-input-wrapper">
        <input
          type="text"
          id="global-search"
          placeholder="ENTER SEARCH QUERY..."
          class="search-input"
          autocomplete="off"
        />
        <button id="clear-search" class="clear-btn" aria-label="Clear search">✕</button>
      </div>
    </div>
  </section>

  <!-- Category Select - "GAME LEVELS" -->
  <section class="levels-section">
    <div class="level-buttons">
      <button class="level-btn active" data-category="all">
        <span class="level-number">00</span>
        <span class="level-name">ALL</span>
      </button>
      <button class="level-btn" data-category="talent">
        <span class="level-number">01</span>
        <span class="level-name">TALENT</span>
      </button>
      <button class="level-btn" data-category="simpsons">
        <span class="level-number">02</span>
        <span class="level-name">SIMPSONS</span>
      </button>
      <button class="level-btn" data-category="anime">
        <span class="level-number">03</span>
        <span class="level-name">ANIME</span>
      </button>
      <button class="level-btn" data-category="movie-reference">
        <span class="level-number">04</span>
        <span class="level-name">MOVIES</span>
      </button>
      <button class="level-btn" data-category="series">
        <span class="level-number">05</span>
        <span class="level-name">SERIES</span>
      </button>
      <button class="level-btn" data-category="templates">
        <span class="level-number">06</span>
        <span class="level-name">TEMPLATES</span>
      </button>
    </div>
  </section>

  <!-- Meme Gallery - "GAME GRID" -->
  <section class="gallery-section">
    <div id="meme-gallery" class="meme-grid">
      <!-- Memes loaded dynamically -->
    </div>

    <!-- Loading State -->
    <div id="loading-state" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">LOADING MEMES<span class="blink">...</span></p>
    </div>

    <!-- No Results -->
    <div id="no-results" class="no-results hidden">
      <div class="no-results-content">
        <p class="no-results-title">GAME OVER</p>
        <p class="no-results-subtitle">NO MEMES FOUND</p>
        <p class="no-results-hint">PRESS ANY KEY TO CONTINUE</p>
      </div>
    </div>
  </section>

  <!-- Arcade Footer -->
  <footer class="arcade-footer">
    <div class="footer-content">
      <a href="https://www.youtube.com/@EnergonHQ" target="_blank" rel="noopener noreferrer" class="youtube-link">
        <span class="blink">►</span> MORE MEMES ON YOUTUBE <span class="blink">◄</span>
      </a>
      <div class="insert-coin">INSERT COIN</div>
    </div>
  </footer>

</div>
<!-- End CRT Screen -->

</div>
<!-- End Arcade Frame -->

<!-- Toast Notification -->
<div id="toast" class="toast">
  <span id="toast-message">COPIED!</span>
</div>

<style>
  /* Import Arcade Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

  /* CSS Variables - Arcade Palette */
  :root {
    --neon-pink: #ff10f0;
    --neon-cyan: #00ffff;
    --neon-yellow: #ffff00;
    --neon-green: #39ff14;
    --arcade-black: #0a0a0a;
    --arcade-dark: #1a1a2e;
    --arcade-gray: #2a2a3e;
    --screen-glow: rgba(0, 255, 255, 0.1);
  }

  /* Reset and Base */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: var(--arcade-black);
    font-family: 'VT323', monospace;
    color: var(--neon-cyan);
    overflow-x: hidden;
  }

  /* Hide default header/footer from layout */
  .page-header,
  .site-footer {
    display: none !important;
  }

  .main-content {
    padding: 0 !important;
    max-width: 100% !important;
  }

  /* Arcade Cabinet Frame */
  .arcade-frame {
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px;
    background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1e 100%);
    border: 8px solid #333;
    border-radius: 20px;
    box-shadow:
      0 0 40px rgba(255, 16, 240, 0.3),
      0 0 80px rgba(0, 255, 255, 0.2),
      inset 0 0 60px rgba(0, 0, 0, 0.8);
  }

  /* CRT Screen */
  .crt-screen {
    position: relative;
    background: var(--arcade-black);
    border: 4px solid var(--arcade-gray);
    border-radius: 10px;
    padding: 30px 20px;
    overflow: hidden;
    box-shadow: inset 0 0 100px rgba(0, 255, 255, 0.1);
  }

  /* CRT Scanlines Effect */
  .scanlines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 999;
    animation: scanline-flicker 0.1s infinite;
  }

  @keyframes scanline-flicker {
    0%, 100% { opacity: 0.9; }
    50% { opacity: 0.95; }
  }

  /* Screen Glow */
  .screen-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at center,
      var(--screen-glow) 0%,
      transparent 70%
    );
    pointer-events: none;
    animation: glow-pulse 3s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }

  /* Arcade Header */
  .arcade-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(26, 26, 46, 0.8);
    border: 3px solid var(--neon-cyan);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  }

  .score-display,
  .credits-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Press Start 2P', monospace;
  }

  .score-display .label,
  .credits-display .label {
    font-size: 10px;
    color: var(--neon-yellow);
    margin-bottom: 5px;
  }

  .score-display .value,
  .credits-display .value {
    font-size: 20px;
    color: var(--neon-pink);
    text-shadow: 0 0 10px var(--neon-pink);
  }

  .arcade-title {
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(16px, 3vw, 32px);
    color: var(--neon-cyan);
    text-align: center;
    text-shadow:
      0 0 10px var(--neon-cyan),
      0 0 20px var(--neon-cyan),
      0 0 30px var(--neon-cyan);
    letter-spacing: 2px;
  }

  /* Glitch Effect */
  .glitch {
    position: relative;
    display: inline-block;
  }

  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .glitch::before {
    left: 2px;
    text-shadow: -2px 0 var(--neon-pink);
    clip: rect(24px, 550px, 90px, 0);
    animation: glitch-anim 3s infinite linear alternate-reverse;
  }

  .glitch::after {
    left: -2px;
    text-shadow: -2px 0 var(--neon-green);
    clip: rect(85px, 550px, 140px, 0);
    animation: glitch-anim 2s infinite linear alternate-reverse;
  }

  @keyframes glitch-anim {
    0% { clip: rect(39px, 9999px, 78px, 0); }
    20% { clip: rect(98px, 9999px, 23px, 0); }
    40% { clip: rect(12px, 9999px, 108px, 0); }
    60% { clip: rect(81px, 9999px, 51px, 0); }
    80% { clip: rect(28px, 9999px, 88px, 0); }
    100% { clip: rect(64px, 9999px, 19px, 0); }
  }

  /* Section Titles */
  .section-title {
    font-family: 'Press Start 2P', monospace;
    font-size: 16px;
    text-align: center;
    color: var(--neon-yellow);
    margin-bottom: 20px;
    text-shadow: 0 0 10px var(--neon-yellow);
  }

  /* Blink Animation */
  .blink {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 50%, 100% { opacity: 1; }
    25%, 75% { opacity: 0; }
  }

  /* Featured Carousel */
  .featured-section {
    margin-bottom: 40px;
    padding: 20px;
  }

  .carousel-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .carousel-viewport {
    flex: 1;
    overflow: hidden;
    background: rgba(26, 26, 46, 0.5);
    border: 2px solid var(--neon-pink);
    padding: 15px;
    box-shadow: inset 0 0 20px rgba(255, 16, 240, 0.3);
  }

  .carousel-track {
    display: flex;
    gap: 15px;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .carousel-item {
    flex-shrink: 0;
    width: 200px;
    height: 200px;
    cursor: pointer;
    position: relative;
    border: 3px solid var(--neon-cyan);
    background: var(--arcade-dark);
    transition: all 0.3s ease;
  }

  .carousel-item:hover {
    border-color: var(--neon-pink);
    transform: scale(1.05) rotate(-2deg);
    box-shadow: 0 0 30px var(--neon-pink);
    animation: screen-shake 0.2s;
  }

  .carousel-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: brightness(0.9) contrast(1.1);
  }

  @keyframes screen-shake {
    0%, 100% { transform: translate(0, 0) scale(1.05); }
    25% { transform: translate(-2px, 2px) scale(1.05); }
    75% { transform: translate(2px, -2px) scale(1.05); }
  }

  /* Arcade Buttons */
  .arcade-btn {
    width: 50px;
    height: 50px;
    background: var(--arcade-dark);
    border: 3px solid var(--neon-cyan);
    color: var(--neon-cyan);
    font-family: 'Press Start 2P', monospace;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    flex-shrink: 0;
  }

  .arcade-btn:hover {
    background: var(--neon-cyan);
    color: var(--arcade-black);
    box-shadow: 0 0 20px var(--neon-cyan);
    transform: scale(1.1);
  }

  .arcade-btn:active {
    transform: scale(0.95);
  }

  /* Search Section */
  .search-section {
    margin-bottom: 30px;
    padding: 0 20px;
  }

  .search-container {
    background: rgba(26, 26, 46, 0.8);
    border: 2px solid var(--neon-green);
    padding: 15px;
  }

  .search-label {
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    color: var(--neon-green);
    margin-bottom: 10px;
    text-shadow: 0 0 5px var(--neon-green);
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    flex: 1;
    background: var(--arcade-black);
    border: 2px solid var(--neon-cyan);
    color: var(--neon-cyan);
    font-family: 'VT323', monospace;
    font-size: 24px;
    padding: 10px 40px 10px 15px;
    text-transform: uppercase;
    box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.3);
  }

  .search-input::placeholder {
    color: rgba(0, 255, 255, 0.4);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--neon-pink);
    box-shadow:
      inset 0 0 10px rgba(255, 16, 240, 0.3),
      0 0 15px var(--neon-pink);
  }

  .clear-btn {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    color: var(--neon-pink);
    font-size: 24px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .clear-btn.visible {
    opacity: 1;
  }

  .clear-btn:hover {
    color: var(--neon-yellow);
  }

  /* Level Selection */
  .levels-section {
    margin-bottom: 30px;
    padding: 0 20px;
  }

  .level-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .level-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    background: var(--arcade-dark);
    border: 2px solid var(--neon-yellow);
    padding: 10px 15px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Press Start 2P', monospace;
  }

  .level-number {
    font-size: 12px;
    color: var(--neon-yellow);
  }

  .level-name {
    font-size: 10px;
    color: var(--neon-cyan);
  }

  .level-btn:hover {
    background: var(--neon-yellow);
    transform: translateY(-3px);
    box-shadow: 0 5px 0 var(--neon-pink);
  }

  .level-btn:hover .level-number,
  .level-btn:hover .level-name {
    color: var(--arcade-black);
  }

  .level-btn.active {
    background: var(--neon-pink);
    border-color: var(--neon-pink);
    box-shadow: 0 0 20px var(--neon-pink);
  }

  .level-btn.active .level-number,
  .level-btn.active .level-name {
    color: white;
  }

  /* Meme Gallery */
  .gallery-section {
    padding: 0 20px;
    min-height: 400px;
  }

  .meme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
  }

  .meme-card {
    position: relative;
    aspect-ratio: 1;
    background: var(--arcade-dark);
    border: 3px solid var(--neon-cyan);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
  }

  .meme-card:hover {
    border-color: var(--neon-pink);
    transform: scale(1.05);
    box-shadow: 0 0 30px var(--neon-pink);
    z-index: 10;
  }

  .meme-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: brightness(0.9) contrast(1.1);
    transition: filter 0.3s;
  }

  .meme-card:hover img {
    filter: brightness(1.1) contrast(1.2);
  }

  .meme-actions {
    position: absolute;
    inset: 0;
    background: rgba(10, 10, 10, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .meme-card:hover .meme-actions {
    opacity: 1;
  }

  .meme-action-btn {
    background: var(--arcade-dark);
    border: 2px solid var(--neon-cyan);
    color: var(--neon-cyan);
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .meme-action-btn:hover {
    background: var(--neon-cyan);
    color: var(--arcade-black);
    box-shadow: 0 0 15px var(--neon-cyan);
  }

  /* Loading State */
  .loading-state {
    text-align: center;
    padding: 60px 20px;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    border: 4px solid var(--arcade-gray);
    border-top: 4px solid var(--neon-pink);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: 'Press Start 2P', monospace;
    font-size: 14px;
    color: var(--neon-cyan);
  }

  /* No Results */
  .no-results {
    text-align: center;
    padding: 80px 20px;
  }

  .no-results.hidden {
    display: none;
  }

  .no-results-title {
    font-family: 'Press Start 2P', monospace;
    font-size: 24px;
    color: var(--neon-pink);
    margin-bottom: 15px;
    text-shadow: 0 0 20px var(--neon-pink);
  }

  .no-results-subtitle {
    font-family: 'Press Start 2P', monospace;
    font-size: 16px;
    color: var(--neon-yellow);
    margin-bottom: 10px;
  }

  .no-results-hint {
    font-family: 'VT323', monospace;
    font-size: 20px;
    color: var(--neon-cyan);
  }

  /* Footer */
  .arcade-footer {
    margin-top: 40px;
    padding: 20px;
    background: rgba(26, 26, 46, 0.8);
    border-top: 3px solid var(--neon-pink);
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .youtube-link {
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    color: var(--neon-yellow);
    text-decoration: none;
    text-shadow: 0 0 10px var(--neon-yellow);
    transition: all 0.3s;
  }

  .youtube-link:hover {
    color: var(--neon-pink);
    text-shadow: 0 0 15px var(--neon-pink);
  }

  .insert-coin {
    font-family: 'Press Start 2P', monospace;
    font-size: 12px;
    color: var(--neon-green);
    text-shadow: 0 0 10px var(--neon-green);
    animation: blink 1.5s infinite;
  }

  /* Toast Notification */
  .toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--arcade-dark);
    border: 3px solid var(--neon-green);
    color: var(--neon-green);
    font-family: 'Press Start 2P', monospace;
    font-size: 12px;
    padding: 15px 30px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 0 30px var(--neon-green);
  }

  .toast.show {
    opacity: 1;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .arcade-header {
      flex-direction: column;
      gap: 15px;
    }

    .arcade-title {
      font-size: 16px;
    }

    .carousel-item {
      width: 150px;
      height: 150px;
    }

    .level-btn {
      padding: 8px 12px;
    }

    .level-number {
      font-size: 10px;
    }

    .level-name {
      font-size: 8px;
    }

    .meme-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 10px;
    }

    .footer-content {
      flex-direction: column;
      text-align: center;
    }
  }

  /* Utility */
  .hidden {
    display: none !important;
  }
</style>

<script>
  // All memes data structure
  const allMemes = [
    {% for image in site.static_files %}
      {% if image.path contains '/assets/images/' and image.extname == '.png' or image.extname == '.jpg' or image.extname == '.jpeg' or image.extname == '.gif' %}
        {
          url: "{{ image.path | relative_url }}",
          name: "{{ image.name }}",
          path: "{{ image.path }}",
          category: "{{ image.path | split: '/' | slice: 3 | first | default: 'other' }}"
        },
      {% endif %}
    {% endfor %}
  ].filter(meme => {
    // Filter out root level images
    return meme.category !== 'cyberpunk-dog.png' &&
           meme.category !== 'patrick-seahorse.gif' &&
           meme.category !== 'simpsons-dignity.png';
  });

  let currentCategory = 'all';
  let searchQuery = '';
  let carouselIndex = 0;
  const carouselItemsPerView = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 3 : 2;

  // Initialize the app
  document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    renderMemes();
    initLevelButtons();
    initSearch();
    startCarouselAutoplay();
    updateMemeCount();
  });

  // Initialize carousel with featured memes
  function initCarousel() {
    const featuredMemes = allMemes.slice(0, 20);
    const track = document.getElementById('carousel-track');

    featuredMemes.forEach(meme => {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      item.innerHTML = `<img src="${meme.url}" alt="${meme.name}" loading="lazy" />`;
      item.addEventListener('click', () => {
        copyToClipboard(meme.url);
      });
      track.appendChild(item);
    });

    document.getElementById('carousel-prev').addEventListener('click', () => moveCarousel(-1));
    document.getElementById('carousel-next').addEventListener('click', () => moveCarousel(1));
  }

  function moveCarousel(direction) {
    const track = document.getElementById('carousel-track');
    const items = track.children;
    const maxIndex = Math.max(0, items.length - carouselItemsPerView);

    carouselIndex = Math.max(0, Math.min(maxIndex, carouselIndex + direction));
    const offset = carouselIndex * (items[0].offsetWidth + 15);
    track.style.transform = `translateX(-${offset}px)`;
  }

  function startCarouselAutoplay() {
    setInterval(() => {
      const track = document.getElementById('carousel-track');
      const maxIndex = Math.max(0, track.children.length - carouselItemsPerView);

      if (carouselIndex >= maxIndex) {
        carouselIndex = 0;
      } else {
        carouselIndex++;
      }

      const offset = carouselIndex * (track.children[0].offsetWidth + 15);
      track.style.transform = `translateX(-${offset}px)`;
    }, 3000);
  }

  // Render memes
  function renderMemes() {
    const gallery = document.getElementById('meme-gallery');
    const loading = document.getElementById('loading-state');
    const noResults = document.getElementById('no-results');

    loading.classList.add('hidden');

    let filteredMemes = allMemes.filter(meme => {
      const matchesCategory = currentCategory === 'all' || meme.category === currentCategory;
      const matchesSearch = searchQuery === '' ||
        meme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meme.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (filteredMemes.length === 0) {
      gallery.innerHTML = '';
      noResults.classList.remove('hidden');
      return;
    }

    noResults.classList.add('hidden');
    gallery.innerHTML = filteredMemes.map(meme => `
      <div class="meme-card">
        <img src="${meme.url}" alt="${meme.name}" loading="lazy" />
        <div class="meme-actions">
          <button onclick="copyToClipboard('${meme.url}')" class="meme-action-btn">
            COPY URL
          </button>
          <button onclick="downloadMeme('${meme.url}', '${meme.name}')" class="meme-action-btn">
            DOWNLOAD
          </button>
        </div>
      </div>
    `).join('');

    updateMemeCount();
  }

  // Level buttons (categories)
  function initLevelButtons() {
    document.querySelectorAll('.level-btn').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.dataset.category;
        searchQuery = '';
        document.getElementById('global-search').value = '';
        document.getElementById('clear-search').classList.remove('visible');

        // Update level display
        const levelNum = button.querySelector('.level-number').textContent;
        document.getElementById('current-level').textContent = levelNum;

        renderMemes();
      });
    });
  }

  // Search functionality
  function initSearch() {
    const searchInput = document.getElementById('global-search');
    const clearBtn = document.getElementById('clear-search');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      searchQuery = e.target.value;

      if (searchQuery === '') {
        clearBtn.classList.remove('visible');
      } else {
        clearBtn.classList.add('visible');
      }

      debounceTimer = setTimeout(() => {
        if (searchQuery !== '') {
          currentCategory = 'all';
          document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
          document.querySelector('.level-btn[data-category="all"]').classList.add('active');
          document.getElementById('current-level').textContent = '00';
        }
        renderMemes();
      }, 300);
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.classList.remove('visible');
      renderMemes();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchQuery = '';
        clearBtn.classList.remove('visible');
        renderMemes();
      }
    });
  }

  // Update meme count
  function updateMemeCount() {
    const count = document.querySelectorAll('.meme-card').length;
    document.getElementById('meme-count').textContent = String(count).padStart(3, '0');
  }

  // Copy to clipboard
  async function copyToClipboard(imageUrl) {
    const fullUrl = window.location.origin + imageUrl;

    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast('COPIED!');
    } catch (err) {
      const tempInput = document.createElement('input');
      document.body.appendChild(tempInput);
      tempInput.value = fullUrl;
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showToast('COPIED!');
    }
  }

  // Download meme
  function downloadMeme(imageUrl, imageName) {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = imageName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('DOWNLOADED!');
      })
      .catch(() => {
        showToast('ERROR!');
      });
  }

  // Show toast
  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    const track = document.getElementById('carousel-track');
    if (track.children.length > 0) {
      carouselIndex = 0;
      track.style.transform = 'translateX(0)';
    }
  });
</script>
