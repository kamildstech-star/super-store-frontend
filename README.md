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
- Add, replace or remove an optional **Product image** in the Add/Edit popup. The preview is local until saved. Products shows a thumbnail; POS cards display the uploaded photo or the default illustration.
- Leave the product's **Internal code** blank to generate a random unused four-digit value; edit it later if needed. Barcode is separate.
- Open **Scan barcode** and scan with a keyboard-mode scanner set to send Enter, or type the full barcode and press Enter. Only an exact barcode match adds to the cart, even if another category is selected. Repeated scans increase quantity subject to stock. In the regular search, Enter can add one exact code match; click a product for partial name matches.
- Open **Inventory** to enter opening stock, receive supplier stock, adjust quantities and record damage. Set a low-stock threshold per product; **Low stock only** filters the list. Use **Product status** to find active or archived products. Archived products stay off the register but retain the balance and movement history; only stock reductions are allowed until reactivated.
- In the product Add/Edit popup, focus **Barcode** and scan with a keyboard-mode scanner. It fills the barcode only and the scanner's Enter does not submit the form. Other product details are entered manually.
- On the register, press Down to move from search to categories and then products; Up returns. Left from the first product column enters the cart when it has items; Down from its last row reaches the keypad, and Right returns toward products. Left on a cart line focuses its trash button. Enter or Space activates the focused button. Left and Right still move the caret in a nonempty search field.
- The register checks available stock before adding items or increasing quantity. A blocked attempt leaves the cart unchanged and shows an alert. Final checkout checks stock again on the server, since another cashier may have sold it.
- Up from the register search enters the top bar. Left/Right moves across icons, Enter activates one and Down returns to the page.
- An unsaved cart survives refresh in the same tab and sign-in session. This does not auto-save edits to a previously saved order. Use **Park order** to save a server draft without reserving or deducting stock, then reopen it from Orders. Signing out clears the working cart.
- On phones, swipe the page icons in the top bar horizontally if some are off screen.
- **Cash checkout:** Enter the cash received in PKR or choose **Exact amount**. The register displays change, and Laravel rejects a short payment. Card and bank transfer are recorded after external confirmation; the POS does not process them.
- **Receipt:** A finalized sale opens its receipt. Choose **Print receipt** to use the browser print dialog (select your receipt printer/paper size and disable browser headers and footers if enabled). Reopen any finalized receipt using the receipt icon in **Orders**. Older cash receipts do not display tender or change that was never recorded.
- **Retry:** If a save is not confirmed, use **Resolve previous save** and **Retry original submission**. The working cart is locked until the original submission has a known result. The same-tab, same-session recovery also works after a refresh; it is not offline checkout. If the login session has ended, check Orders before repeating a sale.
- In **Orders**, the pencil edits draft orders only. Click a row for read-only order details, or the eye icon for a quick preview.
