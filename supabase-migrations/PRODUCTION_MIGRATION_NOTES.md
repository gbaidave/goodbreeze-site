# Production Migration Notes

## BEFORE running migration 052 on production

`ALTER TYPE ... ADD VALUE` in PostgreSQL **cannot run inside a transaction**.
Supabase SQL Editor wraps statements in a transaction, so these MUST be run as
**separate statements** — each in its own SQL Editor run — before the main migration.

### Step 1 — Run these two ALTER TYPE statements (separate click, no other SQL):

```sql
ALTER TYPE support_status ADD VALUE IF NOT EXISTS 'denied';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'refund_denied';
```

Wait for both to succeed before continuing.

### Step 2 — Run migration 052_refund_redesign.sql

The migration does:
- DROP + recreate `refund_requests` table (safe — no real prod records exist)
- Adds RLS policy on refund_requests
- Sections 5 + 6 use `ADD VALUE IF NOT EXISTS` so they are idempotent after Step 1

### Step 3 — Run migration 052b_cleanup_test_data.sql (staging only)

**DO NOT run 052b on production.** It deletes credits and resets subscriptions for
Dave's test accounts. Production accounts are real — only run on staging.

---

## Migration run status

| Migration | Staging | Production |
|-----------|---------|------------|
| 052 ALTER TYPE (support_status + notification_type) | ✅ 2026-03-21 | ⏳ pending |
| 052_refund_redesign.sql | ✅ 2026-03-21 | ⏳ pending |
| 052b_cleanup_test_data.sql | ⏳ pending (run manually when ready) | ❌ NEVER run on production |
