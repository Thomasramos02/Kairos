CREATE TABLE IF NOT EXISTS timing_stage_history (
  id varchar(80) PRIMARY KEY,
  business_id varchar(80) NOT NULL REFERENCES businesses (id),
  offered_service varchar(80) NOT NULL,
  previous_stage varchar(80),
  next_stage varchar(80) NOT NULL,
  timing_score integer NOT NULL,
  reason text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS timing_stage_history_business_idx
  ON timing_stage_history (business_id, offered_service, changed_at DESC);
