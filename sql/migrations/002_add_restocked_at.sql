-- ============================================================
-- Migration: add restocked_at to vegetables
-- Run this if your database already exists (skip if you just ran the
-- full schema.sql, which already includes this column).
--   mysql -u root -p veggie_store < sql/migrations/002_add_restocked_at.sql
-- ============================================================
USE veggie_store;

ALTER TABLE vegetables
  ADD COLUMN restocked_at TIMESTAMP NULL DEFAULT NULL AFTER stock_qty;
