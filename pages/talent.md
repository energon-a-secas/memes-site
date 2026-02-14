---
layout: custom
title: Talent Memes
description: Self-Deprecating Work Humor
---

<section class="container mx-auto px-4 py-8">
  <div class="mb-8 text-center">
    <h2 class="text-3xl font-bold text-gray-800 mb-3">Talent Memes</h2>
    <p class="text-gray-600 text-lg">Self-deprecating work humor for the modern workplace</p>
  </div>

  <!-- Search within category -->
  <div class="max-w-xl mx-auto mb-8">
    <div class="relative">
      <input
        type="text"
        id="category-search"
        placeholder="Search talent memes..."
        class="w-full px-6 py-3 border-2 border-gray-300 rounded-full focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
      <i class="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"></i>
    </div>
  </div>

  <!-- Meme Gallery -->
  <div id="meme-gallery" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {% for image in site.static_files %}
      {% if image.path contains '/assets/images/talent/' %}
        <div class="meme-card" data-name="{{ image.name | downcase }}">
          <img src="{{ image.path | relative_url }}" alt="{{ image.name }}" loading="lazy" />
          <div class="meme-actions">
            <button onclick="copyToClipboard('{{ image.path | relative_url }}')" class="meme-action-btn">
              <i class="fas fa-link"></i>
              <span class="hidden sm:inline">Copy</span>
            </button>
            <button onclick="downloadMeme('{{ image.path | relative_url }}', '{{ image.name }}')" class="meme-action-btn">
              <i class="fas fa-download"></i>
              <span class="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      {% endif %}
    {% endfor %}
  </div>

  <!-- No Results -->
  <div id="no-results" class="text-center py-12 hidden">
    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
    <h3 class="text-xl font-semibold text-gray-700 mb-2">No memes found</h3>
    <p class="text-gray-500">Try a different search term</p>
  </div>
</section>

<!-- Toast Notification -->
<div id="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg opacity-0 transition-opacity duration-300 z-50 pointer-events-none">
  <i class="fas fa-check-circle mr-2"></i>
  <span id="toast-message">Copied to clipboard!</span>
</div>

<style>
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
</style>

<script>
  // Category search functionality
  const searchInput = document.getElementById('category-search');
  const gallery = document.getElementById('meme-gallery');
  const noResults = document.getElementById('no-results');
  const allCards = gallery.querySelectorAll('.meme-card');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    let visibleCount = 0;

    allCards.forEach(card => {
      const name = card.dataset.name;
      if (name.includes(query)) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    noResults.classList.toggle('hidden', visibleCount > 0);
  });

  // Copy to clipboard
  async function copyToClipboard(imageUrl) {
    const fullUrl = window.location.origin + imageUrl;

    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast('URL copied to clipboard!');
    } catch (err) {
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
  function showToast(message) {
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
</script>
