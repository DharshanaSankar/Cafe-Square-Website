# Cafe Square website

The site is built with React and Vite. Business and menu content is kept in small data files so it can be updated without changing the page layout.

## Run and build

From the workspace root:

```sh
pnpm --filter @workspace/cafe-square run dev
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/cafe-square run build
```

## Update the content

- `src/data/business.ts` — display name, phone, WhatsApp number, address, displayed hours, and the Google Maps search text. Keep `phoneLink` in international format and `whatsappNumber` as country code plus digits.
- `src/data/menu.ts` — categories and menu items. Set a verified price in rupees when Cafe Square provides it; leave `price: null` until then. Descriptions and images are optional.
- `src/data/gallery.ts` — gallery filters and gallery image titles, categories, paths, and alt text.
- `public/images/cafe-interior.jpg` and `public/images/tea-sandwich.jpg` — illustrative placeholders. Replace these with approved Cafe Square photos using the same filenames, or update the paths in the data files.
- `index.html` — page title, search description, social preview text, and local-business structured data.

WhatsApp links open a prefilled message for the customer to review; the site does not send messages or place orders automatically. Cart totals remain marked as pending until prices are entered.

## Information to confirm before launch

- Menu prices and any approved item descriptions, ingredients, and allergen details.
- The days Cafe Square is open; the current displayed hours do not include days.
- Approved photos of the venue and dishes.
- Official social profile URLs, if those links should appear.
- The public website domain. Add its absolute homepage URL to `public/sitemap.xml` after publishing; the current sitemap is intentionally empty rather than using a guessed domain.