# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

This is a zero-build static website. No npm, no bundler, no compilation step.

**Start a local server:**
```bash
python3 -m http.server 3456
```
Then open `http://localhost:3456` in a browser. The `.claude/launch.json` is configured for this command so `preview_start` works automatically.

Opening `index.html` directly in Finder also works — no server required except for map tiles (OpenStreetMap, loaded via CDN).

## Architecture

### No framework, no build step
Plain HTML + CSS + JavaScript. All JS files are loaded via `<script>` tags in dependency order. There is no module system — all functions are global.

### Script load order matters
Every HTML page loads scripts in this exact order:
```
data.js → passport.js → map.js (passport.html only) → app.js
```
`app.js` calls functions defined in the earlier files, so this order is non-negotiable.

### Page routing
Each HTML page sets `data-page` on `<body>`. `app.js` reads this attribute on `DOMContentLoaded` and calls the matching init function:
- `index` → `initIndexPage()`
- `passport` → `initPassportPage()`
- `restaurant` → `initRestaurantPage()`
- `profile` → `initProfilePage()`

### Data flow
- **`js/data.js`** — All static restaurant data (`PASSPORTS` object), XP level thresholds (`LEVELS`), and XP reward values (`XP_REWARDS`). Edit this file to add restaurants or new passport categories.
- **`js/passport.js`** — All localStorage read/write. Functions: `getVisits()`, `saveVisit()`, `getXP()`, `addXP()`, `getCustomRestaurants()`, `saveCustomRestaurant()`, `deleteCustomRestaurant()`. Nothing else should write to localStorage directly.
- **`js/map.js`** — Leaflet.js map init and pin management. `loadPizzaPins(restaurants)` accepts the merged array of built-in + custom restaurants. `flyToRestaurant(id)` animates the map to a pin by ID.
- **`js/app.js`** — All page logic, UI rendering, event wiring, and the progressive unlock flow for the restaurant check-in page.

### localStorage keys
| Key | Contents |
|---|---|
| `dmv-passport-visits` | JSON object keyed by restaurant ID → visit data (scores, date, photos as base64, wouldReturn) |
| `dmv-passport-xp` | Integer string |
| `dmv-passport-level` | Level name string |
| `dmv-passport-custom` | JSON object keyed by custom restaurant ID → restaurant data |

### Restaurant check-in flow (progressive unlock)
`restaurant.html` uses a 4-step sequential unlock. Each step is a `.step-section` div. Steps start `--locked` and become `--active` after the previous step completes. The unlock sequence is wired entirely in `setupProgressiveUnlock()` in `app.js`. If a restaurant has already been visited (`existingVisit.checkedIn`), `unlockAllSteps()` skips the flow and shows everything open.

### Custom restaurants
Users can add their own pizza places via the modal on `passport.html`. Custom restaurants are stored in localStorage under `dmv-passport-custom` and merged with built-in restaurants at render time in `initPassportPage()`. Custom restaurants without lat/lng coordinates appear in the stamp list only (not on the map). They show an ✏️ edit button on hover.

### Adding a new passport category
1. Add an entry to the `PASSPORTS` object in `data.js` with `available: true` and a `restaurants` array
2. Add category-specific `attributes` array (used for rating sliders)
3. The index page, passport map, stamp sidebar, and profile page all derive from `PASSPORTS` dynamically — no HTML changes needed

### Fonts & visual style
- `Playfair Display` — headings, passport titles
- `Inter` — body text, UI labels
- `Courier Prime` — passport aesthetic: country labels, stamp counters, monospace details
- Passport color tokens in CSS: `--passport-navy`, `--passport-gold`, `--passport-ink-red`, `--passport-ink-blue`, `--passport-page`
