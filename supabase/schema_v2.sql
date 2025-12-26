-- Xandeum Pulse Database Schema V2
-- Enhanced schema with detailed stats tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pNodes table - stores current state of all pNodes with detailed stats
CREATE TABLE IF NOT EXISTS pnodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  node_id TEXT, -- ID from pNode API (if different from pubkey)
  pubkey TEXT UNIQUE NOT NULL,
  gossip TEXT NOT NULL,
  prpc TEXT NOT NULL,
  version TEXT NOT NULL,

  -- Status fields
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'syncing')),
  is_public BOOLEAN DEFAULT false,
  region TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Storage fields (from get-pods-with-stats)
  storage_committed BIGINT NOT NULL, -- in bytes
  storage_used BIGINT NOT NULL, -- in bytes
  storage_usage_percent NUMERIC(5,2), -- percentage (0-100.00)

  -- Uptime field (from get-pods-with-stats)
  uptime_seconds BIGINT NOT NULL, -- uptime in seconds

  -- Stats fields (from get-stats - if available per node)
  cpu_percent NUMERIC(5,2), -- CPU usage percentage
  ram_used BIGINT, -- RAM used in bytes
  ram_total BIGINT, -- Total RAM in bytes
  packets_received INTEGER, -- Packets received per second
  packets_sent INTEGER, -- Packets sent per second
  active_streams INTEGER, -- Number of active network streams

  -- Metadata fields (from get-stats)
  total_bytes BIGINT, -- Total bytes processed
  total_pages INTEGER, -- Total pages in storage
  file_size BIGINT, -- Storage file size in bytes
  metadata_last_updated TIMESTAMPTZ, -- Last metadata update

  -- Credits (from credits API)
  credits INTEGER, -- Credits earned by this pod

  -- Timestamps
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

  -- Storage snapshot
  storage_committed BIGINT NOT NULL,
  storage_used BIGINT NOT NULL,
  storage_usage_percent NUMERIC(5,2),

  -- Performance snapshot
  uptime_seconds BIGINT NOT NULL,
  cpu_percent NUMERIC(5,2),
  ram_used BIGINT,
  packets_received INTEGER,
  packets_sent INTEGER,
  active_streams INTEGER,

  -- Credits snapshot
  credits INTEGER,

  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Network statistics table - aggregated network metrics
CREATE TABLE IF NOT EXISTS network_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  total_nodes INTEGER NOT NULL,
  online_nodes INTEGER NOT NULL,

  -- Storage aggregates
  total_storage_committed BIGINT NOT NULL, -- in bytes
  total_storage_used BIGINT NOT NULL, -- in bytes
  avg_storage_usage_percent NUMERIC(5,2), -- percentage (0-100.00)

  -- Performance aggregates
  avg_uptime_seconds BIGINT NOT NULL,
  avg_cpu_percent NUMERIC(5,2),
  avg_ram_usage_percent NUMERIC(5,2),
  total_active_streams INTEGER,

  network_version TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pnodes_pubkey ON pnodes(pubkey);
CREATE INDEX IF NOT EXISTS idx_pnodes_status ON pnodes(status);
CREATE INDEX IF NOT EXISTS idx_pnodes_region ON pnodes(region);
CREATE INDEX IF NOT EXISTS idx_pnodes_updated_at ON pnodes(updated_at);
CREATE INDEX IF NOT EXISTS idx_pnodes_is_public ON pnodes(is_public);

CREATE INDEX IF NOT EXISTS idx_pnode_history_pnode_id ON pnode_history(pnode_id);
CREATE INDEX IF NOT EXISTS idx_pnode_history_pubkey ON pnode_history(pubkey);
CREATE INDEX IF NOT EXISTS idx_pnode_history_recorded_at ON pnode_history(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_network_stats_recorded_at ON network_stats(recorded_at DESC);

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
    pnode_id, pubkey, status, storage_committed, storage_used,
    storage_usage_percent, uptime_seconds, cpu_percent, ram_used,
    packets_received, packets_sent, active_streams
  ) VALUES (
    NEW.id, NEW.pubkey, NEW.status, NEW.storage_committed, NEW.storage_used,
    NEW.storage_usage_percent, NEW.uptime_seconds, NEW.cpu_percent, NEW.ram_used,
    NEW.packets_received, NEW.packets_sent, NEW.active_streams
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

-- Enable Row Level Security (RLS)
ALTER TABLE pnodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pnode_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required)
DROP POLICY IF EXISTS "Public read access for pnodes" ON pnodes;
CREATE POLICY "Public read access for pnodes" ON pnodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for pnode_history" ON pnode_history;
CREATE POLICY "Public read access for pnode_history" ON pnode_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for network_stats" ON network_stats;
CREATE POLICY "Public read access for network_stats" ON network_stats FOR SELECT USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE pnodes IS 'Current state of all pNodes with detailed performance metrics';
COMMENT ON TABLE pnode_history IS 'Historical time-series data for pNode metrics and performance';
COMMENT ON TABLE network_stats IS 'Aggregated network-wide statistics over time';
COMMENT ON COLUMN pnodes.storage_committed IS 'Storage capacity committed by node in bytes';
COMMENT ON COLUMN pnodes.storage_used IS 'Actual storage used by node in bytes';
COMMENT ON COLUMN pnodes.uptime_seconds IS 'Node uptime in seconds';
COMMENT ON COLUMN pnodes.cpu_percent IS 'CPU usage percentage (0-100)';
COMMENT ON COLUMN pnodes.ram_used IS 'RAM used in bytes';
COMMENT ON COLUMN pnodes.ram_total IS 'Total RAM available in bytes';
