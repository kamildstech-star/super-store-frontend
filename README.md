# Super Store POS Frontend

An Odoo-inspired sale screen built with Vue 3 and Tailwind CSS. Products, categories, unit precision, and PKR prices load from the Laravel/MySQL catalog. There is no hard-coded catalog fallback. Cart changes and payment preview stay in the browser; the app does not process payments or save sales.

## Run locally

1. In the paired Laravel backend, configure MySQL, run `php artisan migrate --seed`, and start Laravel on `http://127.0.0.1:8000`.
2. With Node.js 20+ from the frontend folder, run:

   ```sh
   npm ci
   npm run dev
   ```

3. Open `http://127.0.0.1:4173`. Fresh seeded data should show 16 products and a sample order totaling Rs. 375.00. Try **0.75 kg** on Red Apples with the keypad; its undiscounted line total is Rs. 240.00.

`npm run dev` builds and serves the frontend. After changing source files, restart the command and refresh. To build without starting a server, use `npm run build`.

If the screen shows a catalog error, verify `http://127.0.0.1:8000/api/pos/catalog`, then click **Retry**. The API defaults to `http://127.0.0.1:8000` when the page is on loopback; otherwise requests use the page's own origin. To use a different API URL, set `POS_API_BASE_URL` before `npm run build` and allow the frontend's origin in the backend's `POS_FRONTEND_ORIGINS`. In PowerShell, for example: `$env:POS_API_BASE_URL = 'http://127.0.0.1:8000'`. The base URL is public build configuration, so do not include secrets in it.

SKU search, category filters, cart and keypad all work on the loaded catalog. **Payment** is a preview, not checkout.
