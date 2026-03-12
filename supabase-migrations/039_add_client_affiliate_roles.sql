-- Migration 039: Add 'client' and 'affiliate' to user_role ENUM
--
-- MUST BE RUN IN 2 SEPARATE PASTES in Supabase SQL Editor.
-- PostgreSQL cannot use a new ENUM value in the same transaction that created it.
-- Paste each block separately and click Run between each one.
--
-- ============================================================
-- PASTE 1 OF 2 — Run this alone first, then click Run
-- ============================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';

-- ============================================================
-- PASTE 2 OF 2 — Run this after the first paste is committed
-- ============================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'affiliate';
