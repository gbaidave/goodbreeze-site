-- Migration 055: Add business_scorecard report_type and scorecard product_type
-- Required before Business Scorecard V1 workflow can write to the reports table.
-- Run each ALTER TYPE statement as a SEPARATE query in Supabase SQL editor
-- (ALTER TYPE ADD VALUE cannot run inside a transaction with other statements).

ALTER TYPE public.report_type ADD VALUE IF NOT EXISTS 'business_scorecard';

ALTER TYPE public.product_type ADD VALUE IF NOT EXISTS 'scorecard';
