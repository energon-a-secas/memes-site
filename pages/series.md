---
layout: custom
title: TV Series Memes
description: TV series references for binge-watchers
---

<section class="container mx-auto px-4 py-8">
  <div class="mb-8 text-center">
    <h2 class="text-3xl font-bold text-white mb-3">TV Series Memes</h2>
    <p class="text-[#cacaca] text-lg">TV series references for dedicated binge-watchers</p>
  </div>

  <div class="max-w-xl mx-auto mb-8">
    <div class="relative">
      <input type="text" id="category-search" placeholder="Search series memes..."
        class="w-full px-6 py-3 pl-12 bg-[#0a1628] border-2 border-[rgba(0,99,229,0.3)] rounded-lg text-[#f9f9f9] placeholder-gray-500 focus:border-[#0063e5] focus:outline-none focus:ring-2 focus:ring-[rgba(0,99,229,0.3)] transition-all" />
      <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
    </div>
  </div>

  <div id="meme-gallery" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {% for image in site.static_files %}
      {% if image.path contains '/assets/images/series/' %}
        <div class="meme-card group" data-name="{{ image.name | downcase }}" onclick="openLightbox('{{ image.path | relative_url }}', '{{ image.name }}')">
          <img src="{{ image.path | relative_url }}" alt="{{ image.name }}" loading="lazy" />
          <div class="meme-overlay">
            <button onclick="event.stopPropagation(); copyMemeUrl('{{ image.path | relative_url }}')" class="meme-btn">
              <i class="fas fa-link"></i> <span class="hidden sm:inline">Copy</span>
            </button>
            <button onclick="event.stopPropagation(); downloadMemeFile('{{ image.path | relative_url }}', '{{ image.name }}')" class="meme-btn">
              <i class="fas fa-download"></i> <span class="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      {% endif %}
    {% endfor %}
  </div>

  <div id="no-results" class="text-center py-12 hidden">
    <i class="fas fa-search text-6xl text-gray-600 mb-4 block"></i>
    <h3 class="text-xl font-semibold text-gray-400 mb-2">No memes found</h3>
    <p class="text-gray-500">Try a different search term</p>
  </div>
</section>

<style>
  .meme-card { position: relative; overflow: hidden; border-radius: 0.5rem; border: 2px solid rgba(0, 99, 229, 0.3); background: #0a1628; cursor: pointer; transition: all 0.3s; }
  .meme-card:hover { border-color: #ff8c00; box-shadow: 0 0 20px rgba(255, 140, 0, 0.3); transform: scale(1.02); }
  .meme-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .meme-overlay { position: absolute; inset: 0; background: rgba(4, 7, 20, 0.8); opacity: 0; transition: opacity 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
  .meme-card:hover .meme-overlay { opacity: 1; }
  .meme-btn { background: #0a1628; border: 2px solid #0063e5; color: #f9f9f9; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
  .meme-btn:hover { background: #0063e5; color: white; box-shadow: 0 0 15px rgba(0, 99, 229, 0.4); }
</style>

<script>
  const searchInput = document.getElementById('category-search');
  const gallery = document.getElementById('meme-gallery');
  const noResults = document.getElementById('no-results');
  const allCards = gallery.querySelectorAll('.meme-card');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    let visibleCount = 0;
    allCards.forEach(card => {
      const name = card.dataset.name;
      if (name.includes(query)) { card.style.display = 'block'; visibleCount++; }
      else { card.style.display = 'none'; }
    });
    noResults.classList.toggle('hidden', visibleCount > 0);
  });
</script>
