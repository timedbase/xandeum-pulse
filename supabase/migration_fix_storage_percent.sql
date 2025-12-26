-- Fix storage_usage_percent column precision
-- Changes NUMERIC(10,9) to NUMERIC(5,2) to support values 0-100.00

-- Step 1: Drop the view that depends on storage_usage_percent
DROP VIEW IF EXISTS pnode_summary;

-- Step 2: Fix pnodes table
ALTER TABLE pnodes
  ALTER COLUMN storage_usage_percent TYPE NUMERIC(5,2);

-- Step 3: Fix pnode_history table
ALTER TABLE pnode_history
  ALTER COLUMN storage_usage_percent TYPE NUMERIC(5,2);

-- Step 4: Fix network_stats table (IMPORTANT!)
ALTER TABLE network_stats
  ALTER COLUMN avg_storage_usage_percent TYPE NUMERIC(5,2);

-- Step 5: Add credits columns if not exists
ALTER TABLE pnodes
  ADD COLUMN IF NOT EXISTS credits INTEGER;

ALTER TABLE pnode_history
  ADD COLUMN IF NOT EXISTS credits INTEGER;

-- Step 6: Recreate the view with the updated column type
CREATE OR REPLACE VIEW pnode_summary AS
SELECT
  p.pubkey,
  p.status,
  p.uptime_seconds,
  p.storage_committed,
  p.storage_used,
  p.storage_usage_percent,
  p.cpu_percent,
  CASE
    WHEN p.ram_total > 0 THEN ROUND((p.ram_used::NUMERIC / p.ram_total::NUMERIC) * 100, 2)
    ELSE NULL
  END as ram_usage_percent,
  p.active_streams,
  p.region,
  p.is_public,
  p.last_seen,
  COUNT(ph.id) as history_count
FROM pnodes p
LEFT JOIN pnode_history ph ON p.id = ph.pnode_id
GROUP BY p.id, p.pubkey, p.status, p.uptime_seconds, p.storage_committed,
         p.storage_used, p.storage_usage_percent, p.cpu_percent, p.ram_used,
         p.ram_total, p.active_streams, p.region, p.is_public, p.last_seen;
