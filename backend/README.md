# 🥬 Veggie Store — Node.js + Express + MySQL Backend

A complete REST API backend built to pair with your existing React frontend
(`components/CartDrawer.jsx`, `Navbar.jsx`, `VeggieCard.jsx`, `context/CartContext.jsx`,
`data/vegetables.js`, `pages/*`). Uses **MySQL** (via MySQL Workbench) instead of MongoDB.

---

## 📁 File Structure

```
veggie-store-backend/
├── server.js                     # Entry point
├── package.json
├── .env                          # Environment variables (MySQL + JWT + etc.)
├── generateHash.js                # Utility to generate bcrypt password hashes
│
├── config/
│   └── db.js                     # MySQL connection pool (mysql2)
│
├── middlewares/
│   ├── authUser.js                # JWT auth for customers
│   └── authSeller.js              # JWT auth for admin/seller
│
├── models/                       # Raw SQL query layer (no ORM)
│   ├── UserModel.js
│   ├── VegetableModel.js
│   ├── CartModel.js
│   ├── AddressModel.js
│   └── OrderModel.js
│
├── controllers/
│   ├── userController.js          # register, login, logout, is-auth
│   ├── sellerController.js        # admin login
│   ├── vegetableController.js     # product CRUD
│   ├── cartController.js          # cart add/update/remove
│   ├── addressController.js       # delivery addresses
│   ├── orderController.js         # place order, order history
│   ├── categoryController.js      # category list + counts
│   └── contactController.js       # contact form + newsletter
│
├── routes/
│   ├── userRoutes.js
│   ├── sellerRoutes.js
│   ├── vegetableRoutes.js
│   ├── cartRoutes.js
│   ├── addressRoutes.js
│   ├── orderRoutes.js
│   ├── categoryRoutes.js
│   └── contactRoutes.js
│
└── sql/
    └── schema.sql                 # Full MySQL schema + seed data (12 vegetables)
```

---

## 🚀 Setup Instructions

### 1. Install dependencies

```bash
cd veggie-store-backend
npm install
```

### 2. Set up the MySQL database (via MySQL Workbench)

**Option A — MySQL Workbench GUI:**
1. Open MySQL Workbench → connect to your local server
2. `File` → `Open SQL Script` → select `sql/schema.sql`
3. Click the ⚡ **Execute** button (or `Ctrl+Shift+Enter`) to run the whole file
4. This creates the `veggie_store` database with all 12 tables + seed data (12 vegetables, 5 categories, 13 tags)

**Option B — Command line:**
```bash
mysql -u root -p < sql/schema.sql
```

### 3. Configure `.env`

Open `.env` and update these two lines with **your actual MySQL Workbench password**:

```env
DB_USER=root
DB_PASSWORD=your_mysql_password    # ← the password you set in MySQL Workbench
DB_NAME=veggie_store
```

Everything else can stay as default for local development.

### 4. Run the server

```bash
npm run dev
```

You should see:
```
✅ MySQL Database connected: veggie_store
🚀 Server running on http://localhost:4000
```

### 5. Connect your frontend

In your **frontend** `.env` (or wherever `VITE_BACKEND_URL` is set):
```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## 🛣️ API Routes

### Users — `/api/user`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Login |
| GET | `/logout` | — | Logout |
| GET | `/is-auth` | ✅ user | Check session |

### Seller/Admin — `/api/seller`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/login` | — | Admin login (uses `SELLER_EMAIL`/`SELLER_PASSWORD` from `.env`) |
| GET | `/is-auth` | ✅ seller | Check admin session |
| GET | `/logout` | — | Logout |

### Vegetables — `/api/vegetable`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/list` | — | List all (supports `?category=`, `?search=`, `?organicOnly=true`, `?maxPrice=`, `?sortBy=`) |
| GET | `/:slug` | — | Get one + related items |
| POST | `/add` | ✅ seller | Add new vegetable |
| PUT | `/:id` | ✅ seller | Update vegetable |
| DELETE | `/:id` | ✅ seller | Soft-delete (deactivate) |

### Cart — `/api/cart`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ user | Get cart items |
| POST | `/add` | ✅ user | Add item `{ vegetableId, qty }` |
| POST | `/update` | ✅ user | Update qty `{ vegetableId, qty }` |
| POST | `/remove` | ✅ user | Remove item `{ vegetableId }` |
| POST | `/clear` | ✅ user | Empty cart |

### Address — `/api/address`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/add` | ✅ user | Add delivery address |
| GET | `/list` | ✅ user | List user's addresses |
| DELETE | `/:id` | ✅ user | Remove address |

### Orders — `/api/order`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/place` | ✅ user | Place order `{ addressId, items, paymentType }` |
| GET | `/my-orders` | ✅ user | User's order history |
| GET | `/all` | ✅ seller | All orders (admin) |
| PUT | `/:id/status` | ✅ seller | Update order status |

### Categories — `/api/category`
| Method | Route | Description |
|---|---|---|
| GET | `/list` | All categories with live product counts |

### Contact — `/api/contact`
| Method | Route | Description |
|---|---|---|
| POST | `/submit` | Contact form `{ name, email, topic, message }` |
| POST | `/newsletter` | Newsletter signup `{ email }` |

---

## 🗄️ Database Schema Overview

12 tables: `users`, `addresses`, `sellers`, `categories`, `vegetables`, `tags`,
`vegetable_tags`, `carts`, `cart_items`, `orders`, `order_items`, `reviews`,
`newsletter_subscribers`, `contact_messages`.

Pre-seeded with the **same 12 vegetables** as your frontend's `data/vegetables.js`
(Roma Tomatoes, Broccoli Crown, Purple Cabbage, Baby Spinach, Orange Carrots,
Red Bell Pepper, White Garlic Bulb, Courgette, Yellow Onion, Sweet Potato,
Cauliflower, English Cucumber) across 5 categories.

Two views included for convenience:
- `vw_vegetables_full` — vegetables joined with category info
- `vw_order_summary` — order overview for admin dashboards

---

## 🔐 Authentication Flow

- **Users**: JWT stored in `httpOnly` cookie named `token`
- **Sellers/Admin**: JWT stored in `httpOnly` cookie named `sellerToken`, checked against `SELLER_EMAIL` / `SELLER_PASSWORD` in `.env`
- Passwords hashed with `bcryptjs` (10 rounds) before storing in `users.password_hash`

---

## 🧪 Quick Test (after starting server)

```bash
# Health check
curl http://localhost:4000/

# List all vegetables
curl http://localhost:4000/api/vegetable/list

# List categories
curl http://localhost:4000/api/category/list

# Register a user
curl -X POST http://localhost:4000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@test.com","password":"test1234"}'
```

---

## 📦 Dependencies

```json
"dependencies": {
  "express": "^4.19.2",
  "mysql2": "^3.11.0",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^16.5.0"
},
"devDependencies": {
  "nodemon": "^3.1.10"
}
```

---

## ⚠️ Troubleshooting

| Problem | Fix |
|---|---|
| `❌ MySQL connection failed` | Check MySQL Workbench is running, and `DB_PASSWORD` in `.env` matches your local root password |
| `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER`/`DB_PASSWORD` combo — verify in Workbench under Users & Privileges |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL server isn't running — start it from MySQL Workbench or your OS services |
| CORS errors in browser | Make sure `FRONTEND_URL` in `.env` matches your frontend's actual dev URL (default `http://localhost:5173`) |
| `Table 'veggie_store.xxx' doesn't exist` | Re-run `sql/schema.sql` — it wasn't fully executed |
