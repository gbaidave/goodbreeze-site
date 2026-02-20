-- Migration 006: Add signup_ip to profiles for IP-based rate limiting
-- Used by the frictionless route to prevent one IP from creating many throwaway accounts.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_ip TEXT;
