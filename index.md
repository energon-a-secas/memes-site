---
layout: custom
title: Meme Delivery Platform
description: Your go-to memes and references, always within reach
standalone: true
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
    <div class="arcade-title-block">
      <h1 class="arcade-title">
        <span class="glitch" data-text="MEME DELIVERY PLATFORM">MEME DELIVERY PLATFORM</span>
      </h1>
      <p class="arcade-subtitle">YOUR GO-TO MEMES AND REFERENCES, ALWAYS WITHIN REACH</p>
    </div>
    <div class="credits-display">
      <span class="label">LEVEL</span>
      <span class="value" id="current-level">01</span>
    </div>
  </header>

  <!-- Featured Memes Carousel -->
  <section class="featured-section">
    <h2 class="section-title">
      <span class="blink">&#9733;</span> FEATURED MEMES <span class="blink">&#9733;</span>
    </h2>

    <div class="carousel-container">
      <button id="carousel-prev" class="arcade-btn arcade-btn-left" aria-label="Previous">
        <span>&#9668;</span>
      </button>

      <div class="carousel-viewport">
        <div id="carousel-track" class="carousel-track">
          <!-- Carousel items loaded dynamically -->
        </div>
      </div>

      <button id="carousel-next" class="arcade-btn arcade-btn-right" aria-label="Next">
        <span>&#9658;</span>
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
        <button id="clear-search" class="clear-btn" aria-label="Clear search">&#10005;</button>
      </div>
    </div>
  </section>

  <!-- Category Select -->
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
      <button class="level-btn" data-category="general">
        <span class="level-number">07</span>
        <span class="level-name">GENERAL</span>
      </button>
      <button class="level-btn" data-category="country">
        <span class="level-number">08</span>
        <span class="level-name">COUNTRY</span>
      </button>
      <button class="level-btn" data-category="mood">
        <span class="level-number">09</span>
        <span class="level-name">MOOD</span>
      </button>
      <button class="level-btn" data-category="other-references">
        <span class="level-number">10</span>
        <span class="level-name">OTHER</span>
      </button>
      <button class="level-btn" data-category="games">
        <span class="level-number">11</span>
        <span class="level-name">GAMES</span>
      </button>
    </div>
  </section>

  <!-- Meme Gallery -->
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
        <p class="no-results-hint">TRY A DIFFERENT SEARCH</p>
      </div>
    </div>
  </section>

  <!-- Arcade Footer -->
  <footer class="arcade-footer">
    <div class="footer-content">
      <a href="https://www.youtube.com/@energon-hq" target="_blank" rel="noopener noreferrer" class="youtube-link">
        <span class="blink">&#9658;</span> MORE MEMES ON YOUTUBE <span class="blink">&#9668;</span>
      </a>
      <div class="insert-coin">INSERT COIN</div>
    </div>
  </footer>

</div>
<!-- End CRT Screen -->

</div>
<!-- End Arcade Frame -->

<!-- Arcade Lightbox -->
<div id="arcade-lightbox" class="arcade-lightbox" onclick="closeArcadeLightbox(event)">
  <button class="lightbox-close" onclick="closeArcadeLightbox(event, true)" aria-label="Close">&times;</button>
  <div class="lightbox-content" onclick="event.stopPropagation()">
    <img id="arcade-lightbox-img" src="" alt="" crossorigin="anonymous" />
    <div class="lightbox-actions">
      <button onclick="arcadeLightboxCopy()" class="meme-action-btn">COPY URL</button>
      <button onclick="arcadeLightboxCopyImage()" class="meme-action-btn copy-img-btn">COPY IMAGE</button>
      <button onclick="arcadeLightboxDownload()" class="meme-action-btn">DOWNLOAD</button>
    </div>
  </div>
</div>

<!-- Toast Notification -->
<div id="toast" class="toast">
  <span id="toast-message">COPIED!</span>
</div>

<style>
  /* Import Arcade Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

  /* CSS Variables - Calculator-Inspired Arcade Palette */
  :root {
    --primary: #0063e5;
    --primary-light: #0080ff;
    --primary-glow: rgba(0, 99, 229, 0.4);
    --accent: #ff8c00;
    --accent-light: #ffaa33;
    --accent-glow: rgba(255, 140, 0, 0.4);
    --success: #00d68f;
    --success-glow: rgba(0, 214, 143, 0.4);
    --bg-deep: #040714;
    --bg-dark: #0a1628;
    --bg-surface: #162040;
    --border-color: rgba(0, 99, 229, 0.4);
    --border-subtle: rgba(255, 255, 255, 0.1);
    --text-primary: #f9f9f9;
    --text-secondary: #cacaca;
    --screen-glow: rgba(0, 99, 229, 0.15);
  }

  /* Reset and Base */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: var(--bg-deep);
    font-family: 'VT323', monospace;
    color: var(--text-primary);
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
    background: linear-gradient(145deg, var(--bg-dark) 0%, var(--bg-deep) 100%);
    border: 4px solid rgba(0, 99, 229, 0.3);
    border-radius: 20px;
    box-shadow:
      0 0 40px var(--primary-glow),
      0 0 80px rgba(0, 99, 229, 0.15),
      inset 0 0 60px rgba(0, 0, 0, 0.8);
  }

  /* CRT Screen */
  .crt-screen {
    position: relative;
    background: var(--bg-deep);
    border: 2px solid var(--bg-surface);
    border-radius: 10px;
    padding: 30px 20px;
    overflow: hidden;
    box-shadow: inset 0 0 100px var(--screen-glow);
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
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.1) 1px,
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
    background: rgba(10, 22, 40, 0.8);
    border: 2px solid var(--primary);
    border-radius: 8px;
    box-shadow: 0 0 20px var(--primary-glow);
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
    color: var(--primary-light);
    margin-bottom: 5px;
  }

  .score-display .value,
  .credits-display .value {
    font-size: 20px;
    color: var(--accent);
    text-shadow: 0 0 10px var(--accent-glow);
  }

  .arcade-title-block {
    text-align: center;
    flex: 1;
    padding: 0 15px;
  }

  .arcade-title {
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(10px, 2vw, 20px);
    color: var(--text-primary);
    text-align: center;
    text-shadow:
      0 0 10px var(--primary-glow),
      0 0 20px var(--primary-glow),
      0 0 30px rgba(0, 99, 229, 0.2);
    letter-spacing: 2px;
    margin-bottom: 8px;
  }

  .arcade-subtitle {
    font-family: 'VT323', monospace;
    font-size: clamp(12px, 1.5vw, 18px);
    color: var(--text-secondary);
    letter-spacing: 1px;
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
    text-shadow: -2px 0 var(--accent);
    clip: rect(24px, 550px, 90px, 0);
    animation: glitch-anim 3s infinite linear alternate-reverse;
  }

  .glitch::after {
    left: -2px;
    text-shadow: -2px 0 var(--primary);
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
    color: var(--primary-light);
    margin-bottom: 20px;
    text-shadow: 0 0 10px var(--primary-glow);
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
    background: rgba(10, 22, 40, 0.5);
    border: 2px solid var(--accent);
    border-radius: 6px;
    padding: 15px;
    box-shadow: inset 0 0 20px var(--accent-glow);
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
    border: 2px solid var(--primary);
    border-radius: 6px;
    background: var(--bg-dark);
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .carousel-item:hover {
    border-color: var(--accent);
    transform: scale(1.12) rotate(-1deg);
    box-shadow: 0 0 30px var(--accent-glow), 0 8px 25px rgba(0, 0, 0, 0.4);
  }

  .carousel-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: brightness(0.95) contrast(1.05);
  }

  /* Arcade Buttons */
  .arcade-btn {
    width: 50px;
    height: 50px;
    background: var(--bg-dark);
    border: 2px solid var(--primary);
    border-radius: 6px;
    color: var(--primary);
    font-family: 'Press Start 2P', monospace;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 0 10px var(--primary-glow);
    flex-shrink: 0;
  }

  .arcade-btn:hover {
    background: var(--primary);
    color: white;
    box-shadow: 0 0 20px var(--primary-glow);
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
    background: rgba(10, 22, 40, 0.8);
    border: 2px solid var(--success);
    border-radius: 6px;
    padding: 15px;
    box-shadow: 0 0 10px var(--success-glow);
  }

  .search-label {
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    color: var(--success);
    margin-bottom: 10px;
    text-shadow: 0 0 5px var(--success-glow);
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    flex: 1;
    background: var(--bg-deep);
    border: 2px solid var(--primary);
    border-radius: 4px;
    color: var(--text-primary);
    font-family: 'VT323', monospace;
    font-size: 24px;
    padding: 10px 40px 10px 15px;
    text-transform: uppercase;
    box-shadow: inset 0 0 10px rgba(0, 99, 229, 0.2);
  }

  .search-input::placeholder {
    color: rgba(249, 249, 249, 0.3);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow:
      inset 0 0 10px var(--accent-glow),
      0 0 15px var(--accent-glow);
  }

  .clear-btn {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    color: var(--accent);
    font-size: 24px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .clear-btn.visible {
    opacity: 1;
  }

  .clear-btn:hover {
    color: var(--accent-light);
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
    background: var(--bg-dark);
    border: 2px solid var(--primary);
    border-radius: 6px;
    padding: 10px 15px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Press Start 2P', monospace;
  }

  .level-number {
    font-size: 12px;
    color: var(--primary-light);
  }

  .level-name {
    font-size: 10px;
    color: var(--text-secondary);
  }

  .level-btn:hover {
    background: var(--primary);
    transform: translateY(-3px);
    box-shadow: 0 5px 0 var(--accent);
  }

  .level-btn:hover .level-number,
  .level-btn:hover .level-name {
    color: white;
  }

  .level-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 20px var(--accent-glow);
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
    background: var(--bg-dark);
    border: 2px solid var(--primary);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
  }

  .meme-card:hover {
    border-color: var(--accent);
    transform: scale(1.12);
    box-shadow: 0 0 30px var(--accent-glow), 0 8px 25px rgba(0, 0, 0, 0.4);
    z-index: 10;
  }

  .meme-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: brightness(0.95) contrast(1.05);
    transition: filter 0.3s;
  }

  .meme-card:hover img {
    filter: brightness(1.1) contrast(1.1);
  }

  .meme-actions {
    position: absolute;
    inset: 0;
    background: rgba(4, 7, 20, 0.85);
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
    background: var(--bg-dark);
    border: 2px solid var(--primary);
    border-radius: 4px;
    color: var(--text-primary);
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .meme-action-btn:hover {
    background: var(--primary);
    color: white;
    box-shadow: 0 0 15px var(--primary-glow);
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
    border: 4px solid var(--bg-surface);
    border-top: 4px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: 'Press Start 2P', monospace;
    font-size: 14px;
    color: var(--text-primary);
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
    color: var(--accent);
    margin-bottom: 15px;
    text-shadow: 0 0 20px var(--accent-glow);
  }

  .no-results-subtitle {
    font-family: 'Press Start 2P', monospace;
    font-size: 16px;
    color: var(--primary-light);
    margin-bottom: 10px;
  }

  .no-results-hint {
    font-family: 'VT323', monospace;
    font-size: 20px;
    color: var(--text-secondary);
  }

  /* Footer */
  .arcade-footer {
    margin-top: 40px;
    padding: 20px;
    background: rgba(10, 22, 40, 0.8);
    border-top: 2px solid var(--primary);
    border-radius: 0 0 6px 6px;
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
    color: var(--accent);
    text-decoration: none;
    text-shadow: 0 0 10px var(--accent-glow);
    transition: all 0.3s;
  }

  .youtube-link:hover {
    color: var(--accent-light);
    text-shadow: 0 0 15px var(--accent-glow);
  }

  .insert-coin {
    font-family: 'Press Start 2P', monospace;
    font-size: 12px;
    color: var(--success);
    text-shadow: 0 0 10px var(--success-glow);
    animation: blink 1.5s infinite;
  }

  /* Toast Notification */
  .toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-dark);
    border: 2px solid var(--success);
    border-radius: 6px;
    color: var(--success);
    font-family: 'Press Start 2P', monospace;
    font-size: 12px;
    padding: 15px 30px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 0 20px var(--success-glow);
  }

  .toast.show {
    opacity: 1;
  }

  /* Arcade Lightbox */
  .arcade-lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(4, 7, 20, 0.95);
    backdrop-filter: blur(8px);
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .arcade-lightbox.active {
    display: flex;
  }

  .lightbox-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 40px;
    cursor: pointer;
    transition: color 0.2s;
    z-index: 10;
    line-height: 1;
  }

  .lightbox-close:hover {
    color: var(--accent);
  }

  .lightbox-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 90vw;
    max-height: 90vh;
  }

  .lightbox-content img {
    max-width: 100%;
    max-height: 75vh;
    object-fit: contain;
    border: 2px solid var(--primary);
    border-radius: 8px;
    box-shadow: 0 0 40px var(--primary-glow);
    transition: transform 0.3s ease;
  }

  .lightbox-content img:hover {
    transform: scale(1.03);
  }

  .copy-img-btn {
    border-color: #7c3aed !important;
  }

  .copy-img-btn:hover {
    background: #7c3aed !important;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.4) !important;
  }

  .lightbox-actions {
    display: flex;
    gap: 15px;
  }

  .lightbox-actions .meme-action-btn {
    font-size: 10px;
    padding: 12px 20px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .arcade-header {
      flex-direction: column;
      gap: 15px;
    }

    .arcade-title {
      font-size: 12px;
    }

    .arcade-subtitle {
      font-size: 12px;
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
      {% if image.path contains '/assets/images/' %}
        {% assign ext = image.extname | downcase %}
        {% if ext == '.png' or ext == '.jpg' or ext == '.jpeg' or ext == '.gif' or ext == '.webp' %}
          {
            url: "{{ image.path | relative_url }}",
            name: "{{ image.name }}",
            path: "{{ image.path }}",
            category: "{{ image.path | split: '/' | slice: 3 | first | default: 'other' }}"
          },
        {% endif %}
      {% endif %}
    {% endfor %}
  ].filter(meme => {
    // Filter out root-level images (not in a category subfolder)
    const rootImages = ['cyberpunk-dog.png', 'patrick-seahorse.gif'];
    return !rootImages.includes(meme.category);
  });

  let currentCategory = 'all';
  let searchQuery = '';
  let carouselIndex = 0;
  let carouselItemsPerView = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 3 : 2;

  // Lightbox state
  let lightboxUrl = '';
  let lightboxName = '';

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
        openArcadeLightbox(meme.url, meme.name);
      });
      track.appendChild(item);
    });

    document.getElementById('carousel-prev').addEventListener('click', () => moveCarousel(-1));
    document.getElementById('carousel-next').addEventListener('click', () => moveCarousel(1));
  }

  function moveCarousel(direction) {
    const track = document.getElementById('carousel-track');
    const items = track.children;
    if (items.length === 0) return;
    const maxIndex = Math.max(0, items.length - carouselItemsPerView);

    carouselIndex = Math.max(0, Math.min(maxIndex, carouselIndex + direction));
    const offset = carouselIndex * (items[0].offsetWidth + 15);
    track.style.transform = `translateX(-${offset}px)`;
  }

  function startCarouselAutoplay() {
    setInterval(() => {
      const track = document.getElementById('carousel-track');
      if (track.children.length === 0) return;
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
      <div class="meme-card" onclick="openArcadeLightbox('${meme.url}', '${meme.name.replace(/'/g, "\\'")}')">
        <img src="${meme.url}" alt="${meme.name}" loading="lazy" />
        <div class="meme-actions">
          <button onclick="event.stopPropagation(); copyToClipboard('${meme.url}')" class="meme-action-btn">
            COPY URL
          </button>
          <button onclick="event.stopPropagation(); downloadMeme('${meme.url}', '${meme.name.replace(/'/g, "\\'")}')" class="meme-action-btn">
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

  // Arcade Lightbox
  function openArcadeLightbox(url, name) {
    lightboxUrl = url;
    lightboxName = name;
    const lightbox = document.getElementById('arcade-lightbox');
    const img = document.getElementById('arcade-lightbox-img');
    img.src = url;
    img.alt = name || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeArcadeLightbox(event, force) {
    if (force || (event && event.target === document.getElementById('arcade-lightbox'))) {
      const lightbox = document.getElementById('arcade-lightbox');
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function arcadeLightboxCopy() {
    copyToClipboard(lightboxUrl);
  }

  function arcadeLightboxCopyImage() {
    const img = document.getElementById('arcade-lightbox-img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) { showToast('ERROR!'); return; }
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        showToast('IMAGE COPIED!');
      }).catch(() => {
        showToast('NOT SUPPORTED!');
      });
    }, 'image/png');
  }

  function arcadeLightboxDownload() {
    downloadMeme(lightboxUrl, lightboxName);
  }

  // ESC key to close lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeArcadeLightbox(null, true);
  });

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
    carouselItemsPerView = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 3 : 2;
    const track = document.getElementById('carousel-track');
    if (track.children.length > 0) {
      carouselIndex = 0;
      track.style.transform = 'translateX(0)';
    }
  });
</script>
