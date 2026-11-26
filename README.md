# Super Store POS Frontend

Odoo-inspired Vue 3 + Tailwind POS. The first page is **Login**; public sign-up is not available. Once signed in, the top bar uses compact, borderless icons with tooltips for pages, profile and **Log out**. Register shortcuts and profile open in dropdown panels; press Escape or click outside to close them. The monitor icon returns to the register.

## Run

Start the matching Laravel backend on `http://127.0.0.1:8000`. Use its README to migrate your MySQL database and create an account with `php artisan pos:create-user you@example.com`. Then run:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. The dev server builds the app and forwards POS API requests to Laravel on port 8000. Restart it after source changes. Production should serve the built files over HTTPS with the API at the same origin. UI icons use [Remix Icon](https://github.com/Remix-Design/RemixIcon), bundled from the local SVG subset in `src/vendor/remixicon`. No Remix Icon npm package or CDN is needed.

## Try

Management and Orders tables load one server page at a time. Search filters the whole table before paging; use Previous/Next or change Rows per page.

- Use the top-bar icons to open Products, Categories, Units, and Suppliers. Create, view and edit records in popups. In the product form, search Category, Unit or Supplier by name, code or contact details. Use the arrow keys and Enter to select an option; Escape closes the list. Results float above the form without moving other fields. Archive products or delete unused categories, units and suppliers with a separate confirmation.
- Set **Retail Price** (regular shelf price) and **Sale Price** (default checkout price), both in PKR. Products shows both prices; the register uses Sale Price.
- Leave the product's **Internal code** blank to generate a random unused four-digit value; edit it later if needed. Barcode is separate.
- Focus **Scan barcode** and use a keyboard-mode scanner set to send Enter, or enter a code manually and press Enter. A unique exact match adds to the cart even if another category is selected. Repeated scans increase quantity.
- Open **Inventory** to enter opening stock, receive supplier stock, adjust quantities and record damage. Set a low-stock threshold per product; **Low stock only** filters the list. Stock history shows who recorded each change and its reason.
- Open **Payment** and choose **Save draft** to save without changing stock. To finalize, collect the payment outside the app, select Cash, Card, or Bank transfer and choose **Finalize sale**. This records the method and deducts stock, but does not process a payment.
- In **Orders**, the pencil edits draft orders only. Click a row for read-only order details, or the eye icon for a quick preview.
