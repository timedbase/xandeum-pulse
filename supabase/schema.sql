-- Xandeum Pulse Database Schema
-- Historical data storage for pNode analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pNodes table - stores current state of all pNodes
CREATE TABLE IF NOT EXISTS pnodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pubkey TEXT UNIQUE NOT NULL,
  gossip TEXT NOT NULL,
  prpc TEXT NOT NULL,
  version TEXT NOT NULL,
  shard_version INTEGER,
  feature_set BIGINT,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'syncing')),
  uptime NUMERIC(5,2) NOT NULL,
  storage_capacity BIGINT NOT NULL, -- in GB
  storage_used BIGINT NOT NULL, -- in GB
  credits BIGINT NOT NULL,
  region TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- pNode history table - time-series data for analytics
CREATE TABLE IF NOT EXISTS pnode_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pnode_id UUID REFERENCES pnodes(id) ON DELETE CASCADE,
  pubkey TEXT NOT NULL,
  status TEXT NOT NULL,
  uptime NUMERIC(5,2) NOT NULL,
  storage_capacity BIGINT NOT NULL,
  storage_used BIGINT NOT NULL,
  credits BIGINT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Network statistics table - aggregated network metrics
CREATE TABLE IF NOT EXISTS network_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  total_nodes INTEGER NOT NULL,
  online_nodes INTEGER NOT NULL,
  total_storage BIGINT NOT NULL, -- in GB
  used_storage BIGINT NOT NULL, -- in GB
  total_credits BIGINT NOT NULL,
  avg_uptime NUMERIC(5,2) NOT NULL,
  network_version TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- pNode metrics table - detailed performance metrics
CREATE TABLE IF NOT EXISTS pnode_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pnode_id UUID REFERENCES pnodes(id) ON DELETE CASCADE,
  pubkey TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'uptime', 'storage', 'credits', etc.
  metric_value NUMERIC NOT NULL,
  metadata JSONB, -- Additional context
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pnodes_pubkey ON pnodes(pubkey);
CREATE INDEX IF NOT EXISTS idx_pnodes_status ON pnodes(status);
CREATE INDEX IF NOT EXISTS idx_pnodes_region ON pnodes(region);
CREATE INDEX IF NOT EXISTS idx_pnodes_updated_at ON pnodes(updated_at);

CREATE INDEX IF NOT EXISTS idx_pnode_history_pnode_id ON pnode_history(pnode_id);
CREATE INDEX IF NOT EXISTS idx_pnode_history_pubkey ON pnode_history(pubkey);
CREATE INDEX IF NOT EXISTS idx_pnode_history_recorded_at ON pnode_history(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_network_stats_recorded_at ON network_stats(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_pnode_metrics_pnode_id ON pnode_metrics(pnode_id);
CREATE INDEX IF NOT EXISTS idx_pnode_metrics_pubkey ON pnode_metrics(pubkey);
CREATE INDEX IF NOT EXISTS idx_pnode_metrics_type ON pnode_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_pnode_metrics_recorded_at ON pnode_metrics(recorded_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for pnodes table
DROP TRIGGER IF EXISTS update_pnodes_updated_at ON pnodes;
CREATE TRIGGER update_pnodes_updated_at
  BEFORE UPDATE ON pnodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to record pNode history on updates
CREATE OR REPLACE FUNCTION record_pnode_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pnode_history (
    pnode_id, pubkey, status, uptime, storage_capacity,
    storage_used, credits
  ) VALUES (
    NEW.id, NEW.pubkey, NEW.status, NEW.uptime, NEW.storage_capacity,
    NEW.storage_used, NEW.credits
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-record history
DROP TRIGGER IF EXISTS record_pnode_history_trigger ON pnodes;
CREATE TRIGGER record_pnode_history_trigger
  AFTER INSERT OR UPDATE ON pnodes
  FOR EACH ROW
  EXECUTE FUNCTION record_pnode_history();

-- Create views for common queries
CREATE OR REPLACE VIEW pnode_summary AS
SELECT
  p.pubkey,
  p.status,
  p.uptime,
  p.storage_capacity,
  p.storage_used,
  ROUND((p.storage_used::NUMERIC / p.storage_capacity::NUMERIC) * 100, 2) as storage_utilization,
  p.credits,
  p.region,
  p.last_seen,
  COUNT(ph.id) as history_count
FROM pnodes p
LEFT JOIN pnode_history ph ON p.id = ph.pnode_id
GROUP BY p.id, p.pubkey, p.status, p.uptime, p.storage_capacity,
         p.storage_used, p.credits, p.region, p.last_seen;

-- Create view for network health over time
CREATE OR REPLACE VIEW network_health_timeline AS
SELECT
  DATE_TRUNC('hour', recorded_at) as time_bucket,
  AVG(total_nodes) as avg_total_nodes,
  AVG(online_nodes) as avg_online_nodes,
  AVG(avg_uptime) as avg_uptime,
  AVG(used_storage::NUMERIC / total_storage::NUMERIC * 100) as avg_storage_utilization
FROM network_stats
GROUP BY DATE_TRUNC('hour', recorded_at)
ORDER BY time_bucket DESC;

-- Enable Row Level Security (RLS)
ALTER TABLE pnodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pnode_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pnode_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required)
CREATE POLICY "Public read access for pnodes" ON pnodes FOR SELECT USING (true);
CREATE POLICY "Public read access for pnode_history" ON pnode_history FOR SELECT USING (true);
CREATE POLICY "Public read access for network_stats" ON network_stats FOR SELECT USING (true);
CREATE POLICY "Public read access for pnode_metrics" ON pnode_metrics FOR SELECT USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE pnodes IS 'Current state of all pNodes in the network';
COMMENT ON TABLE pnode_history IS 'Historical time-series data for pNode metrics';
COMMENT ON TABLE network_stats IS 'Aggregated network-wide statistics over time';
COMMENT ON TABLE pnode_metrics IS 'Detailed performance metrics for individual pNodes';
