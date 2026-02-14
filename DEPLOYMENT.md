# Deployment & Testing Guide

## Local Development

### Requirements
- Ruby 3.0+
- Bundler

### Setup & Run

```bash
# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Visit http://localhost:4000/talent
```

### Alternative: Docker (if Ruby version issues)

```bash
docker run -it --rm -v "$PWD":/usr/src/app -p 4000:4000 jekyll/jekyll jekyll serve --force_polling
```

## GitHub Pages Deployment

This site is configured for GitHub Pages. Simply push to the main branch:

```bash
git add .
git commit -m "Modernize meme delivery platform"
git push origin main
```

GitHub Pages will automatically build and deploy the site.

## Testing Checklist

### Homepage
- [ ] Featured memes carousel displays 20 memes
- [ ] Carousel auto-advances every 3 seconds
- [ ] Manual carousel navigation (prev/next) works
- [ ] Global search filters memes across all categories
- [ ] Search clears with Escape key or X button
- [ ] Tab switching between categories works smoothly
- [ ] All category icons display correctly

### Meme Cards
- [ ] Images load with lazy loading
- [ ] Hover shows action buttons (Copy URL, Download)
- [ ] Copy URL copies full absolute URL to clipboard
- [ ] Download button downloads the image file
- [ ] Toast notifications appear for actions
- [ ] Cards have consistent sizing (aspect-ratio)
- [ ] Borders and rounded corners display properly

### Category Pages
- [ ] Each category page has search within category
- [ ] Meme cards display with modern design
- [ ] Copy and Download buttons work
- [ ] Back button in header returns to homepage
- [ ] YouTube link opens @EnergonHQ channel

### Responsive Design
- [ ] Mobile (< 768px): 2 columns gallery, collapsible carousel
- [ ] Tablet (768-1024px): 3-4 columns gallery
- [ ] Desktop (> 1024px): 5-6 columns gallery
- [ ] All text is readable on all screen sizes
- [ ] Touch gestures work on mobile

### Performance
- [ ] Lighthouse score > 90 for Performance
- [ ] Images load progressively (lazy loading)
- [ ] No layout shifts (CLS < 0.1)
- [ ] Search debouncing prevents excessive filtering
- [ ] Smooth animations (no jank)

### SEO
- [ ] Meta tags present in <head>
- [ ] Structured data (JSON-LD) present
- [ ] robots.txt accessible
- [ ] sitemap.xml generates correctly
- [ ] Open Graph tags for social sharing
- [ ] Alt text on all images

### Accessibility
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] ARIA labels present on interactive elements
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader compatible

## Known Limitations

- **Browser Clipboard API**: Copy URL feature requires HTTPS or localhost. On HTTP sites, falls back to legacy document.execCommand()
- **Download Feature**: Some browsers may prompt for download permission
- **Carousel Auto-play**: Pauses when user interacts with carousel controls

## Performance Tips

- Optimize images before adding (use WebP, compress to < 200KB)
- Keep image dimensions consistent (recommended: 800x800px)
- Limit featured carousel to 20-30 memes maximum

## Troubleshooting

**Issue**: Tailwind classes not working
- **Fix**: Clear browser cache, Tailwind CDN should load from <head>

**Issue**: Memes not displaying in category
- **Fix**: Ensure images are in correct `/assets/images/CATEGORY/` path

**Issue**: Search not working
- **Fix**: Check browser console for JavaScript errors, ensure meme data loads

**Issue**: Clipboard permission denied
- **Fix**: Site must be on HTTPS or localhost for Clipboard API

## Support

For issues or questions:
- Check CLAUDE.md for project documentation
- Review Jekyll build logs on GitHub Pages
- Verify all paths match the baseurl: `/talent`
