---
layout: custom
title: Meme Delivery Platform
description: Your ultimate meme library
---

<!-- Featured Memes Carousel -->
<section class="bg-white py-8 shadow-md mb-8">
  <div class="container mx-auto px-4">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Featured Memes</h2>

    <div class="relative">
      <!-- Carousel Container -->
      <div id="carousel" class="overflow-hidden">
        <div id="carousel-track" class="flex transition-transform duration-500 ease-in-out gap-4">
          <!-- Carousel items will be dynamically loaded -->
        </div>
      </div>

      <!-- Carousel Controls -->
      <button id="carousel-prev" class="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-r-lg transition-colors z-10">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button id="carousel-next" class="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-r-lg transition-colors z-10">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Carousel Indicators -->
    <div id="carousel-indicators" class="flex justify-center gap-2 mt-4">
      <!-- Indicators will be dynamically added -->
    </div>
  </div>
</section>

<!-- Global Search -->
<section class="container mx-auto px-4 mb-8">
  <div class="max-w-2xl mx-auto">
    <div class="relative">
      <input
        type="text"
        id="global-search"
        placeholder="Search all memes..."
        class="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
      <button id="clear-search" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden">
        <i class="fas fa-times"></i>
      </button>
      <i class="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"></i>
    </div>
    <div id="search-results-count" class="text-center text-gray-600 mt-2 hidden"></div>
  </div>
</section>

<!-- Category Tabs -->
<section class="container mx-auto px-4 mb-8">
  <div class="flex flex-wrap justify-center gap-2 mb-6">
    <button class="tab-button active" data-category="all">
      <i class="fas fa-th mr-2"></i>All
    </button>
    <button class="tab-button" data-category="talent">
      <i class="fas fa-briefcase mr-2"></i>Talent
    </button>
    <button class="tab-button" data-category="simpsons">
      <i class="fas fa-tv mr-2"></i>Simpsons
    </button>
    <button class="tab-button" data-category="anime">
      <i class="fas fa-dragon mr-2"></i>Anime
    </button>
    <button class="tab-button" data-category="movie-reference">
      <i class="fas fa-film mr-2"></i>Movies
    </button>
    <button class="tab-button" data-category="series">
      <i class="fas fa-video mr-2"></i>Series
    </button>
    <button class="tab-button" data-category="templates">
      <i class="fas fa-image mr-2"></i>Templates
    </button>
  </div>

  <!-- Meme Gallery -->
  <div id="meme-gallery" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    <!-- Meme cards will be dynamically loaded -->
  </div>

  <!-- Loading State -->
  <div id="loading-state" class="text-center py-12">
    <i class="fas fa-spinner fa-spin text-4xl text-primary"></i>
    <p class="mt-4 text-gray-600">Loading memes...</p>
  </div>

  <!-- No Results State -->
  <div id="no-results" class="text-center py-12 hidden">
    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
    <h3 class="text-xl font-semibold text-gray-700 mb-2">No memes found</h3>
    <p class="text-gray-500">Try a different search term or browse by category</p>
  </div>
</section>

<!-- Toast Notification -->
<div id="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg opacity-0 transition-opacity duration-300 z-50 pointer-events-none">
  <i class="fas fa-check-circle mr-2"></i>
  <span id="toast-message">Copied to clipboard!</span>
</div>

<style>
  .tab-button {
    @apply px-6 py-3 rounded-lg font-semibold transition-all duration-200;
    @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
  }

  .tab-button.active {
    @apply bg-primary text-white hover:bg-teal-700;
  }

  .meme-card {
    @apply relative group overflow-hidden rounded-lg border-2 border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:border-primary;
  }

  .meme-card img {
    @apply w-full aspect-square object-cover;
  }

  .meme-actions {
    @apply absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3;
  }

  .meme-action-btn {
    @apply bg-white text-gray-800 hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2;
  }

  .carousel-item {
    @apply flex-shrink-0 w-48 md:w-56 cursor-pointer transition-transform hover:scale-105;
  }

  .carousel-item img {
    @apply w-full h-48 md:h-56 object-cover rounded-lg border-2 border-gray-200 hover:border-primary transition-colors;
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
  const carouselItemsPerView = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : 2;

  // Initialize the app
  document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    renderMemes();
    initTabSwitching();
    initSearch();
    startCarouselAutoplay();
  });

  // Initialize carousel with featured memes
  function initCarousel() {
    const featuredMemes = allMemes.slice(0, 20); // First 20 memes as featured
    const track = document.getElementById('carousel-track');

    featuredMemes.forEach(meme => {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      item.innerHTML = `
        <img src="${meme.url}" alt="${meme.name}" loading="lazy" />
      `;
      item.addEventListener('click', () => {
        copyToClipboard(meme.url);
      });
      track.appendChild(item);
    });

    // Setup carousel controls
    document.getElementById('carousel-prev').addEventListener('click', () => moveCarousel(-1));
    document.getElementById('carousel-next').addEventListener('click', () => moveCarousel(1));
  }

  function moveCarousel(direction) {
    const track = document.getElementById('carousel-track');
    const items = track.children;
    const maxIndex = Math.max(0, items.length - carouselItemsPerView);

    carouselIndex = Math.max(0, Math.min(maxIndex, carouselIndex + direction));
    const offset = carouselIndex * (items[0].offsetWidth + 16); // 16px gap
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

      const offset = carouselIndex * (track.children[0].offsetWidth + 16);
      track.style.transform = `translateX(-${offset}px)`;
    }, 3000);
  }

  // Render memes based on current filters
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
            <i class="fas fa-link"></i>
            <span class="hidden sm:inline">Copy</span>
          </button>
          <button onclick="downloadMeme('${meme.url}', '${meme.name}')" class="meme-action-btn">
            <i class="fas fa-download"></i>
            <span class="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Tab switching
  function initTabSwitching() {
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.dataset.category;
        searchQuery = ''; // Clear search when switching tabs
        document.getElementById('global-search').value = '';
        document.getElementById('clear-search').classList.add('hidden');
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

      clearBtn.classList.toggle('hidden', searchQuery === '');

      debounceTimer = setTimeout(() => {
        if (searchQuery !== '') {
          currentCategory = 'all'; // Search across all categories
          document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
          document.querySelector('.tab-button[data-category="all"]').classList.add('active');
        }
        renderMemes();
      }, 300);
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.classList.add('hidden');
      renderMemes();
    });

    // Keyboard shortcuts
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchQuery = '';
        clearBtn.classList.add('hidden');
        renderMemes();
      }
    });
  }

  // Copy to clipboard using modern Clipboard API
  async function copyToClipboard(imageUrl) {
    const fullUrl = window.location.origin + imageUrl;

    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast('URL copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const tempInput = document.createElement('input');
      document.body.appendChild(tempInput);
      tempInput.value = fullUrl;
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showToast('URL copied to clipboard!');
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
        showToast('Download started!');
      })
      .catch(() => {
        showToast('Download failed. Try right-click > Save Image.', 'error');
      });
  }

  // Show toast notification
  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.style.opacity = '1';
    toast.style.pointerEvents = 'auto';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.pointerEvents = 'none';
    }, 2500);
  }

  // Handle window resize for carousel
  window.addEventListener('resize', () => {
    const track = document.getElementById('carousel-track');
    if (track.children.length > 0) {
      carouselIndex = 0;
      track.style.transform = 'translateX(0)';
    }
  });
</script>

