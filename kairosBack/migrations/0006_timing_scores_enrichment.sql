ALTER TABLE timing_scores
  ADD COLUMN IF NOT EXISTS timing_rank integer NOT NULL DEFAULT 99;

ALTER TABLE timing_scores
  ADD COLUMN IF NOT EXISTS signals_count integer NOT NULL DEFAULT 0;

ALTER TABLE timing_scores
  ADD COLUMN IF NOT EXISTS next_refresh_at timestamptz;

ALTER TABLE timing_scores
  ADD COLUMN IF NOT EXISTS score_version integer NOT NULL DEFAULT 1;

ALTER TABLE timing_scores
  ADD COLUMN IF NOT EXISTS status varchar(40) NOT NULL DEFAULT 'ready';

ALTER TABLE timing_scores
  ADD COLUMN IF NOT EXISTS error_message text;

ALTER TABLE timing_scores
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE timing_scores
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_timing_scores_business_service_unique
  ON timing_scores (business_id, offered_service);

CREATE INDEX IF NOT EXISTS idx_timing_scores_service_rank
  ON timing_scores (offered_service, timing_rank, timing_score, signals_count);
