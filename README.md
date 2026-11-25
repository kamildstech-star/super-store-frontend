# Super Store POS Frontend

Odoo-inspired Vue 3 + Tailwind POS. The first page is **Login**; public sign-up is not available. Once signed in, the top bar shows page icons, your profile and a separate **Log out** button. The monitor icon returns to the register.

## Run

Start the matching Laravel backend on `http://127.0.0.1:8000`. Use its README to migrate your MySQL database and create an account with `php artisan pos:create-user you@example.com`. Then run:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. The dev server builds the app and forwards POS API requests to Laravel on port 8000. Restart it after source changes. Production should serve the built files over HTTPS with the API at the same origin.

## Try

- Use the top-bar icons to open Products, Categories, Units, and Suppliers. Create, search, and edit records; archive products or delete unused categories, units and suppliers.
- Leave the product's **Internal code** blank to generate a random unused four-digit value; edit it later if needed. Barcode is separate.
- Focus **Scan barcode** and use a keyboard-mode scanner set to send Enter, or enter a code manually and press Enter. A unique exact match adds to the cart even if another category is selected. Repeated scans increase quantity.
- Open **Payment** and choose **Save order** to record the order. The **Orders** page lists saved orders and their line details. This does not collect payment or change inventory.
