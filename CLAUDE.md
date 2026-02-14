# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based static website deployed on GitHub Pages that serves as a "Meme Delivery Platform" - a library of memes organized by category (Talent, Simpsons, Anime, Movies, Series, Templates). Users can browse memes by category and click images to copy their URLs to the clipboard.

## Architecture

### Site Structure

The site uses the Jekyll Cayman theme with custom layouts and styling:

- **_config.yml**: Site configuration defining title ("Meme Delivery Platform"), theme (jekyll-theme-cayman), and kramdown settings
- **_layouts/custom.html**: Custom layout extending Cayman theme with conditional back button navigation (`{% if page.url != "/" %}`)
- **index.md**: Landing page with multiple image-text sections linking to category pages
- **pages/**: Category-specific gallery pages (talent.md, simpsons.md, anime.md, etc.)
- **assets/css/style.scss**: Custom styles extending Cayman theme, including gallery grid, popup messages, and responsive layouts
- **assets/images/**: Image assets organized by category subdirectories

### Page Template Pattern

All category pages follow a consistent structure:

```markdown
---
layout: custom
title: Category Name
description: Category description
---

<div class="gallery-container">
  {% for image in site.static_files %}
    {% if image.path contains '/assets/images/CATEGORY/' %}
      <img src="{{ image.path | relative_url }}" alt="{{ image.name }}" onclick="copyToClipboard('{{ image.path | relative_url }}')">
    {% endif %}
  {% endfor %}
</div>

<div id="popup-message" class="popup-message">Copied to clipboard!</div>

<script>
  function copyToClipboard(imageUrl) {
    // Creates full URL and copies to clipboard
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = window.location.origin + imageUrl;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    const popup = document.getElementById('popup-message');
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 2000);
  }
</script>
```

Key implementation details:
- Uses Liquid templating to iterate through `site.static_files`
- Filters images by path matching the category subdirectory
- JavaScript `copyToClipboard()` function creates absolute URL and copies it
- Popup message shows confirmation for 2 seconds

### Image Organization

Images are stored in `assets/images/` with subdirectories for each category:
- `talent/`: Work/talent-related humor memes
- `simpsons/`: Simpsons reference memes
- `anime/`: Anime-related memes
- `movie-reference/`: Movie reference memes
- `series/`: TV series memes (non-anime)
- `templates/`: Blank meme templates for creating new memes
- Additional subdirectories: `general/`, `country/`, `other-references/`

The Liquid loop `{% if image.path contains '/assets/images/CATEGORY/' %}` automatically displays any images added to the corresponding directory.

## Development Commands

### Local Development

```bash
# Install Jekyll and dependencies (if not using GitHub Pages environment)
bundle install

# Serve site locally with live reload
bundle exec jekyll serve

# Serve with drafts visible
bundle exec jekyll serve --drafts

# Build site to _site/ directory
bundle exec jekyll build
```

Note: This project is designed for GitHub Pages deployment, which handles Jekyll building automatically. Local development requires Ruby and Bundler installed.

### Adding New Content

To add a new meme:
1. Place image file in appropriate category directory under `assets/images/CATEGORY/`
2. No code changes needed - the Liquid loop will automatically include it

To add a new category:
1. Create new subdirectory in `assets/images/`
2. Create new page in `pages/` following the template pattern above
3. Update `index.md` to add a new image-text section linking to the new page
4. Ensure the Liquid filter path matches: `{% if image.path contains '/assets/images/NEW_CATEGORY/' %}`

## Styling and Layout

Custom CSS is defined in `assets/css/style.scss` and extends the Cayman theme:

- **Gallery layout**: CSS Grid with `repeat(auto-fit, minmax(100px, 1fr))` for responsive image galleries
- **Landing page sections**: Two-column grid layout (.image-text-section) with alternating image/text positioning
- **Popup notifications**: Fixed position popup at bottom-center with fade in/out transitions
- **Responsive design**: Collapses to single column layout on screens < 768px wide
- **CTA buttons**: Yellow buttons (.cta-button) with hover effects

## Key Conventions

- All pages use `layout: custom` in front matter
- Image filtering relies on path string matching - ensure image paths follow the `/assets/images/CATEGORY/` pattern
- The back button in custom.html conditionally displays based on `page.url != "/"`
- Copy-to-clipboard functionality uses `document.execCommand('copy')` (deprecated but widely supported)
