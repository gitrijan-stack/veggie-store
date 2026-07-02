-- ============================================================
-- Migration: add is_featured to vegetables
-- Run this if your database already exists (skip if you just ran the
-- full schema.sql, which already includes this column).
--   mysql -u root -p veggie_store < sql/migrations/001_add_is_featured.sql
-- ============================================================
USE veggie_store;

ALTER TABLE vegetables
  ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER badge_color,
  ADD INDEX idx_veg_featured (is_featured);

-- Pick a sensible default so the homepage hero has something to show.
UPDATE vegetables SET is_featured = TRUE WHERE slug = 'broccoli';
