# POS Sale Screen

An Odoo-inspired, frontend-only register demo. Vue 3 powers the screen and Tailwind CSS styles it. There is no Laravel/MySQL dependency, stock mutation, payment processing or persistent checkout.

## Run locally

Requires Node.js 20+ and npm. From this directory:

```sh
npm ci
npm run build
npx --yes http-server dist
```

Open the URL printed by the static server. The built dist directory is self-contained and can also be served by any static host.

## Try it

- The register starts with a sample order (Rs. 375.00). Use **+** for a new order or **Clear order** for an empty cart. The register menu can reload the sample.
- Filter four categories and search 16 products by name, SKU or unit. Click a card to add it. Press Enter when a search has just one result.
- Select a cart line to use the Qty, % Disc and Price keypad. Try **0.75 kg** for Red Apples, which makes the line Rs. 240.00 before discount. Counted units use whole numbers. Use **−** to remove the selected line.
- **Payment** opens a preview only. Reloading restores the initial sample.
- On a narrow screen switch between Products and Order using the bottom bar.

Demo catalog: `src/app.js`. Vue template: `src/index.html`. Styles: `src/style.css`.
