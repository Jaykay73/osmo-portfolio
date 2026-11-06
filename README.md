# Osmo Portfolio

A standalone, buildless photography and moving image portfolio. Fast, fully accessible, responsive, and deployable to any static hosting service including GitHub Pages.

## Live Website

- **GitHub Pages**: [https://jaykay73.github.io/osmo-portfolio/](https://jaykay73.github.io/osmo-portfolio/)
- **Live Mirror**: [https://osmo-portfolio.surge.sh](https://osmo-portfolio.surge.sh)

## Features

- **Fluid 3D Motion & Lens Vignette**: CSS 3D pointer-tracking perspective with zero heavyweight WebGL libraries.
- **Aperture Intro Sequence**: Lens iris animation on initial arrival with full `prefers-reduced-motion` compliance.
- **Interactive Lightbox Modal**: Native `<dialog>` viewer with keyboard navigation (`ArrowLeft`, `ArrowRight`, `Escape`), focus trapping, and aspect-ratio preservation.
- **Category Filtering & Pagination**: Filter by celebrations, portraits, events, and institutions with progressive lazy loading.
- **Optimized Media Pipeline**: High-efficiency WebP images and responsive thumbnails.
- **Zero Runtime Dependencies**: Pure standard HTML5, CSS3, and modern JavaScript.

## Run Locally

Requires Node.js 20 or newer. In PowerShell:

```powershell
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000). To check JavaScript syntax:

```powershell
npm.cmd run build
```

## Structure

- `dist/index.html`: Semantic HTML5 structure.
- `dist/styles.css`: Custom responsive layout, CSS variables, and 3D card tilt styling.
- `dist/content.js`: Portfolio metadata, biography, contact email, and film declarations.
- `dist/media.js`: Photography dataset and collection mappings.
- `dist/media.json`: Image dimensions, aspect ratios, and provenance records.
- `dist/app.js`: Category filter state, pagination, and accessible lightbox viewer.
- `dist/motion.js`: Parallax 3D card tilt, aperture sequence, and intersection observers.
- `dist/assets/photography/`: High-resolution WebP photography and thumbnail collections.
- `scripts/dev-server.cjs`: Lightweight zero-dependency HTTP server with range request support.
- `scripts/import-pixieset.mjs`: Automated media ingestion pipeline.
- `.github/workflows/deploy.yml`: Automated GitHub Pages deployment workflow.

## Deployment

Deploying is automated via GitHub Actions to GitHub Pages. Any push to `main` builds and deploys `dist/` directly to the live site.
