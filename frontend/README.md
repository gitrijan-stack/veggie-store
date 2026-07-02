# 🥬 Vegetable Store — Online Vegetable Store

A complete, production-ready vegetable-only e-commerce website built with React 18, React Router v6, Tailwind CSS, and a global Cart Context.

---

## 📁 File Structure

```
veggie-store/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                          # React entry point
    ├── App.jsx                           # Router + CartProvider wrapper
    ├── index.css                         # Tailwind + custom tokens
    │
    ├── context/
    │   └── CartContext.jsx               # Global cart state (add/remove/qty/total)
    │
    ├── components/
    │   ├── Navbar.jsx                    # Sticky nav with scroll effect + cart button
    │   ├── Footer.jsx                    # Dark footer with newsletter input
    │   ├── CartDrawer.jsx                # Slide-in cart drawer with qty controls
    │   └── VeggieCard.jsx                # Product card (wishlist, badge, add-to-cart)
    │
    ├── pages/
    │   ├── HomePage.jsx                  # Hero, categories, products, banners, testimonials
    │   ├── ShopPage.jsx                  # Full shop with filters, sort, organic toggle
    │   ├── VeggieDetailPage.jsx          # Product detail with tabs + related items
    │   ├── AboutPage.jsx                 # Story, timeline, team, values
    │   ├── ContactPage.jsx               # Contact form + FAQ accordion
    │   └── CheckoutPage.jsx              # 2-step checkout + order confirmation
    │
    └── data/
        └── vegetables.js                 # 12 vegetables + categories + testimonials
```

---

## 🚀 Quick Start

```bash
cd veggie-store
npm install
npm run dev
# → http://localhost:5173
```

---

## 🛣️ Routes

| Route                  | Page              | Description                              |
|------------------------|-------------------|------------------------------------------|
| `/`                    | HomePage          | Full landing page                        |
| `/shop`                | ShopPage          | Browse + filter all vegetables           |
| `/shop?cat=Brassicas`  | ShopPage          | Pre-filtered by category                 |
| `/vegetable/:slug`     | VeggieDetailPage  | Individual product detail page           |
| `/about`               | AboutPage         | Brand story, team, timeline              |
| `/contact`             | ContactPage       | Contact form + FAQ                       |
| `/checkout`            | CheckoutPage      | 2-step checkout flow                     |

---

## 🎨 Design System

| Token        | Value           | Use                    |
|--------------|-----------------|------------------------|
| leaf-600     | `#1f7a1f`       | Primary green          |
| leaf-700     | `#175c17`       | Dark green             |
| soil-400     | `#de9b3f`       | Warm accent / stars    |
| cream        | `#faf9f5`       | Page background        |
| bark         | `#2c1a0e`       | Primary text           |
| Display font | Syne            | All headings           |
| Body font    | DM Sans         | All body text          |

---

## 🧩 Key Features

- ✅ **Live cart** — global context, persists across pages, slide-in drawer
- ✅ **12 vegetables** — with rich data (categories, organic flag, badges, ratings)
- ✅ **Full filtering** — by category, price range, organic toggle, search
- ✅ **Product detail pages** — with tabs (description, nutrition, storage) + related items
- ✅ **2-step checkout** — delivery details → payment → confirmation
- ✅ **Responsive** — mobile-first, hamburger menu, sidebar toggles
- ✅ **Animations** — floating elements, stagger reveals, hover micro-interactions
- ✅ **FAQ accordion** — native `<details>` with CSS transitions
- ✅ **Newsletter** — with success state
- ✅ **Scroll to top** — on every route change

---

## 📦 Dependencies

```json
"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.0"
},
"devDependencies": {
  "tailwindcss": "^3.4.1",
  "vite": "^5.1.0",
  "@vitejs/plugin-react": "^4.2.1"
}
```
