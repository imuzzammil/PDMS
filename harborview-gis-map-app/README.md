# Harborview Explorer — GIS Map App

A responsive, mobile-first GIS-style map demonstration built with **HTML, CSS, JavaScript, Leaflet**, and **OpenStreetMap**.

## Features

- Interactive, zoomable map with real OpenStreetMap basemap tiles
- Fictional sample points of interest with custom teal/green/orange map pins
- Feature selection and information card
- Filter buttons for parks, culture, and cafés
- Search by place name using the OpenStreetMap Nominatim service
- Search by latitude/longitude coordinates
- Optional browser geolocation (requires user permission and HTTPS or localhost)
- Directions link to OpenStreetMap
- Responsive layout designed to look like a mobile mapping app

## Run locally

This is a static website. Open `index.html` in a browser. For best results, run a local static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy on GitHub Pages or Vercel

Upload the project folders and files while preserving this structure:

```text
harborview-gis-map-app/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── app.js
└── assets/
    ├── favicon.svg
    └── mobile-mockup-preview.png
```

### Vercel
1. Push these files to a GitHub repository.
2. Import the repository at https://vercel.com/new
3. Choose **Other** as framework preset.
4. Leave build command and output directory blank.
5. Deploy.

### GitHub Pages
In the repository, open **Settings → Pages**, select the main branch and root folder, and save.

## Data, tiles, and attribution

- The named points of interest in this demo are **fictional sample data**, not real businesses or verified locations.
- The basemap uses OpenStreetMap tiles. Keep the visible attribution in the lower-right map corner. See:
  - https://www.openstreetmap.org/copyright
  - https://operations.osmfoundation.org/policies/tiles/
- Place-name search uses the public Nominatim API. It is intended for light, interactive use; do not use it for bulk geocoding or send automated high-volume requests. See:
  - https://operations.osmfoundation.org/policies/nominatim/
- Leaflet is loaded from the unpkg CDN. A network connection is required for the library, map tiles, and place search.

## Portfolio note

This is a front-end demo project. It demonstrates map UI, map interaction, geocoding, filtering, and geolocation. It does not represent a production GIS backend or official navigation service.
