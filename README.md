# Copper & Clove — Digital Menu Website

A fast, mobile-first restaurant website built for QR-code menu browsing. Static HTML/CSS/JS — no backend, no database, no build step.

```
restaurant-website/
├── index.html          ← the entire page structure
├── css/
│   └── style.css       ← all styling & design tokens
├── js/
│   ├── app.js           ← page logic (search, filters, modal)
│   └── menu.json         ← ALL menu content lives here
├── images/               ← food photos / placeholders + logo + hero art
├── icons/
│   └── sprite.svg        ← all UI icons in one file
└── README.md
```

---

## 1. How to edit the menu (the only file you need)

Open **`js/menu.json`**. Everything on the site — restaurant details, categories, and every dish — comes from this one file. You never need to touch `index.html`, `app.js`, or the CSS to update the menu.

### Editing restaurant details
At the top of the file, the `restaurant` object controls the name, tagline, address, phone, WhatsApp number, email, hours, map link, and social URLs shown across the whole site (hero stats, footer, WhatsApp button, etc).

```json
"restaurant": {
  "name": "Copper & Clove",
  "phone": "+91 98765 43210",
  "whatsapp": "919876543210",   ← digits only, country code first, no + or spaces
  ...
}
```

### Adding a new menu item
Copy an existing item block inside `"items"` and edit the fields:

```json
{
  "id": "s04",                          ← must be unique across the whole file
  "name": "Grilled Halloumi Skewers",
  "category": "starters",               ← must match one of the "categories" ids below
  "price": 250,
  "description": "One or two sentences shown on the card and in the popup.",
  "image": "images/starter-halloumi.svg",  ← path to the item's photo
  "ingredients": ["Halloumi", "Bell pepper", "Olive oil", "Oregano"],
  "tags": ["starters", "vegetarian", "grilled"],
  "veg": true,
  "available": true,
  "spiceLevel": 1,                      ← 0 = none, 1 = mild, 2 = medium, 3 = hot
  "prepTime": "12 min"
}
```

- Drop your own photo into `/images` (ideally a square image, at least 800×800px, JPG or WEBP for real photos) and point `"image"` at it.
- Set `"available": false` to grey out an item and mark it "Currently Unavailable" without deleting it — handy for 86'd items.
- Save the file. That's it — refresh the site and the new dish appears automatically in the grid, in search, and under its category filter.

### Adding a new category
Add an entry to the `"categories"` array near the top:

```json
{ "id": "salads", "label": "Salads", "icon": "salad" }
```

Then set `"category": "salads"` on any item you want to appear under it. A new filter chip appears automatically — no code changes required.

### Removing an item
Delete its whole `{ ... }` block from `"items"`. Make sure you remove the trailing comma correctly so the file stays valid JSON (use a JSON validator like [jsonlint.com](https://jsonlint.com) if you're unsure — a single misplaced comma will stop the whole menu from loading).

---

## 2. Replacing placeholder images

Every dish currently uses a generated placeholder graphic (a simple monogram on a color panel) so the site works out of the box. To swap in real photography:

1. Add your image file to `/images` (square crop recommended, compressed to under ~300KB for fast loading on mobile data).
2. Update the `"image"` path for that item in `menu.json`.
3. Do the same for `images/logo.svg` (your logo) and `images/hero.svg` (the homepage banner) if you want custom artwork there too — any image format works, just update the `src` in `index.html`.

---

## 3. Testing locally

Because the site loads `menu.json` via `fetch()`, opening `index.html` directly by double-clicking it will fail in some browsers (they block local file requests for security). Instead, serve the folder locally:

**Python (built into macOS/Linux, and Windows with Python installed):**
```
cd restaurant-website
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**VS Code:** install the "Live Server" extension, right-click `index.html`, and choose "Open with Live Server."

---

## 4. Deployment (all free, all static hosting — no backend needed)

### GitHub Pages
1. Create a new GitHub repository and push the contents of this folder to it.
2. Go to **Settings → Pages**.
3. Under "Source," choose the `main` branch and `/root`, then save.
4. Your site goes live at `https://<your-username>.github.io/<repo-name>/`.

### Netlify
1. Go to [app.netlify.com](https://app.netlify.com) and log in.
2. Drag and drop the entire `restaurant-website` folder onto the "Sites" dashboard.
3. Netlify deploys it instantly and gives you a live URL (you can set a custom subdomain in Site Settings).

### Cloudflare Pages
1. Go to the Cloudflare dashboard → **Workers & Pages → Create → Pages**.
2. Choose "Upload assets" and upload the folder (or connect a GitHub repo for auto-deploys on every push).
3. Deploy — Cloudflare gives you a `*.pages.dev` URL.

### Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and import the project folder or connected repo.
2. Leave the build settings blank (it's a static site — no framework, no build command).
3. Deploy.

Any of these give you an HTTPS URL — use that URL to generate your QR code.

---

## 5. Generating the QR code

Once deployed, paste your live URL into any QR generator (e.g. [qr-code-generator.com](https://www.qr-code-generator.com) or the free generator built into Canva) and print it on your table cards, banners, or packaging. Scanning it opens the site directly to the homepage, and a tap on "View Full Menu" jumps straight into the searchable menu grid.

---

## 6. Notes on how the site is built

- **No hardcoded menu content.** `index.html` only contains structural placeholders; `js/app.js` renders every category chip and menu card from `js/menu.json` at runtime.
- **Search & filters run entirely client-side** — instant, no page reloads, no server required.
- **Images use `loading="lazy"`** so only visible photos load first, keeping first paint fast on mobile data.
- **Icons are a single SVG sprite** (`icons/sprite.svg`) referenced with `<use>`, so the whole icon set is one small cacheable file instead of dozens of requests.
- **Fully responsive**, tested down to small phone widths, with a sticky search/filter bar so it stays reachable while scrolling a long menu.
- **Accessible by default:** keyboard-operable cards and modal, visible focus states, `aria-live` region on search results, and `prefers-reduced-motion` support.

If you want to extend the site later (a reservations page, a loyalty page, an online-ordering integration, etc.), just add a new `.html` file that includes the same `css/style.css` and reuses the nav/footer markup — the menu logic in `app.js` won't need to change.
