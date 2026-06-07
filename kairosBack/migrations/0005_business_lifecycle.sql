ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS lifecycle_stage varchar(40) NOT NULL DEFAULT 'candidate';

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS businesses_lifecycle_stage_idx
  ON businesses (lifecycle_stage);
