-- ============================================================
-- Migration: add khalti_pidx to orders
-- Run this if your database already exists (skip if you just ran the
-- full schema.sql, which already includes this column).
--   mysql -u root -p veggie_store < sql/migrations/003_add_khalti_pidx.sql
--
-- khalti_pidx: the payment identifier Khalti returns from
-- /epayment/initiate/. We store it on the order the moment we create
-- the pending order (before redirecting the shopper to Khalti) so that
-- when they land back on our /checkout/khalti/callback page we can look
-- the order up again by pidx and re-verify it server-side via the
-- Khalti lookup API, per Khalti's docs ("Please use the lookup API for
-- the final validation of the transaction").
-- ============================================================
USE veggie_store;

ALTER TABLE orders
    ADD COLUMN khalti_pidx VARCHAR(50) NULL AFTER payment_type,
    ADD UNIQUE KEY unique_khalti_pidx (khalti_pidx);
