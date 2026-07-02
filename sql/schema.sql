-- ============================================================
-- Veggie Store — MySQL Schema (matches frontend/src/data/vegetables.js)
-- Run in MySQL Workbench:  File > Open SQL Script > Execute (⚡)
-- Or CLI:  mysql -u root -p < sql/schema.sql
-- ============================================================

DROP DATABASE IF EXISTS veggie_store;
CREATE DATABASE veggie_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use veggie_store;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    phone           VARCHAR(20),
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE addresses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    street          VARCHAR(255) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100),
    postcode        VARCHAR(20)  NOT NULL,
    country         VARCHAR(100) DEFAULT 'United Kingdom',
    is_default      BOOLEAN      DEFAULT FALSE,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- SELLERS / ADMIN
-- ============================================================
CREATE TABLE sellers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    emoji           VARCHAR(10),
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- VEGETABLES  (mirrors frontend/src/data/vegetables.js fields)
-- ============================================================
CREATE TABLE vegetables (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT NOT NULL,
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(150) NOT NULL UNIQUE,
    emoji           VARCHAR(10),
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    original_price  DECIMAL(10,2) DEFAULT NULL,
    unit            VARCHAR(20)   NOT NULL DEFAULT 'kg',
    stock_qty       INT           NOT NULL DEFAULT 100,
    restocked_at    TIMESTAMP     NULL DEFAULT NULL,
    is_organic      BOOLEAN       DEFAULT FALSE,
    pesticides_used VARCHAR(255)  DEFAULT NULL,
    in_stock        BOOLEAN       DEFAULT TRUE,
    is_active       BOOLEAN       DEFAULT TRUE,
    image_url       VARCHAR(500),
    badge           VARCHAR(30),
    badge_color     VARCHAR(30)   DEFAULT 'bg-leaf-600',
    is_featured     BOOLEAN       DEFAULT FALSE,
    rating          DECIMAL(2,1)  DEFAULT 0.0,
    review_count    INT           DEFAULT 0,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_veg_category (category_id),
    INDEX idx_veg_active (is_active),
    INDEX idx_veg_featured (is_featured)
) ENGINE=InnoDB;

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE tags (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE vegetable_tags (
    vegetable_id INT NOT NULL,
    tag_id       INT NOT NULL,
    PRIMARY KEY (vegetable_id, tag_id),
    FOREIGN KEY (vegetable_id) REFERENCES vegetables(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- CART  (matches CartContext.jsx: items with id, qty)
-- ============================================================
CREATE TABLE carts (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    cart_id      INT NOT NULL,
    vegetable_id INT NOT NULL,
    quantity     INT NOT NULL DEFAULT 1,
    added_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (vegetable_id) REFERENCES vegetables(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (cart_id, vegetable_id)
) ENGINE=InnoDB;

-- ============================================================
-- ORDERS  (matches CheckoutPage.jsx flow)
-- Status flow matches frontend/src/utils/orderStatus.js (ORDER_STATUSES +
-- CANCELLED) — keep these two in sync or the seller dashboard's "Update
-- status" dropdown will send values MySQL rejects.
-- ============================================================
CREATE TABLE orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    address_id      INT NOT NULL,
    total_amount    DECIMAL(10,2) NOT NULL,
    delivery_fee    DECIMAL(10,2) DEFAULT 0.00,
    payment_type    ENUM('COD', 'CARD', 'ONLINE') NOT NULL DEFAULT 'CARD',
    is_paid         BOOLEAN       DEFAULT FALSE,
    status          ENUM('Pending','Confirmed','Processing','Handed to Deliverer','Out for Delivery','Delivered','Cancelled')
                    DEFAULT 'Pending',
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status)
) ENGINE=InnoDB;

CREATE TABLE order_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL,
    vegetable_id    INT NOT NULL,
    vegetable_name  VARCHAR(150) NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (vegetable_id) REFERENCES vegetables(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    vegetable_id    INT NOT NULL,
    user_id         INT NOT NULL,
    rating          TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vegetable_id) REFERENCES vegetables(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (vegetable_id, user_id)
) ENGINE=InnoDB;

-- ============================================================
-- NEWSLETTER
-- ============================================================
CREATE TABLE newsletter_subscribers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    subscribed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- CONTACT MESSAGES  (from ContactPage.jsx form)
-- ============================================================
CREATE TABLE contact_messages (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    topic           VARCHAR(100),
    message         TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- SEED — Categories (matches frontend categories array)
-- ============================================================
INSERT INTO categories (name, slug, emoji) VALUES
('Leafy Greens',    'leafy-greens',    '🥬'),
('Root Vegetables', 'root-vegetables', '🥕'),
('Brassicas',       'brassicas',       '🥦'),
('Fruit Vegetables','fruit-vegetables','🍅'),
('Alliums',         'alliums',         '🧅');

-- ============================================================
-- SEED — Tags
-- ============================================================
INSERT INTO tags (name) VALUES
('Organic'), ('Local'), ('Superfood'), ('Kid-Friendly'),
('Ready-to-eat'), ('Low-Calorie'), ('Vitamin C'), ('Immune-Boost'),
('Antioxidant-Rich'), ('Kitchen Staple'), ('Hydrating'), ('Low-Carb'), ('Versatile');

-- ============================================================
-- SEED — Vegetables
-- IMPORTANT: id, name, slug, price and original_price below are copied
-- verbatim from frontend/src/data/vegetables.js so that a vegetable id
-- always refers to the same product/price on both sides of the app.
-- (The checkout flow sends only {id, qty} to POST /api/order/place —
-- the backend looks up the real price by id, so any mismatch here
-- silently overcharges/undercharges the customer vs. what they saw.)
--
-- NOTE: `rating` / `review_count` columns are no longer used to seed
-- fake numbers — the storefront now computes both live from the real
-- `reviews` table (see VegetableModel.findAll/findBySlug), so every
-- product starts at 0 reviews until an actual logged-in customer
-- leaves one.
-- ============================================================
INSERT INTO vegetables
(category_id, name, slug, emoji, description, price, original_price, unit, is_organic, image_url, badge, badge_color)
VALUES
(4, 'Tomatoes',        'tomatoes',        '🍅', 'Sun-ripened Roma tomatoes bursting with sweet, tangy flavor. Perfect for salads, sauces, and roasting.', 30.00, 40.00, '500g', TRUE,
 '/images/tomatoes.jpg', 'BESTSELLER', 'bg-red-500'),

(3, 'Broccoli',        'broccoli',        '🥦', 'Dense, vibrant green broccoli crowns harvested at peak nutrition. Ideal for steaming, stir-fry, or eating raw.', 40.00, NULL, '1 head', TRUE,
 '/images/broccoli.jpg', 'FRESH', 'bg-leaf-600'),

(3, 'Cabbage',         'cabbage',         '🫐', 'Crisp, vibrant purple cabbage packed with antioxidants. Delicious in slaws, salads, and fermented dishes.', 40.00, 50.00, '1 head', FALSE,
 '/images/cabbage.jpg', 'SALE', 'bg-purple-500'),

(1, 'Spinach',         'spinach',         '🌿', 'Tender baby spinach leaves, washed and ready to eat. Mild flavour, loaded with iron and vitamins.', 25.00, NULL, '200g bag', TRUE,
 '/images/spinach.jpg', 'POPULAR', 'bg-leaf-500'),

(2, 'Carrots',         'carrots',         '🥕', 'Sweet, crunchy organic carrots straight from the farm. Great for snacking, roasting, or juicing.', 35.00, NULL, '500g', TRUE,
 '/images/carrots.jpg', 'FRESH', 'bg-leaf-600'),

(4, 'Red Bell Pepper', 'red-bell-pepper', '🫑', 'Sweet, crisp red bell peppers with a vibrant colour and mild flavour. Excellent raw, roasted, or stuffed.', 20.00, 25.00, '1 piece', FALSE,
 '/images/red-bell-pepper.jpg', 'SALE', 'bg-red-500'),

(5, 'Garlic',          'garlic',          '🧄', 'Pungent, aromatic organic garlic. The cornerstone of great cooking — roast it whole or mince for any dish.', 30.00, NULL, '1 bulb', TRUE,
 '/images/garlic.jpg', 'BESTSELLER', 'bg-red-500'),

(4, 'Zucchini',        'courgette',       '🥒', 'Tender, mild zucchini perfect for grilling, spiralizing into noodles, or baking into bread.', 40.00, NULL, '1 piece', TRUE,
 '/images/courgette.jpg', 'NEW', 'bg-leaf-700'),

(5, 'Onion',           'onion',           '🧅', 'Classic yellow onions with rich, savoury depth. The base of countless recipes across every cuisine.', 30.00, 40.00, '500g', FALSE,
 '/images/onion.jpg', 'SALE', 'bg-soil-500'),

(2, 'Sweet Potato',    'sweet-potato',    '🍠', 'Naturally sweet, dense sweet potatoes. Roast, mash, or make fries — endlessly versatile and nutritious.', 50.00, NULL, '500g', TRUE,
 '/images/sweet-potato.jpg', 'POPULAR', 'bg-leaf-500'),

(3, 'Cauliflower',     'cauliflower',     '🌸', 'Pure white, tightly packed cauliflower heads. Steam, roast, rice, or turn into a showstopping steak.', 38.00, 40.00, '1 head', TRUE,
 '/images/cauliflower.jpg', 'SALE', 'bg-purple-500'),

(4, 'Cucumber',        'cucumber',        '🥒', 'Long, crisp English cucumbers with thin skin and minimal seeds. Refreshing in salads and sandwiches.', 30.00, NULL, '1 piece', FALSE,
 '/images/cucumber.jpg', 'FRESH', 'bg-leaf-600');

-- ============================================================
-- SEED — Vegetable Tags (matches the `tags` array on each item in
-- frontend/src/data/vegetables.js)
-- ============================================================
-- ============================================================
-- SEED — Homepage hero feature
-- The Hero card on the homepage always displays whichever vegetable has
-- is_featured = TRUE (see VegetableModel.setFeatured / SellerDashboard's
-- "Feature on homepage" button). Broccoli is the default so the hero
-- keeps working out of the box; the admin can re-point it to any
-- vegetable, and its live name/price/image will show correctly instead
-- of a stale hardcoded card.
-- ============================================================
UPDATE vegetables SET is_featured = TRUE WHERE slug = 'broccoli';

INSERT INTO vegetable_tags (vegetable_id, tag_id) VALUES
(1, 1), (1, 2),                 -- Tomatoes: Organic, Local
(2, 1), (2, 3),                 -- Broccoli: Organic, Superfood
(3, 9),                         -- Cabbage: Antioxidant-Rich
(4, 1), (4, 5),                 -- Spinach: Organic, Ready-to-eat
(5, 1), (5, 4),                 -- Carrots: Organic, Kid-Friendly
(6, 7), (6, 13),                -- Red Bell Pepper: Vitamin C, Versatile
(7, 1), (7, 8),                 -- Garlic: Organic, Immune-Boost
(8, 1), (8, 6),                 -- Zucchini: Organic, Low-Calorie
(9, 10),                        -- Onion: Kitchen Staple
(10, 1), (10, 3),               -- Sweet Potato: Organic, Superfood
(11, 1), (11, 12),              -- Cauliflower: Organic, Low-Carb
(12, 11), (12, 6);              -- Cucumber: Hydrating, Low-Calorie

-- ============================================================
-- SEED — Admin/Seller account
-- NOTE: seller login (POST /api/seller/login) compares the plaintext
-- SELLER_EMAIL / SELLER_PASSWORD from backend/.env directly — it does
-- NOT read this table. This row is only a placeholder for future use if
-- you switch seller auth to check the DB instead. Run
-- `node backend/generateHash.js yourpassword` to generate a real bcrypt
-- hash before relying on this column.
-- ============================================================
INSERT INTO sellers (name, email, password_hash) VALUES
('Admin', 'admin@veggiestore.com', '$2b$10$replace.this.with.a.real.bcrypt.hash.from.generateHash.js');

-- ============================================================
-- VIEWS
-- ============================================================
CREATE VIEW vw_vegetables_full AS
SELECT
    v.id, v.name, v.slug, v.emoji, v.description, v.price, v.original_price,
    v.unit, v.stock_qty, v.is_organic, v.in_stock, v.image_url, v.badge, v.badge_color, v.is_featured,
    COALESCE(AVG(r.rating), 0) AS rating, COUNT(r.id) AS review_count,
    c.name AS category_name, c.slug AS category_slug, c.emoji AS category_emoji
FROM vegetables v
JOIN categories c ON v.category_id = c.id
LEFT JOIN reviews r ON r.vegetable_id = v.id
WHERE v.is_active = TRUE
GROUP BY v.id;

CREATE VIEW vw_order_summary AS
SELECT
    o.id AS order_id, u.name AS customer_name, u.email,
    o.total_amount, o.payment_type, o.status, o.created_at,
    COUNT(oi.id) AS item_count
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id;

-- ============================================================
-- End of schema
-- ============================================================
