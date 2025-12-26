-- Migration: Add total_credits column to network_stats table
-- Date: 2024-12-26
-- Description: Add total credits aggregate to network statistics

-- Add total_credits column to network_stats table
ALTER TABLE network_stats
ADD COLUMN IF NOT EXISTS total_credits BIGINT;

-- Add comment
COMMENT ON COLUMN network_stats.total_credits IS 'Total credits across all pNodes in the network';
