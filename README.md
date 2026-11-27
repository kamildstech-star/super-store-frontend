# Super Store POS Frontend

Odoo-inspired Vue 3 + Tailwind POS. The first page is **Login**; public sign-up is not available. Once signed in, the top bar uses compact, borderless icons with tooltips for pages, profile and **Log out**. Register shortcuts and profile open in dropdown panels; press Escape or click outside to close them. The monitor icon returns to the register.

## Run

Start the matching Laravel backend on `http://127.0.0.1:8000`. Use its README to migrate your MySQL database and create an account with `php artisan pos:create-user you@example.com`. Use Node.js 22.12+ (or 20.19+ on the 20.x line), then run:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. The dev server builds the app and forwards POS API requests to Laravel on port 8000. Restart it after source changes. Production should serve the built files over HTTPS with the API at the same origin. UI icons use [Remix Icon](https://github.com/Remix-Design/RemixIcon). Most are in `src/vendor/remixicon`; toast icons are bundled locally at build time. No icon CDN is required.

## Notifications

The existing Vue frontend uses [Nuxt UI Toast](https://ui.nuxt.com/docs/components/toast); it does not require a Nuxt server. Use the shared `notify(level, message, title, key)` service from `src/notifications.js` for transient feedback. The single toast viewport works on desktop/mobile and moves into any open native dialog. Use a stable key for events that repeat quickly, such as barcode or stock checks. Keep field validation, loading indicators, and payment/refund recovery actions in their forms rather than in expiring toasts.

## Try

Management and Orders tables load one server page at a time. Search filters the whole table before paging; use Previous/Next or change Rows per page.

- Use the top-bar icons to open Products, Categories, Units, and Suppliers. Create, view and edit records in popups. In the product form, search Category, Unit or Supplier by name, code or contact details. Use the arrow keys and Enter to select an option; Escape closes the list. Results float above the form without moving other fields. Archive products or delete unused categories, units and suppliers with a separate confirmation.
- Set **Retail Price** (regular shelf price) and **Sale Price** (default checkout price), both in PKR. Products shows both prices; the register uses Sale Price.
- Add, replace or remove an optional **Product image** in the Add/Edit popup. The preview is local until saved. Products shows a thumbnail; POS cards display the uploaded photo or the default illustration.
- Leave the product's **Internal code** blank to generate a random unused four-digit value; edit it later if needed. Barcode is separate.
- Open **Scan barcode** and scan with a keyboard-mode scanner set to send Enter, or type the full barcode and press Enter. Only an exact barcode match adds to the cart, even if another category is selected. Repeated scans increase quantity subject to stock. In the regular search, Enter can add one exact code match; click a product for partial name matches.
- Open **Inventory** to enter opening stock, adjust quantities and record damage. Set a low-stock threshold per product; **Low stock only** filters the list. Use **Product status** to find active or archived products. Archived products stay off the register but retain the balance and movement history; only stock reductions are allowed until reactivated.
- In the product Add/Edit popup, focus **Barcode** and scan with a keyboard-mode scanner. It fills the barcode only and the scanner's Enter does not submit the form. Other product details are entered manually.
- On the register, press Down to move from search to categories and then products; Up returns. Left from the first product column enters the cart when it has items; Down from its last row reaches the keypad, and Right returns toward products. Left on a cart line focuses its trash button. Enter or Space activates the focused button. Left and Right still move the caret in a nonempty search field.
- The register checks available stock before adding items or increasing quantity. A blocked attempt leaves the cart unchanged and shows an alert. Final checkout checks stock again on the server, since another cashier may have sold it.
- Up from the register search enters the top bar. Left/Right moves across icons, Enter activates one and Down returns to the page.
- An unsaved cart survives refresh in the same tab and sign-in session. This does not auto-save edits to a previously saved order. Use **Park order** to save a server draft without reserving or deducting stock, then reopen it from Orders. Signing out clears the working cart.
- On phones, swipe the page icons in the top bar horizontally if some are off screen.
- **Cash checkout:** Enter the cash received in PKR or choose **Exact amount**. The register displays change, and Laravel rejects a short payment. Cash is the only payment option for new sales. Older receipts retain their original payment method.
- **Receipt:** A finalized sale opens its receipt. Choose **Print receipt** to use the browser print dialog (select your receipt printer/paper size and disable browser headers and footers if enabled). Reopen any finalized receipt using the receipt icon in **Orders**. Older cash receipts do not display tender or change that was never recorded.
- **Retry:** If a save is not confirmed, use **Resolve previous save** and **Retry original submission**. The working cart is locked until the original submission has a known result. The same-tab, same-session recovery also works after a refresh; it is not offline checkout. If the login session has ended, check Orders before repeating a sale.
- In **Orders**, the pencil edits draft orders only. Click a row for read-only order details, or the eye icon for a quick preview.

## Daily Sales Report

Open **Reports** in the top bar. Choose Today, Yesterday or a custom date range (Pakistan time), optionally select a cashier, and apply the filters. Summary and payment totals cover all matching finalized orders even when the details are paginated. Drafts are excluded. Use the order or receipt icon to review or print a sale. Historical non-cash payment methods remain visible. The summary also shows cash refunds and net sales after refunds. Switch to **Refunds** for a paginated list and printable receipt. A refund belongs to its posting date and posting cashier. Net sales are not drawer cash or profit.


## Returns and cash drawer

1. Pull both repositories and run `php artisan migrate` in Laravel before running the updated frontend.
2. In **Orders**, choose the Returns icon on a finalized cash sale. Enter the returned quantities and reason. Choose **Restock** only for resellable eligible items. **Review refund** shows what the server will record before you confirm. Refund receipts can be reprinted from the order's refund history or Reports.
3. Open **Cash drawer** from the top bar and enter the counted opening cash. Tracking begins with that first shift. Use **Cash in/out** only for manual movements outside sales or refunds. Select **Start closing count**, enter actual cash, and confirm. The saved close shows the shortage, overage or match. Open a new shift before the next checkout or cash refund once tracking has started.
4. If a cash write is not confirmed, leave the tab open and click **Retry original cash action**. The retry reference is saved in the same tab. Confirm if cash was physically handed over before paying again. Staff permissions are unchanged.

### Daily order numbers

Run the Laravel migration before using the updated frontend. The register shows **New order** until the first successful save. Then the order and receipt show a four-digit sequence that starts at `#0001` each day at midnight Pakistan time. An older draft keeps its number and original day when reopened or paid. In Orders, search by number or combine date and number, e.g. `2026-11-27 #0001`. Older receipts keep their existing labels.

## Purchase Receiving

1. Pull both repositories, run `php artisan migrate` in the backend, then restart the frontend.
2. In **Products**, use Add/Edit to set an optional **Preferred supplier**. The product table shows the link and can be filtered by supplier; **Suppliers** shows the number of linked products.
3. Open **Purchases** from the top bar or **Purchase Receiving** from Inventory. Choose **Receive stock**, select the actual supplier, and pick products by name, barcode, or product code. Products linked to that supplier appear first. Other active products can still be received without changing their preferred supplier.
4. Enter received quantity and per-unit cost for each product, and optionally the supplier invoice reference and a note. **Post receipt** increases stock immediately. Open the saved receipt from the supplier-filtered history or from Inventory's stock history.
5. If the post is not confirmed, retry the original receipt in the same tab instead of entering it again. Stock is posted even if the optional payment is left off.

## Customers and receipt display

Use **Customers** in the top bar to create, view, edit, archive, and search customer records. From the register, open **Customer** to search the saved directory by name, phone, or email, or use **Add new customer** to save and select one without leaving the sale. Choose **No customer** to clear the selection. A sale never requires a customer.

The sales receipt keeps a blank Customer value for an unassigned sale, omits Cashier, and displays a compact date and time on one line in Pakistan time. Existing orders keep their saved names. This release requires the matching backend migration.

## Store Settings

Open the **Settings** gear in the top bar. Set the store name and optionally the address, phone, and a receipt footer. The live preview does not change saved settings until you select **Save settings**. New sales and refund receipts use the saved details; old receipts keep their original store identity. Currency (PKR) and timezone (Asia/Karachi) are read-only. Use the matching backend migration before starting the frontend.

### Receipt paper size

In **Settings → Receipt paper size**, choose **58 mm** or **80 mm**, check the preview, and save. This store-wide default applies to sale and refund printing and reprints after reload. It changes the layout, not the recorded sale, refund, or original receipt brand. Choose the same stock size in the browser/printer driver; the POS does not set driver media or a fixed roll length. Test the fit on the actual printer before going live. Run the matching backend migration to enable the setting.

### Low-stock alerts

The top-bar bell shows the number of active products at or below their inventory threshold. The count includes out-of-stock products, and the badge turns red if any are out of stock. The bell opens **Inventory** filtered to **Low stock only** and **Active only** without changing the working cart. Set thresholds in Inventory. The badge updates after stock-changing actions and roughly once a minute while the tab is visible; returning to the tab refreshes it too. Alerts are in-app only.

### Supplier payments

In **Purchases → Receive stock**, use **Add payment (optional)** for an amount already paid at receiving. Open a purchase receipt to see its total, paid and outstanding amounts, status, and payment history. **Record payment** adds a later installment. Choose **From cash drawer** only when the money came out of the current open shift; the app records the cash-out automatically. Choose **Outside cash drawer** otherwise. Do not also add a manual cash-out for the same payment.

In **Suppliers**, use the cash icon for the supplier's tracked balance and payment history. Older receipts show **Not tracked**, not zero due. They are excluded from these totals and need separate reconciliation. If posting is not confirmed, retry the original entry from the same browser tab and check physical handoff before paying again.
