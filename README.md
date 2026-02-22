# Meme Delivery Platform

> Your go-to memes and references, always within reach.

A Jekyll-based static site deployed on GitHub Pages that serves as a browsable meme library organized by category. Users can browse, search, copy image URLs, and copy images directly to the clipboard.

---

## Features

- **Category galleries** — Memes organized into 11 categories (Talent, Simpsons, Anime, Movies, Series, Templates, General, Country, Mood, Other References, Games)
- **Auto-loading images** — Any image dropped into a category folder is automatically picked up via Liquid's `site.static_files` loop (no code changes required)
- **Search** — Per-category search filter by filename
- **Lightbox** — Click any meme to open a full-size overlay
- **Copy URL** — Copies the absolute image URL to the clipboard
- **Copy Image** — Copies the image bitmap directly to the clipboard (via Canvas + Clipboard API)
- **Download** — Downloads the image file to the user's device
- **Arcade aesthetic** — Dark CRT theme with scanlines, pixel fonts (Press Start 2P / VT323), and coin-insert animation on the main page
- **Responsive** — Grid layout adapts from 2 columns (mobile) to 6 columns (desktop)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Site generator | [Jekyll](https://jekyllrb.com/) |
| Hosting | GitHub Pages |
| Styling | Tailwind CSS CDN + custom SCSS |
| Fonts | Google Fonts — Press Start 2P, VT323 |
| Icons | Font Awesome 6 |
| Templating | Liquid |

---

## Project Structure

```
talent/
├── _layouts/
│   └── custom.html          # Shared dark-theme layout (lightbox, toast, shared JS)
├── assets/
│   ├── css/
│   │   └── style.scss       # Custom styles extending the Cayman theme
│   └── images/
│       ├── talent/
│       ├── simpsons/
│       ├── anime/
│       ├── movie-reference/
│       ├── series/
│       ├── templates/
│       ├── general/
│       ├── country/
│       ├── mood/
│       ├── other-references/
│       └── games/
├── pages/
│   ├── talent.md
│   ├── simpsons.md
│   ├── anime.md
│   ├── movie.md
│   ├── series.md
│   ├── templates.md
│   ├── general.md
│   ├── country.md
│   ├── mood.md
│   ├── other-references.md
│   └── games.md
├── index.md                 # Standalone arcade landing page
├── _config.yml
├── Gemfile
└── README.md
```

---

## Local Development

**Prerequisites:** Ruby, Bundler

```bash
# Install dependencies
bundle install

# Serve with live reload at http://localhost:4000
bundle exec jekyll serve

# Build to _site/
bundle exec jekyll build
```

---

## Adding Content

### Add a meme to an existing category

Drop the image file into the corresponding directory:

```
assets/images/<category>/your-image.png
```

Supported formats: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`

No code changes needed — the Liquid loop picks it up automatically on the next build.

### Add a new category

1. Create the image directory:
   ```
   assets/images/<new-category>/
   ```

2. Create the page at `pages/<new-category>.md` using the template below.

3. Add a button for the new category on `index.md`.

**Page template:**

```markdown
---
layout: custom
title: Category Name
description: Short description
---

<section class="container mx-auto px-4 py-8">
  <div id="meme-gallery" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {% for image in site.static_files %}
      {% if image.path contains '/assets/images/<new-category>/' %}
        <div class="meme-card group" data-name="{{ image.name | downcase }}"
             onclick="openLightbox('{{ image.path | relative_url }}', '{{ image.name }}')">
          <img src="{{ image.path | relative_url }}" alt="{{ image.name }}" loading="lazy" />
          <div class="meme-overlay">
            <button onclick="event.stopPropagation(); copyMemeUrl('{{ image.path | relative_url }}')" class="meme-btn">
              <i class="fas fa-link"></i> Copy
            </button>
            <button onclick="event.stopPropagation(); copyImageFromUrl('{{ image.path | relative_url }}')" class="meme-btn meme-btn-img">
              <i class="fas fa-image"></i> Copy Image
            </button>
          </div>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>
```

---

## Deployment

The site deploys automatically to GitHub Pages on every push to `main`. No manual build step required.

---

## License

Internal use only.
